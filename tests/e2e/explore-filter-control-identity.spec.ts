import { expect, test } from '@playwright/test';

test('Explore filter controls have stable identity and survive a reload', async ({ page }) => {
  await page.goto('/explore');
  await expect(page.getByText(/Showing \d+ of 324 resources/)).toBeVisible();

  const openMobileFilters = async () => {
    if (test.info().project.name.includes('mobile')) {
      await page.getByRole('button', { name: 'Filters', exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  };
  await openMobileFilters();

  const filters = page.locator('input[type="checkbox"]');
  const missingIdentity = await filters.evaluateAll((elements) =>
    elements
      .filter((element) => !element.id || !element.getAttribute('name'))
      .map((element) => ({
        label: element.labels?.[0]?.textContent?.trim() ?? '',
        id: element.id,
        name: element.getAttribute('name'),
      })),
  );
  expect(missingIdentity).toEqual([]);

  const primitive = page.getByRole('checkbox', { name: 'primitive', exact: true });
  await primitive.check();
  await expect(page).toHaveURL(/type=primitive/);
  await page.reload();
  await openMobileFilters();
  await expect(page.getByRole('checkbox', { name: 'primitive', exact: true })).toBeChecked();
});
