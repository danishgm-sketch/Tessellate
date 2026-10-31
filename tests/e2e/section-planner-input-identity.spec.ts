import { expect, test } from '@playwright/test';

test('custom section title has a stable field identity and adds a section', async ({ page }) => {
  await page.goto('/tools/section-planner/');

  const title = page.getByRole('textbox', { name: 'Custom section title' });
  await expect(title).toHaveAttribute('id', 'custom-section-title');
  await expect(title).toHaveAttribute('name', 'customSectionTitle');
  await title.fill('Employee timeline');
  await page.getByRole('button', { name: 'Add', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Page Sections (9 active)' })).toBeVisible();
  await expect(page.getByText('Employee timeline', { exact: true })).toBeVisible();
});
