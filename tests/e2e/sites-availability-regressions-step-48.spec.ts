import { expect, test } from '@playwright/test';

test('Explore retries one transient catalogue network failure without user action', async ({ page }) => {
  let catalogueRequests = 0;
  await page.route('**/data/catalog.json', async (route) => {
    catalogueRequests += 1;
    if (catalogueRequests === 1) {
      await route.abort('connectionreset');
      return;
    }
    await route.continue();
  });

  await page.goto('/explore/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible({ timeout: 7_000 });
  expect(catalogueRequests).toBeGreaterThanOrEqual(2);
});

test('Compose retries one transient catalogue network failure before enabling composition', async ({ page }) => {
  let catalogueRequests = 0;
  await page.route('**/data/catalog.json', async (route) => {
    catalogueRequests += 1;
    if (catalogueRequests === 1) {
      await route.abort('connectionreset');
      return;
    }
    await route.continue();
  });

  await page.goto('/compose/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready', { timeout: 7_000 });
  await expect(page.getByRole('button', { name: /Compose/ })).toBeEnabled({ timeout: 7_000 });
  expect(catalogueRequests).toBeGreaterThanOrEqual(2);
});

test('robots.txt is served as a successful static response', async ({ request }) => {
  const response = await request.get('/robots.txt');

  expect(response.status()).toBe(200);
  await expect(response.text()).resolves.toContain('User-agent: *');
});
