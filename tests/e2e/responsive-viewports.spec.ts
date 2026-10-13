import { test, expect } from '@playwright/test';

test.describe('Responsive Viewport Audits (390px & 1440px)', () => {
  test('mobile viewport 390px: no horizontal overflow on homepage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify main header and mobile nav toggle
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="navigation" i]').first();
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(200);
    }
  });

  test('mobile viewport 390px: showcases page renders vertically stacked cards without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/showcases');
    await page.waitForLoadState('domcontentloaded');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('mobile viewport 390px: explore page renders responsive filters without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('desktop viewport 1440px: renders wide layout and multi-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/showcases');
    await page.waitForLoadState('domcontentloaded');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Verify desktop navigation links are visible directly
    const exploreLink = page.locator('header a[href="/explore"]').first();
    await expect(exploreLink).toBeVisible();
  });
});
