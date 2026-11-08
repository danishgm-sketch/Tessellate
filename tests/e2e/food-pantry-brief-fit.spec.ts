import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const foodPantryBrief =
  'An appointment and fulfilment tool for a volunteer-led community food pantry serving 300 households each week. Households choose weekly grocery packs; staff coordinate same-day emergency parcels, chilled stock and expiry dates, multilingual plain-language pickup instructions, and a waitlist. Volunteers use shared tablets, coordinators use desktop, and intake often happens on an unreliable connection. Collect only a household’s chosen name and pickup essentials: do not request proof of immigration, income, medical diagnosis, or payment. Allergy details are visible only to assigned food-safety coordinators; volunteers see a neutral packing alert, not private notes. Provide a separate safeguarding escalation route without exposing case notes. No payments or donations.';

type ScreenSnapshot = {
  id: string;
  name: string;
};

function collectUnresolvedRoles(value: unknown, roles: string[] = []): string[] {
  if (!value || typeof value !== 'object') return roles;
  if (Array.isArray(value)) {
    for (const item of value) collectUnresolvedRoles(item, roles);
    return roles;
  }

  const record = value as Record<string, unknown>;
  const props = record.props as Record<string, unknown> | undefined;
  if (props?.unresolvedRequiredRole === true && typeof record.semanticRole === 'string') {
    roles.push(record.semanticRole);
  }
  for (const child of Object.values(record)) collectUnresolvedRoles(child, roles);
  return roles;
}

const expectedScreens = [
  'Pickup Schedule & Waitlist',
  'Household Intake & Pickup',
  'Weekly Pack Choices',
  'Emergency Parcels',
  'Stock & Expiry',
  'Food Safety & Safeguarding',
];

const expectedDomainRoles = [
  'pickup-capacity-calendar',
  'waitlist-queue',
  'emergency-parcel-priorities',
  'minimal-household-intake',
  'chosen-name-only',
  'offline-intake-continuity',
  'multilingual-pickup-instructions',
  'weekly-pack-selection',
  'pack-substitution-review',
  'same-day-parcel-queue',
  'privacy-preserving-packing-alert',
  'chilled-stock-inventory',
  'expiry-aware-stock-rotation',
  'assigned-coordinator-allergy-details',
  'neutral-volunteer-alert',
  'private-safeguarding-route',
  'case-note-confidentiality',
];

