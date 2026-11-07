import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function colorContrastViolations(page: Page) {
  const violations = (await new AxeBuilder({ page })
    .options({ preload: false })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze()).violations;
  return violations.filter((violation) => violation.id === 'color-contrast');
}

async function visibleContrastRatio(page: Page, selector: string) {
  return page.locator(selector).evaluate((element) => {
    const channels = (value: string) => {
      const match = value.match(/[0-9.]+/g)?.map(Number);
      if (!match || match.length < 3) throw new Error(`Cannot parse computed color: ${value}`);
      return [match[0], match[1], match[2], match[3] ?? 1] as const;
    };
    const style = getComputedStyle(element);
    let parent = element.parentElement;
    let backdrop = [255, 255, 255, 1] as const;
    while (parent) {
      const candidate = channels(getComputedStyle(parent).backgroundColor);
      if (candidate[3] > 0) { backdrop = candidate; break; }
      parent = parent.parentElement;
    }
    const opacity = Number(style.opacity);
    const blend = (foreground: readonly number[], background: readonly number[], alpha: number) =>
      [0, 1, 2].map((index) => Math.round(foreground[index] * alpha + background[index] * (1 - alpha)));
    const foreground = blend(channels(style.color), backdrop, opacity);
    const background = blend(channels(style.backgroundColor), backdrop, opacity);
    const luminance = (color: number[]) => {
      const linear = color.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return Number(((values[0] + 0.05) / (values[1] + 0.05)).toFixed(2));
  });
}

for (const colorScheme of ['light', 'dark'] as const) {
  test(`Compose loading and error controls retain readable contrast (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.route('**/data/catalog.json', (route) => route.abort());
    const composeUrl = process.env.AUDIT_URL ? new URL('/compose/', process.env.AUDIT_URL).toString() : '/compose/';
    await page.goto(composeUrl);

    const status = page.getByTestId('catalog-status');
    await expect(status).toContainText('Catalogue unavailable');
    const submit = page.getByTestId('compose-submit-btn');
    await expect(submit).toBeDisabled();
    await submit.scrollIntoViewIfNeeded();
    expect(await visibleContrastRatio(page, '[data-testid="compose-submit-btn"]')).toBeGreaterThanOrEqual(4.5);

    await page.locator('footer').last().scrollIntoViewIfNeeded();
    expect(await colorContrastViolations(page)).toEqual([]);
  });
}
