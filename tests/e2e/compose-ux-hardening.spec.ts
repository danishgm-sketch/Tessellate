import { expect, test } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

const evidenceDirectory = path.resolve(
  process.cwd(),
  'quality/evidence/step-15',
  process.env.COMPOSE_EVIDENCE_PHASE ?? 'after'
);
const catalogue = readFileSync('apps/site/public/data/catalog.json', 'utf8');
type RuntimeEvidence = {
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
  responses: Array<{ url: string; status: number }>;
};
const runtimeEvidenceByPage = new WeakMap<Page, RuntimeEvidence>();

test.beforeEach(({ page }) => {
  const evidence: RuntimeEvidence = {
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
    responses: [],
  };
  runtimeEvidenceByPage.set(page, evidence);
  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(message.text());
    if (message.type() === 'warning') evidence.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => evidence.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? null,
    })
  );
  page.on('response', (response) => {
    const item = { url: response.url(), status: response.status() };
    evidence.responses.push(item);
    if (item.status >= 400) evidence.httpErrors.push(item);
  });
});

test.afterEach(async ({ page }, testInfo) => {
  const evidence = runtimeEvidenceByPage.get(page);
  if (!evidence) return;
  const intentionalCatalogueAbort =
    testInfo.title.includes('retries catalogue loading') || testInfo.title.includes('auto-retries once');
  const unexpectedFailedRequests = evidence.failedRequests.filter(
    (request) => !(intentionalCatalogueAbort && request.url.includes('/data/catalog.json'))
  );
  const unexpectedConsoleErrors = evidence.consoleErrors.filter(
    (message) =>
      !(intentionalCatalogueAbort && (message.includes('net::ERR_FAILED') || message.includes('net::ERR_CONNECTION_RESET')))
  );
  const report = {
    test: testInfo.title,
    url: page.url(),
    viewport: page.viewportSize(),
    injectedFault: intentionalCatalogueAbort
      ? 'first two catalogue requests aborted to exercise bounded retry and manual recovery'
      : null,
    consoleErrors: evidence.consoleErrors,
    consoleWarnings: evidence.consoleWarnings,
    uncaughtExceptions: evidence.uncaughtExceptions,
    failedRequests: evidence.failedRequests,
    httpErrors: evidence.httpErrors,
    responses: evidence.responses,
  };
  const reportDirectory = path.join(evidenceDirectory, 'runtime');
  mkdirSync(reportDirectory, { recursive: true });
  const reportName = testInfo.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  writeFileSync(
    path.join(reportDirectory, `${reportName}-${testInfo.project.name}.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );

  expect(unexpectedConsoleErrors, 'unexpected browser console errors').toEqual([]);
  expect(evidence.uncaughtExceptions, 'uncaught browser exceptions').toEqual([]);
  expect(unexpectedFailedRequests, 'unexpected failed requests').toEqual([]);
  expect(evidence.httpErrors, 'HTTP error responses').toEqual([]);
});

async function capture(page: import('@playwright/test').Page, name: string, project: string) {
  mkdirSync(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, `${name}-${project}.png`),
    fullPage: true,
  });
}

test('Compose auto-retries once and keeps explicit recovery for persistent catalogue failures', async ({
  page,
}, testInfo) => {
  let attempts = 0;
  let releaseFirstRequest = () => {};
  const firstRequestPaused = new Promise<void>((resolve) => {
    releaseFirstRequest = resolve;
  });
  await page.route('**/data/catalog.json', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await firstRequestPaused;
      await route.abort('connectionreset');
      return;
    }
    if (attempts === 2) {
      await route.abort('connectionreset');
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: catalogue,
    });
  });

  await page.goto('/compose');
  const status = page.getByTestId('catalog-status');
  const compose = page.getByTestId('compose-submit-btn');
  await expect(status).toContainText('Loading interface intelligence');
  await expect(compose).toBeDisabled();
  await capture(page, 'catalogue-loading', testInfo.project.name);
  releaseFirstRequest();
  await expect(status).toContainText('Catalogue unavailable');
  await expect(compose).toBeDisabled();
  await capture(page, 'catalogue-unavailable', testInfo.project.name);

  await page.getByRole('button', { name: 'retry' }).click();
  await expect(status).toContainText('Catalogue ready');
  await expect(compose).toBeEnabled();
  expect(attempts).toBe(3);
});

test('Compose rejects whitespace-only briefs with a clear message', async ({ page }, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');

  await page.locator('#description').fill('   \n  ');
  await page.getByTestId('compose-submit-btn').click();

  await expect(page.getByRole('alert')).toContainText('Enter a product description');
  await expect(page.locator('#description')).toBeFocused();
  await expect(page.getByTestId('direction-card-01')).toHaveCount(0);
  await capture(page, 'whitespace-brief', testInfo.project.name);

  await page.locator('#description').fill('');
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('alert')).toContainText('Enter a product description');
  await expect(page.locator('#description')).toHaveAttribute('aria-invalid', 'true');
});

test('Compose hides stale directions after the brief or design settings change', async ({
  page,
}, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page
    .locator('#description')
    .fill(
      'A team workspace for a 50-person research company to coordinate projects and share findings.'
    );
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByTestId('direction-card-01')).toBeVisible();

  await page
    .locator('#description')
    .fill('A people platform for a 500-person technology company to support teams and onboarding.');

  await expect(page.getByRole('status')).toContainText('Compose again to update the directions');
  await expect(page.getByTestId('direction-card-01')).toHaveCount(0);
  await capture(page, 'changed-brief', testInfo.project.name);

  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByTestId('direction-card-01')).toBeVisible();
  await page.getByRole('button', { name: 'Striking' }).click();
  await expect(page.getByRole('status')).toContainText('Compose again to update the directions');
  await expect(page.getByTestId('direction-card-01')).toHaveCount(0);
  await capture(page, 'changed-settings', testInfo.project.name);
});

test('Compose hides stale directions after Visual Ambition changes', async ({ page }, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page
    .locator('#description')
    .fill('A people platform for a 500-person technology company to support teams and onboarding.');
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByTestId('direction-card-01')).toBeVisible();

  await page.getByRole('button', { name: 'Striking' }).click();
  await expect(page.getByText(/Striking \(55\)/i)).toBeVisible();
  await capture(page, 'changed-settings-only', testInfo.project.name);

  await expect(page.getByRole('status')).toContainText('Compose again to update the directions');
  await expect(page.getByTestId('direction-card-01')).toHaveCount(0);
});

test('Selecting a sample brief clears the empty-brief error', async ({ page }, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill('   ');
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByRole('button', { name: 'Playful HR Platform' }).click();

  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('#description')).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('button', { name: 'Striking' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.getByRole('button', { name: 'Refined' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  await expect(page.getByRole('button', { name: 'Inventive' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.getByRole('button', { name: 'Modern' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  await expect(page.getByRole('button', { name: 'Striking' })).toHaveCSS(
    'background-color',
    'rgb(37, 71, 232)'
  );
  await expect(page.getByRole('button', { name: 'Refined' })).toHaveCSS(
    'background-color',
    'rgb(250, 249, 246)'
  );
  await capture(page, 'sample-brief-clears-error', testInfo.project.name);
});

test('Compose exposes selected ambition and target-device controls to keyboard users', async ({
  page,
}, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');

  const striking = page.getByRole('button', { name: 'Striking' });
  await striking.focus();
  await striking.press('Enter');
  await expect(striking).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/Striking \(/i)).toBeVisible();
  await capture(page, 'ambition-keyboard-state', testInfo.project.name);
  const radical = page.getByRole('button', { name: 'Radical' });
  await radical.focus();
  await radical.press('Space');
  await expect(radical).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Advanced Constraints & Devices' }).click();
  const deviceGroup = page.getByRole('group', { name: 'Target Devices' });
  const desktop = deviceGroup.getByRole('button', { name: 'Desktop' });
  const tablet = deviceGroup.getByRole('button', { name: 'Tablet' });
  const mobile = deviceGroup.getByRole('button', { name: 'Mobile' });
  await expect(desktop).toHaveAttribute('aria-pressed', 'true');
  await desktop.focus();
  await desktop.press('Space');
  await expect(desktop).toHaveAttribute('aria-pressed', 'false');
  await tablet.focus();
  await tablet.press('Space');
  await expect(tablet).toHaveAttribute('aria-pressed', 'false');
  await expect(mobile).toHaveAttribute('aria-pressed', 'true');
  await expect(mobile).toBeDisabled();
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(documentWidth, 'Compose should not overflow its viewport').toBeLessThanOrEqual(
    viewportWidth
  );
  await capture(page, 'compose-control-state', testInfo.project.name);
});

test('Compose explains why the final selected target device cannot be removed', async ({
  page,
}, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.getByRole('button', { name: 'Advanced Constraints & Devices' }).click();

  await page.getByRole('button', { name: 'Tablet', exact: true }).click();
  await page.getByRole('button', { name: 'Mobile', exact: true }).click();
  const desktop = page.getByRole('button', { name: 'Desktop', exact: true });
  if (await desktop.isEnabled()) await desktop.click();

  await expect(desktop).toBeDisabled();
  await expect(page.getByRole('status')).toContainText(
    'At least one target device must remain selected'
  );
  await capture(page, 'last-target-device', testInfo.project.name);
});

test('Compose stays usable with a long brief and repeated submissions', async ({
  page,
}, testInfo) => {
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  const longBrief =
    'A team platform for a 500-person technology company to coordinate onboarding, engagement, policies, and team relationships. '.repeat(
      80
    );
  await page.locator('#description').fill(longBrief);
  await page.getByTestId('compose-submit-btn').dblclick();

  await expect(page.getByRole('heading', { name: 'Inferred Product Architecture' })).toBeVisible();
  await expect(page.getByTestId('direction-card-01')).toBeVisible();
  await expect(page.getByTestId('direction-card-02')).toBeVisible();
  await expect(page.getByTestId('direction-card-03')).toBeVisible();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  await capture(page, 'long-brief-repeated-compose', testInfo.project.name);
});
