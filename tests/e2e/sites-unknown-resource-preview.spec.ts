import { expect, test } from '@playwright/test';

test('Sites preview announces an unavailable resource without rendering a substitute', async ({ page }) => {
  const errors: string[] = [];
  const networkFailures: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', (request) => networkFailures.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) networkFailures.push(`${response.status()} ${response.url()}`);
  });

  const response = await page.goto('/preview/?resource=__missing-resource-for-renderer-audit__');
  expect(response?.status()).toBe(200);
  const diagnostic = page
    .frameLocator('iframe[title="Isolated Tessellate resource preview"]')
    .getByRole('alert');
  await expect(diagnostic).toContainText('Unknown resource: __missing-resource-for-renderer-audit__');
  await expect(diagnostic).toContainText('no substitute component is rendered');
  expect(await page.getByRole('button').count()).toBe(0);
  expect(errors).toEqual([]);
  expect(networkFailures).toEqual([]);
});
