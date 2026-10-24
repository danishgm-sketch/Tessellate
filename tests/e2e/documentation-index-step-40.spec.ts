import { expect, test } from '@playwright/test';

test('documentation index links to canonical repository contracts', async ({ page }) => {
  const response = await page.goto('/docs/');

  expect(response?.status()).toBe(200);
  const documentationLinks = page.getByRole('navigation', { name: 'Documentation' }).getByRole('link');
  await expect(documentationLinks).toHaveCount(16);
  for (const slug of [
    'architecture',
    'composition-engine',
    'data-contracts',
    'design-system',
    'product-spec',
    'quality-security',
    'workbench-spec',
  ]) {
    await expect(page.locator(`a[href="/docs/${slug}/"]`)).toBeVisible();
  }

  await page.locator('a[href="/docs/product-spec/"]').click();
  await expect(page).toHaveURL(/\/docs\/product-spec\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Tessellate Product Specification' })).toBeVisible();
});
