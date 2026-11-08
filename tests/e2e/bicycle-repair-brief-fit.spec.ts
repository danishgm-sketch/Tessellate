import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const bicycleRepairBrief =
  'A neighborhood bicycle repair co-op for eight mechanics and two front-desk volunteers: same-day intake, safety triage for brakes and steering, parts availability, consented repair estimates, and pickup readiness. The shared workbench runs on a counter tablet and desktop. Do not handle payments.';

const expectedScreens = [
  'Service Desk',
  'Repair Intake',
  'Safety Inspection',
  'Parts & Estimates',
  'Pickup & Handover',
];

const unresolvedRolesByScreen: Record<string, string[]> = {
  'Service Desk': ['safety-triage-queue', 'priority-alerts'],
  'Repair Intake': ['repair-intake-form', 'reported-issue-capture'],
  'Safety Inspection': ['brake-steering-checklist', 'inspection-evidence'],
  'Parts & Estimates': ['parts-availability', 'consented-repair-estimate'],
  'Pickup & Handover': ['safety-signoff', 'pickup-readiness'],
};

test('bicycle repair brief composes consent-aware service workflows', async ({
  page,
  isMobile,
}, testInfo) => {
  test.setTimeout(90000);
  const viewportLabel = isMobile ? 'mobile' : 'desktop';
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/AUD-521');
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
    timeout: 15000,
  });
  await page.locator('#description').fill(bicycleRepairBrief);
  await page.locator('#feel').fill('warm workshop, precise, reassuring, tactile, high-contrast');
  await page.getByRole('button', { name: 'Stunning', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByText('Your brief points to: Bicycle Repair Operations.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Planned screens (5)' })).toBeVisible();
  await expect(page.getByText('Payment and purchase steps need clear confirmation.')).toHaveCount(0);
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);

  const directionEvidence = [];
  for (const number of ['01', '02', '03']) {
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card).toBeVisible();
    await expect(page.getByTestId(`direction-diagnostics-summary-${number}`)).toContainText(
      'required interface roles have no eligible resource in the current catalogue.'
    );
    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();

    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    const select = dialog.getByRole('combobox', { name: 'Direction preview screen' });
    const details = dialog.locator('details').filter({ hasText: 'Design DNA and resource references' });
    await details.locator('summary').click();
    const snapshot = JSON.parse(await details.locator('pre').innerText()) as {
      screens: Array<{ id: string; name: string }>;
      diagnostics: Array<{ role: string }>;
    };
    await details.locator('summary').click();

    expect(snapshot.screens.map((screen) => screen.name)).toEqual(expectedScreens);
    const domainDiagnosticRoles = Object.values(unresolvedRolesByScreen).flat();
    expect(snapshot.diagnostics.map((diagnostic) => diagnostic.role)).toEqual(
      expect.arrayContaining(domainDiagnosticRoles)
    );

    const renderedScreenRoles = [];
    for (const screen of snapshot.screens) {
      await select.selectOption(screen.id);
      await expect(select).toHaveValue(screen.id);
      const canvas = dialog.locator('.tess-screen');
      await expect(canvas).toHaveAttribute('data-screen-id', screen.id);
      await expect(dialog.getByTestId('resource-loading')).toHaveCount(0, { timeout: 15000 });
      await expect(canvas.getByRole('heading', { name: screen.name })).toBeVisible();

      const expectedUnresolvedRoles = unresolvedRolesByScreen[screen.name] ?? [];
      const diagnostics = canvas.getByTestId('unresolved-required-role-diagnostic');
      await expect(diagnostics).toHaveCount(expectedUnresolvedRoles.length);
      for (const role of expectedUnresolvedRoles) {
        await expect(
          diagnostics.filter({ hasText: `Unresolved Required Role: ${role}` })
        ).toBeVisible();
      }
      renderedScreenRoles.push({ screen: screen.name, unresolvedRoles: expectedUnresolvedRoles });

      if (number === '01') {
        const screenshotPath = path.join(
          evidenceDirectory,
          `bicycle-repair-${screen.id}-${viewportLabel}.png`
        );
        mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await dialog.screenshot({ path: screenshotPath, animations: 'disabled' });
        await testInfo.attach(`bicycle-repair-${screen.id}-${viewportLabel}`, {
          path: screenshotPath,
          contentType: 'image/png',
        });
      }
    }

    directionEvidence.push({
      number,
      screens: snapshot.screens.map((screen) => screen.name),
      diagnostics: snapshot.diagnostics.map((diagnostic) => diagnostic.role),
      renderedScreenRoles,
    });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  const responsive = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));
  expect(responsive.documentWidth).toBeLessThanOrEqual(responsive.viewportWidth);
  expect(runtime).toEqual({
    consoleErrors: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
  });

  writeFileSync(
    path.join(evidenceDirectory, `bicycle-repair-${viewportLabel}.json`),
    `${JSON.stringify(
      {
        url: page.url(),
        viewport: page.viewportSize(),
        brief: bicycleRepairBrief,
        directions: directionEvidence,
        responsive,
        runtime,
      },
      null,
      2
    )}\n`
  );
});
