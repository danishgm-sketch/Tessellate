import { expect, test } from '@playwright/test';

test('Mobile Workbench navigation includes its visible Menu label in the accessible name', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This regression covers the Workbench mobile preview.'
  );

  const browserErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();

  const toggle = page.locator('main [data-node-id] button[aria-controls]');
  await expect(toggle).toHaveCount(1);
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText('Menu');
  await expect(toggle).toHaveAccessibleName('Menu, open navigation');
  await page.screenshot({ path: testInfo.outputPath('workbench-mobile-menu-label-after.png') });

  expect(browserErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
