import { expect, test } from '@playwright/test';

test('resource detail reset restores the isolated preview to its initial state', async ({ page }, testInfo) => {
  await page.goto('/r/api-key-management');

  const preview = page.frameLocator('iframe[title="API Key Management live preview"]');
  await expect(preview.getByRole('heading', { name: 'Example API tokens' })).toBeVisible();
  await preview.getByRole('button', { name: 'Add example token' }).click();
  await expect(preview.getByRole('button', { name: 'Remove example token 3' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('resource-detail-reset-before.png'), fullPage: true });

  await page.getByRole('button', { name: 'Reset preview state' }).click();

  await expect(preview.getByRole('button', { name: 'Remove example token 3' })).toHaveCount(0);
  await expect(preview.getByText('Sample row · not a credential')).toHaveCount(2);
  await page.screenshot({ path: testInfo.outputPath('resource-detail-reset-after.png'), fullPage: true });
});
