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

test('Mobile Workbench navigation remains operable by keyboard without selecting its renderer node', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This keyboard regression covers the Workbench mobile preview.'
  );

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);

  const preview = page.getByTestId('mobile-workbench');
  await expect(preview).toBeVisible();
  const toggle = preview.locator('main [data-node-id] button[aria-controls]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText('Menu');
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Enter');
  await page.screenshot({ path: testInfo.outputPath('keyboard-enter-result.png') });

  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(preview.getByRole('navigation', { name: 'Product screens', exact: true })).toBeVisible();
  const mobileNavigation = preview.getByRole('navigation', { name: 'Mobile Workbench' });
  await expect(mobileNavigation.getByRole('button', { name: 'Preview' })).toHaveAttribute('aria-pressed', 'true');
  await expect(mobileNavigation.getByRole('button', { name: 'Inspect' })).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});
