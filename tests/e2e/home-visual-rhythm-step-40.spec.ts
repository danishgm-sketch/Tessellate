import { expect, test } from '@playwright/test';

test('mobile homepage keeps the composer within the first 90svh and exposes compact settings', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const hero = page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::section[1]');
  const heroBox = await hero.boundingBox();
  expect(heroBox).not.toBeNull();
  expect(heroBox!.height).toBeLessThanOrEqual(844 * 0.9);

  const compose = page.getByRole('button', { name: /^Compose$/ });
  const composeBox = await compose.boundingBox();
  expect(composeBox).not.toBeNull();
  expect(composeBox!.y + composeBox!.height).toBeLessThanOrEqual(844);

  const settings = page.getByText('Feel, ambition and structure', { exact: true });
  await settings.click();
  await expect(page.locator('#hero-mobile-interface-feel')).toBeVisible();
  await expect(page.locator('#hero-mobile-visual-ambition')).toBeVisible();
  await expect(page.locator('#hero-mobile-structural-creativity')).toBeVisible();
});
