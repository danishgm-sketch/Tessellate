import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function recordBrowserActivity(page: import('@playwright/test').Page) {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: number[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${new URL(request.url()).pathname}`));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push(response.status()); });
  return { consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors };
}

function relativeEvidencePath(filePath: string) {
  return path.relative(process.cwd(), filePath).replaceAll('\\', '/');
}

async function saveInteractionEvidence(
  testInfo: import('@playwright/test').TestInfo,
  evidenceName: string,
  page: import('@playwright/test').Page,
  responseStatus: number | undefined,
  browserActivity: ReturnType<typeof recordBrowserActivity>,
) {
  const evidenceDirectory = process.env.TESS_AUDIT_EVIDENCE_DIR
    ? path.resolve(process.env.TESS_AUDIT_EVIDENCE_DIR)
    : testInfo.outputDir;
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = path.join(evidenceDirectory, `${evidenceName}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: new URL(page.url()).pathname + new URL(page.url()).hash,
    viewport: page.viewportSize(),
    responseStatus,
    previewPressed: await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Preview' }).getAttribute('aria-pressed'),
    browserActivity,
    openStateScreenshot: relativeEvidencePath(evidenceName.includes('tap')
      ? path.join(evidenceDirectory, 'aud451-mobile-tap-menu-open.png')
      : path.join(evidenceDirectory, 'aud451-mobile-keyboard-menu-open.png')),
    screenshot: relativeEvidencePath(screenshot),
  };
  await writeFile(path.join(evidenceDirectory, `${evidenceName}.json`), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach(`${evidenceName} deployed interaction evidence`, {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });
  expect(browserActivity.consoleErrors).toEqual([]);
  expect(browserActivity.uncaughtExceptions).toEqual([]);
  expect(browserActivity.failedRequests).toEqual([]);
  expect(browserActivity.httpErrors).toEqual([]);
}

test('Mobile Workbench preview controls work without switching to Inspect', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This regression covers the Workbench mobile preview.'
  );

  const browserActivity = recordBrowserActivity(page);
  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();

  const preview = page.getByTestId('mobile-workbench');
  const toggle = preview.locator('main [data-node-id] button[aria-controls]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAccessibleName(/navigation/i);

  await toggle.tap();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveText('Close');
  await expect(toggle).toHaveAccessibleName('Close navigation');
  await expect(preview.getByRole('navigation', { name: 'Product screens', exact: true })).toBeVisible();
  await expect(preview.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true');
  const evidenceDirectory = process.env.TESS_AUDIT_EVIDENCE_DIR
    ? path.resolve(process.env.TESS_AUDIT_EVIDENCE_DIR)
    : testInfo.outputDir;
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, 'aud451-mobile-tap-menu-open.png'), fullPage: true });

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await saveInteractionEvidence(testInfo, 'aud451-mobile-tap-and-escape', page, response?.status(), browserActivity);
});

test('Mobile Workbench navigation remains operable by keyboard without selecting its renderer node', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This keyboard regression covers the Workbench mobile preview.'
  );

  const browserActivity = recordBrowserActivity(page);
  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);

  const preview = page.getByTestId('mobile-workbench');
  await expect(preview).toBeVisible();
  const toggle = preview.locator('main [data-node-id] button[aria-controls]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText('Menu');
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(preview.getByRole('navigation', { name: 'Product screens', exact: true })).toBeVisible();
  const mobileNavigation = preview.getByRole('navigation', { name: 'Mobile Workbench' });
  await expect(mobileNavigation.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true');
  await expect(mobileNavigation.getByRole('button', { name: 'Inspect' })).toHaveAttribute('aria-pressed', 'false');
  const evidenceDirectory = process.env.TESS_AUDIT_EVIDENCE_DIR
    ? path.resolve(process.env.TESS_AUDIT_EVIDENCE_DIR)
    : testInfo.outputDir;
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, 'aud451-mobile-keyboard-menu-open.png'), fullPage: true });

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await saveInteractionEvidence(testInfo, 'aud451-mobile-keyboard-enter-and-escape', page, response?.status(), browserActivity);
});
