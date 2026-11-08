import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

const libraryBrief =
  'A mobile-first public library service for rural towns. Residents search the shared book catalogue, reserve books for branch pickup, join reading circles, and find local author events. Volunteers coordinate opening hours and hold queues across three branches. Make browsing work on weak connections, provide large text and screen-reader friendly controls, and keep member reading history private. No book sales, purchases, payments, bank accounts, bill pay, or financial dashboards.';
const expectedScreens = [
  'Catalogue & Branch Availability',
  'Holds & Pickup',
  'Reading Circles & Events',
  'Accessibility & Privacy',
];

function collectUnresolvedRoles(value: unknown, roles: string[] = []): string[] {
  if (!value || typeof value !== 'object') return roles;
  if (Array.isArray(value)) {
    for (const item of value) collectUnresolvedRoles(item, roles);
    return roles;
  }

  const record = value as Record<string, unknown>;
  const props = record.props;
  if (
    props &&
    typeof props === 'object' &&
    !Array.isArray(props) &&
    (props as Record<string, unknown>).unresolvedRequiredRole === true &&
    typeof record.semanticRole === 'string'
  ) {
    roles.push(record.semanticRole);
  }
  for (const child of Object.values(record)) collectUnresolvedRoles(child, roles);
  return roles;
}

test('public library brief preserves lending, programme, accessibility, and privacy needs', async ({
  page,
  isMobile,
}, testInfo) => {
  test.setTimeout(120_000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const runtimeLabel = testInfo.project.name.startsWith('sites-') ? 'sites-' : '';
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/AUD-525');
  mkdirSync(evidenceDirectory, { recursive: true });
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', {
    timeout: 15_000,
  });
  await page.locator('#description').fill(libraryBrief);
  await page
    .locator('#feel')
    .fill('welcoming, quietly literary, low-bandwidth, dignified, accessible, locally grounded');
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByText('Your brief points to: Public Library Service.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planned screens (4)' })).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  for (const screen of expectedScreens) expect(bodyText).toContain(screen);
  expect(bodyText).not.toMatch(
    /your brief points to: fintech|your brief points to: ecommerce|your brief points to: b2b saas/i
  );
  expect(bodyText).not.toMatch(
    /account balances|transaction history|money movement and reconciliation|finance managers|billing & usage|marketing home|projects index|team & permissions/i
  );

  const rolesByScreen: Record<string, string[]> = {
    'Catalogue & Branch Availability': [
      'book-catalogue-search',
      'branch-availability-and-hours',
      'low-bandwidth-catalogue-browsing',
    ],
    'Holds & Pickup': ['private-hold-requests', 'branch-pickup-windows'],
    'Reading Circles & Events': ['reading-circle-and-event-discovery'],
    'Accessibility & Privacy': ['accessible-reading-controls', 'private-reading-history'],
  };
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Expected a fixed desktop or mobile viewport.');
  const directions: Array<{ number: string; visibleText: string; selectedScreens: string[] }> = [];
  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card).toBeVisible();
    const preview = page.getByTestId(`direction-preview-${number}`);
    await expect(preview.getByTestId('resource-loading')).toHaveCount(0, { timeout: 30_000 });
    const visibleText = await card.innerText();
    expect(visibleText).toContain('4 SCREENS');

    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog');
    const screenSelect = dialog.getByLabel('Direction preview screen');
    const dialogBounds = await dialog.boundingBox();
    expect(dialogBounds).not.toBeNull();
    expect(dialogBounds!.x).toBeGreaterThanOrEqual(0);
    expect(dialogBounds!.y).toBeGreaterThanOrEqual(0);
    expect(dialogBounds!.x + dialogBounds!.width).toBeLessThanOrEqual(viewport.width);
    expect(dialogBounds!.y + dialogBounds!.height).toBeLessThanOrEqual(viewport.height);

    const selectedScreens: string[] = [];
    for (const screen of expectedScreens) {
      await screenSelect.selectOption({ label: screen });
      await expect(screenSelect.locator('option:checked')).toHaveText(screen);
      for (const role of rolesByScreen[screen]!) {
        await expect(
          dialog.getByTestId('unresolved-required-role-diagnostic').filter({ hasText: role })
        ).toBeVisible();
      }
      selectedScreens.push(screen);
    }
    await expect(dialog).not.toContainText(/local reporting|newsroom catalogue/i);
    await page.getByRole('button', { name: 'Close dialog' }).click();
    directions.push({ number, visibleText, selectedScreens });
  }

  const responsive = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(responsive.documentWidth).toBeLessThanOrEqual(responsive.viewportWidth);
  await page.screenshot({
    path: path.join(
      evidenceDirectory,
      `public-library-compose-${runtimeLabel}${viewportLabel}.png`
    ),
    fullPage: true,
    animations: 'disabled',
  });
  writeFileSync(
    path.join(evidenceDirectory, `public-library-${runtimeLabel}${viewportLabel}.json`),
    `${JSON.stringify({ url: page.url(), viewport: page.viewportSize(), brief: libraryBrief, bodyText, directions, responsive, runtime }, null, 2)}\n`
  );

  await page.getByTestId('open-workbench-dir-01').click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 45_000 });
  if (isMobile) await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  else await expect(page.getByTestId('workbench-shell')).toBeVisible();

  const activeValue = await page.evaluate(() => {
    const record = localStorage.getItem('tessellate_active_project');
    return record ? JSON.parse(record) : null;
  });
  const activeManifest = ProjectManifestSchema.parse(activeValue);
  const storedValue = await page.evaluate((projectId) => {
    const record = localStorage.getItem(`tessellate_project_${projectId}`);
    return record ? JSON.parse(record) : null;
  }, activeManifest.id);
  expect(ProjectManifestSchema.parse(storedValue)).toEqual(activeManifest);
  expect(activeManifest.productModel.productArchetypes[0]?.tag).toBe('media');
  expect(activeManifest.productModel.entities.map(({ name }) => name)).toEqual([
    'BookRecord',
    'HoldRequest',
    'LibraryBranch',
    'LibraryProgramme',
  ]);
  expect(activeManifest.productModel.workflows.map(({ id }) => id)).toEqual([
    'discover-library-items',
    'coordinate-private-holds',
    'find-reading-programmes',
    'set-reading-accessibility',
  ]);
  expect(activeManifest.productModel.likelyScreens.map(({ name }) => name)).toEqual(
    expectedScreens
  );

  const expectedUnresolvedRoles = [
    'book-catalogue-search',
    'branch-availability-and-hours',
    'low-bandwidth-catalogue-browsing',
    'private-hold-requests',
    'branch-pickup-windows',
    'reading-circle-and-event-discovery',
    'accessible-reading-controls',
    'private-reading-history',
  ];
  const unresolvedRoles = collectUnresolvedRoles(activeManifest);
  for (const role of expectedUnresolvedRoles) expect(unresolvedRoles).toContain(role);

  await page.getByTestId('export-button').click();
  const downloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPending;
  const manifestPath = await download.path();
  expect(manifestPath).not.toBeNull();
  const exportedManifest = ProjectManifestSchema.parse(
    JSON.parse(readFileSync(manifestPath!, 'utf8'))
  );
  expect(exportedManifest).toEqual(activeManifest);

  const workbenchResponsive = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(workbenchResponsive.documentWidth).toBeLessThanOrEqual(workbenchResponsive.viewportWidth);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await page.screenshot({
    path: path.join(
      evidenceDirectory,
      `public-library-workbench-${runtimeLabel}${viewportLabel}.png`
    ),
    fullPage: true,
    animations: 'disabled',
  });
  writeFileSync(
    path.join(evidenceDirectory, `public-library-workbench-${runtimeLabel}${viewportLabel}.json`),
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        projectId: activeManifest.id,
        storedManifestMatchesActive: true,
        exportedManifestMatchesActive: true,
        entities: activeManifest.productModel.entities.map(({ name }) => name),
        workflows: activeManifest.productModel.workflows.map(({ id }) => id),
        screens: activeManifest.productModel.likelyScreens.map(({ name }) => name),
        unresolvedRoles,
        responsive: workbenchResponsive,
        runtime,
      },
      null,
      2
    )}\n`
  );
});
