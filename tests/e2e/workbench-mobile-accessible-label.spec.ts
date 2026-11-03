import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('Mobile Workbench navigation includes its visible Menu label in the accessible name', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This regression covers the Workbench mobile preview.'
  );

  const browserErrors: string[] = [];
  const browserWarnings: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('console', (message) => { if (message.type() === 'warning') browserWarnings.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();

  const toggle = page.locator('main [data-node-id] button[aria-controls]');
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText('Menu');
  await expect(toggle).toHaveAccessibleName('Menu, open navigation');
  const evidenceDirectory = process.env.TESS_AUDIT_EVIDENCE_DIR
    ? path.resolve(process.env.TESS_AUDIT_EVIDENCE_DIR)
    : testInfo.outputDir;
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = path.join(evidenceDirectory, 'aud450-mobile-menu-label.png');
  await page.screenshot({ path: screenshot, fullPage: true });
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: new URL(page.url()).pathname + new URL(page.url()).hash,
    viewport: page.viewportSize(),
    accessibleName: await toggle.getAttribute('aria-label'),
    visibleLabel: await toggle.innerText(),
    browserErrors,
    browserWarnings,
    failedRequests,
    httpErrors,
    screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
  };
  await writeFile(path.join(evidenceDirectory, 'aud450-mobile-menu-label.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Mobile navigation accessible-name evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(browserErrors).toEqual([]);
  expect(browserWarnings).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
