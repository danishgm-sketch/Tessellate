import { expect, test } from '@playwright/test';

test('a Gold resource chunk failure stays local and preserves the Workbench project', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route(/\/_astro\/editorial-hero\.[^/]+\.js$/, async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'text/javascript',
      body: 'throw new Error("injected resource chunk failure");',
    });
  });

  await page.goto('/workbench');
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible();
  await expect(page.getByTestId('resource-load-failure').filter({ hasText: 'editorial-hero' })).toBeVisible();
  await expect(page.getByText('The project reference is preserved. Reload the page to retry this resource.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Made for everyday employee experiences' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});
