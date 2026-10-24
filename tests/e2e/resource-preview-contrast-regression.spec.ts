import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const previewCases = [
  { slug: 'accessibility-commitment-section', variant: 'expressive', theme: 'light' },
  { slug: 'ai-approval-request', variant: 'expressive', theme: 'light' },
  { slug: 'advanced-data-table', variant: 'expressive', theme: 'dark' },
  { slug: 'dashboard-kpi-grid', variant: 'expressive', theme: 'dark' },
  { slug: 'filter-builder', variant: 'expressive', theme: 'dark' },
  ...(['quiet', 'expressive', 'nocturne'] as const).flatMap((variant) =>
    (['light', 'dark'] as const).map((theme) => ({ slug: 'timeline', variant, theme }))
  ),
];

for (const { slug, variant, theme } of previewCases) {
  test(`${slug} ${variant} preview has readable contrast in ${theme} mode`, async ({ page }) => {
    await page.goto(`/preview-content/?resource=${slug}&variant=${variant}&theme=${theme}`);
    await expect(page.locator(`[data-node-id="preview-${slug}"]`)).toBeAttached();
    await page.waitForLoadState('networkidle');

    const result = await new AxeBuilder({ page })
      .options({ preload: false })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();

    expect(result.violations).toEqual([]);
  });
}