test('community food pantry brief preserves privacy constraints and renders its planned screens', async ({
  page,
  isMobile,
}, testInfo) => {
  test.setTimeout(180_000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/AUD-522');
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
  await page.locator('#description').fill(foodPantryBrief);
  await page.locator('#feel').fill(
    'dignified, calm, practical, multilingual, private by default, clear for volunteers on mobile'
  );
  await page.getByRole('button', { name: 'Stunning', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByText('Your brief points to: Community Food Pantry Operations.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planned screens (6)' })).toBeVisible();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  await expect(page.locator('body')).not.toContainText('Finance managers, compliance teams, and account holders');
  await expect(page.locator('body')).not.toContainText('Account Balances');
  for (const number of ['01', '02', '03']) {
    const preview = page.getByTestId(`direction-preview-${number}`);
    await expect(preview.getByTestId('resource-loading')).toHaveCount(0, { timeout: 30_000 });
    await expect(preview.getByRole('heading', { name: expectedScreens[0] })).toBeVisible();
    await expect(preview.getByTestId('unresolved-required-role-diagnostic')).toHaveCount(3);
  }
  await page.screenshot({
    path: path.join(evidenceDirectory, `food-pantry-compose-${viewportLabel}.png`),
    fullPage: true,
    animations: 'disabled',
  });

  const pageCopy = await page.locator('body').innerText();
  const directionEvidence = [];
  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card).toBeVisible();
    if (number === '01') {
      await card.screenshot({
        path: path.join(evidenceDirectory, `food-pantry-direction-01-${viewportLabel}.png`),
        animations: 'disabled',
      });
    }
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();

    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    const details = dialog.locator('details').filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const snapshot = JSON.parse(await details.locator('pre').innerText()) as {
      screens: ScreenSnapshot[];
      diagnostics: Array<{ role: string; message?: string }>;
    };
    expect(snapshot.screens.map((screen) => screen.name)).toEqual(expectedScreens);
    expect(snapshot.diagnostics.map((diagnostic) => diagnostic.role)).toEqual(
      expect.arrayContaining(expectedDomainRoles)
    );
    await details.locator('summary').click();

    const select = dialog.getByRole('combobox', { name: 'Direction preview screen' });
    const screenEvidence = [];
    for (const screen of snapshot.screens) {
      await select.selectOption(screen.id);
      await expect(select).toHaveValue(screen.id);
      const canvas = dialog.locator('.tess-screen');
      await expect(canvas).toHaveAttribute('data-screen-id', screen.id);
      await expect(dialog.getByTestId('resource-loading')).toHaveCount(0, { timeout: 15_000 });
      const visibleText = await canvas.innerText();
      const visibleHeadings = await canvas.getByRole('heading').allTextContents();
      screenEvidence.push({
        id: screen.id,
        name: screen.name,
        visibleText,
        visibleHeadings,
        unresolvedRoles: await canvas
          .getByTestId('unresolved-required-role-diagnostic')
          .allTextContents(),
      });
      expect(visibleHeadings).toContain(screen.name);
      expect(visibleText).not.toMatch(/account balances|bank statements|money movement|transfer funds/i);

      if (number === '01') {
        const screenshotPath = path.join(
          evidenceDirectory,
          `food-pantry-screen-${screen.id}-${viewportLabel}.png`
        );
        await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
        await testInfo.attach(`food-pantry-screen-${screen.id}-${viewportLabel}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }
    }

    directionEvidence.push({
      number,
      screens: snapshot.screens,
      diagnostics: snapshot.diagnostics,
      renderedScreens: screenEvidence,
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  const responsive = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(responsive.documentWidth).toBeLessThanOrEqual(responsive.viewportWidth);

  writeFileSync(
    path.join(evidenceDirectory, `food-pantry-${viewportLabel}.json`),
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        brief: foodPantryBrief,
        pageCopy,
        directions: directionEvidence,
        responsive,
        runtime,
      },
      null,
      2
    )}\n`
  );
});

test('community pantry unresolved roles stay explicit in Workbench and block incomplete application export', async ({
  page,
  isMobile,
}) => {
  test.setTimeout(180_000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/AUD-523');
  mkdirSync(evidenceDirectory, { recursive: true });
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as string[],
  };
  let zipDownloaded = false;

  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`);
  });
  page.on('download', (download) => {
    if (download.suggestedFilename().endsWith('.zip')) zipDownloaded = true;
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', {
    timeout: 15_000,
  });
  await page.locator('#description').fill(foodPantryBrief);
  await page.locator('#feel').fill(
    'dignified, calm, practical, multilingual, private by default, clear for volunteers on mobile'
  );
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByTestId('direction-card-01')).toContainText('17 required interface roles');
  await page.getByTestId('open-workbench-dir-01').click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 45_000 });

  await page.getByTestId('export-button').click();
  const exportMenu = page.getByTestId('export-menu');
  await expect(exportMenu).toBeVisible();
  const exportMenuBounds = await exportMenu.boundingBox();
  const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  expect(exportMenuBounds).not.toBeNull();
  expect(exportMenuBounds!.x).toBeGreaterThanOrEqual(0);
  expect(exportMenuBounds!.y).toBeGreaterThanOrEqual(0);
  expect(exportMenuBounds!.x + exportMenuBounds!.width).toBeLessThanOrEqual(viewport.width);
  expect(exportMenuBounds!.y + exportMenuBounds!.height).toBeLessThanOrEqual(viewport.height);
  await page.getByTestId('export-zip-btn').click();
  const exportAlert = page.getByRole('alert');
  await expect(exportAlert).toContainText('Cannot generate a runnable application export');
  await expect(exportAlert).toContainText('17 required interface roles are unresolved across 6 screens');
  await expect(exportAlert).toContainText('Resolve each role before exporting');
  const roleDetails = exportAlert.locator('details');
  await expect(roleDetails.locator('summary')).toHaveText('Review 17 unresolved roles');
  await roleDetails.locator('summary').click();
  await expect(roleDetails).toContainText('pickup-capacity-calendar — Pickup Schedule & Waitlist');
  await expect(exportAlert).toContainText('pickup-capacity-calendar');
  await roleDetails.locator('summary').click();
  await page.waitForTimeout(200);
  expect(zipDownloaded).toBe(false);

  await page.getByTestId('export-button').click();
  const manifestDownloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const manifestDownload = await manifestDownloadPending;
  expect(manifestDownload.suggestedFilename()).toMatch(/\.tess\.json$/);
  const downloadedManifestPath = await manifestDownload.path();
  expect(downloadedManifestPath).not.toBeNull();
  const downloadedManifest = JSON.parse(readFileSync(downloadedManifestPath!, 'utf8')) as unknown;
  const unresolvedRoles = collectUnresolvedRoles(downloadedManifest);
  expect(unresolvedRoles).toHaveLength(17);
  expect(unresolvedRoles).toContain('pickup-capacity-calendar');

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await page.screenshot({
    path: path.join(evidenceDirectory, `unresolved-roles-export-blocked-${viewportLabel}.png`),
    fullPage: true,
    animations: 'disabled',
  });
  writeFileSync(
    path.join(evidenceDirectory, `unresolved-roles-export-${viewportLabel}.json`),
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        zipDownloaded,
        exportAlert: await exportAlert.innerText(),
        manifestPreservedUnresolvedRoleCount: unresolvedRoles.length,
        runtime,
      },
      null,
      2
    )}\n`,
    'utf8'
  );
});
