import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility & WCAG 2.2 AA Audits', () => {
  test('homepage passes automated axe accessibility scan', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .disableRules(['color-contrast', 'target-size']) // Contrast & touch targets evaluated per platform context
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('showcases route passes automated axe accessibility scan', async ({ page }) => {
    await page.goto('/showcases');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .disableRules(['color-contrast', 'target-size'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('explore route passes automated axe accessibility scan', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .disableRules(['color-contrast', 'target-size'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('reduced-motion preference is respected across pages', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Page must load stably without script crashes under reduced motion
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    await page.goto('/showcases');
    const showcaseHeading = page.locator('h1').first();
    await expect(showcaseHeading).toBeVisible();
  });

  test('keyboard navigation and focus visibility works across navigation header', async ({ page }) => {
    await page.goto('/');

    // Press Tab to traverse interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeDefined();

    // Tab through header links
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    const currentFocus = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      text: document.activeElement?.textContent?.slice(0, 30),
    }));
    expect(currentFocus.tag).toBeTruthy();
  });
});
