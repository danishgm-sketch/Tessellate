import { expect, test } from '@playwright/test';

test('Explore previews load under an opaque sandbox with only compiled asset connections', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedCompiledAssets: string[] = [];
  const previewPolicies: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('requestfailed', (request) => {
    if (request.url().includes('/_astro/')) failedCompiledAssets.push(`${request.url()} (${request.failure()?.errorText ?? 'failed'})`);
  });
  page.on('response', (response) => {
    if (response.url().includes('/preview/?resource=accordion')) {
      previewPolicies.push(response.headers()['content-security-policy'] ?? '');
    }
  });

  const response = await page.goto('/explore');
  expect(response?.status()).toBe(200);
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const frame = page.locator('iframe[title="Accordion actual preview"]');
  await expect(frame).toHaveAttribute('sandbox', 'allow-scripts');
  await frame.scrollIntoViewIfNeeded();
  await expect(page.frameLocator('iframe[title="Accordion actual preview"]').getByText('What is this example?', { exact: true })).toBeVisible();

  const origin = new URL(page.url()).origin;
  const policy = previewPolicies.find((value) => value.includes("default-src 'none'")) ?? '';
  expect(policy).toContain(`connect-src ${origin}/_astro/`);
  expect(policy).toContain("frame-src 'none'");
  expect(policy).not.toContain('api.tessellate.design');
  expect(consoleErrors).toEqual([]);
  expect(failedCompiledAssets).toEqual([]);
});
