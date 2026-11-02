import { expect, test } from '@playwright/test';

test('Mobile Workbench preview controls work without switching to Inspect', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This regression covers the Workbench mobile preview.'
  );

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'networkidle' });
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

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});
