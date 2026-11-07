import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const colorContrastResources = [
  'ai-memory-context-panel',
  'api-capability-section',
  'audit-log',
];

for (const slug of colorContrastResources) {
  test(`${slug} preview text meets WCAG contrast`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const uncaughtExceptions: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => uncaughtExceptions.push(error.message));

    const response = await page.goto(`/r/${slug}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    await expect(preview.locator('.tess-screen')).toBeVisible({ timeout: 15_000 });
    expect(consoleErrors).toEqual([]);
    expect(uncaughtExceptions).toEqual([]);

    // axe injects temporary styles; keep its CSP diagnostic separate from app runtime errors.
    page.removeAllListeners('console');
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations.filter((violation) => violation.id === 'color-contrast')).toEqual([]);
  });
}

test('cohort matrix scroll region is named and keyboard reachable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto('/preview-content/?resource=cohort-matrix&variant=quiet&theme=light');
  expect(response?.status()).toBe(200);

  const preview = page.frameLocator('iframe[data-tessellate-preview-frame]');
  const region = preview.getByRole('region', { name: 'Cohort retention table' });
  await expect(region).toBeVisible();
  await expect(region).toHaveAttribute('tabindex', '0');
  await region.focus();
  await expect(region).toBeFocused();
  const dimensions = await region.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
});
