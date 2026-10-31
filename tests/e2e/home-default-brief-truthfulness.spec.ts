import { expect, test } from '@playwright/test';

test('homepage starts with the same domain as its employee-experience example', async ({ page }) => {
  await page.goto('/');

  const brief = page.locator('#hero-product-brief');
  await expect(brief).toHaveValue(/employee experience platform/i);
  await expect(brief).toHaveValue(/500-person technology company/i);
});
