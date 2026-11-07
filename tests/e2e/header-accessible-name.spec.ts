import { test, expect } from '@playwright/test';

const routes = ['/', '/explore', '/compose', '/r/advanced-data-table'];

for (const route of routes) {
  test(`search trigger includes its visible label in its accessible name on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);
    const search = page.getByRole('banner').getByRole('button', { name: /search/i }).first();
    await expect(search).toBeVisible();
    await expect(search).toHaveAccessibleName(/Search.*⌘K/);
  });
}
