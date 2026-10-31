import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const previewCases = [
  { slug: 'accessibility-commitment-section', variant: 'expressive', theme: 'light' },
  { slug: 'ai-approval-request', variant: 'expressive', theme: 'light' },
  { slug: 'advanced-data-table', variant: 'expressive', theme: 'dark' },
  { slug: 'feature-matrix', variant: 'expressive', theme: 'dark' },
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

test('Feature Matrix expressive dark preview keeps normal text at WCAG AA contrast', async ({ page }) => {
  await page.goto('/preview-content/?resource=feature-matrix&variant=expressive&theme=dark');
  await expect(page.getByRole('heading', { name: 'Example capability matrix' })).toBeVisible();

  const contrast = await page.evaluate(() => {
    const section = document.querySelector('section');
    const cell = document.querySelector('tbody td');
    if (!section || !cell) throw new Error('Feature Matrix preview did not render its content.');

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas color sampling is unavailable.');
    const color = (value: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data] as [number, number, number, number];
    };
    const over = (foreground: [number, number, number, number], background: [number, number, number, number]) => {
      const alpha = foreground[3] / 255 + (background[3] / 255) * (1 - foreground[3] / 255);
      if (!alpha) return [0, 0, 0, 0] as [number, number, number, number];
      return [0, 1, 2].map((index) => Math.round(
        (foreground[index]! * (foreground[3] / 255) + background[index]! * (background[3] / 255) * (1 - foreground[3] / 255)) / alpha,
      )).concat(Math.round(alpha * 255)) as [number, number, number, number];
    };
    const ancestors: Element[] = [];
    for (let element: Element | null = cell; element; element = element.parentElement) ancestors.unshift(element);
    let background: [number, number, number, number] = [255, 255, 255, 255];
    for (const element of ancestors) background = over(color(getComputedStyle(element).backgroundColor), background);
    const foreground = color(getComputedStyle(cell).color);
    const composite = over(foreground, background);
    const luminance = ([r, g, b]: [number, number, number, number]) => {
      const linear = (channel: number) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(r!) + 0.7152 * linear(g!) + 0.0722 * linear(b!);
    };
    const foregroundLuminance = luminance(composite);
    const backgroundLuminance = luminance(background);
    return {
      ratio: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
        (Math.min(foregroundLuminance, backgroundLuminance) + 0.05),
      foreground: composite.slice(0, 3),
      background: background.slice(0, 3),
      text: cell.textContent?.trim(),
    };
  });

  expect(contrast.ratio, JSON.stringify(contrast)).toBeGreaterThanOrEqual(4.5);
});
