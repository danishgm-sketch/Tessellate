import { expect, test } from '@playwright/test';

test('Pages cannot delete a screen whose descendant is locked', async ({ page }) => {
  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Select screen Settings & Policies' }).click();

  if (!mobile) await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();
  const settingsNode = page.getByTestId('layer-node-node-screen-settings-settings-form-2');
  await expect(settingsNode).toBeVisible();
  await settingsNode.getByRole('button', { name: 'Lock Settings & Policies' }).click();

  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages' }).click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Delete Settings & Policies' }).click();

  await expect(page.getByRole('button', { name: 'Select screen Settings & Policies' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /locked node/i })).toBeVisible();
});
