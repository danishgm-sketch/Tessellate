import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Phase 30: every contract-v2 resource passes axe (WCAG 2.2 A/AA plus AAA contrast) in light and dark at
 * 360, 768 and 1440 px, does not overflow horizontally, and shows a visible focus indicator on keyboard focus.
 * These checks back the "AAA" accessibility claims in the manifests.
 */
const PREVIEW = 'http://localhost:5173';
const resourcesDir = path.resolve(process.cwd(), 'resources');

const v2Slugs: string[] = [];
for (const cat of fs.readdirSync(resourcesDir)) {
  const catDir = path.join(resourcesDir, cat);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const slug of fs.readdirSync(catDir)) {
    const file = path.join(catDir, slug, 'manifest.json');
    if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, 'utf8')).contractVersion === 2) v2Slugs.push(slug);
  }
}

test.describe('Resource contract v2 — accessibility and responsiveness', () => {
  test.skip(({ isMobile }) => isMobile, 'Widths are set explicitly per check');

  for (const slug of v2Slugs) {
    test(slug, async ({ page }) => {
      test.setTimeout(120000);
      for (const theme of ['light', 'dark'] as const) {
        for (const width of [360, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`${PREVIEW}/?resource=${slug}&floor=AAA&theme=${theme}`);
          await expect(page.locator('#root section, #root form').first()).toBeVisible({ timeout: 15000 });

          const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa'])
            .analyze();
          const violations = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`);
          expect(violations, `${slug} ${theme} ${width}px`).toEqual([]);

          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow, `${slug} ${theme} ${width}px horizontal overflow`).toBeLessThanOrEqual(1);
        }
      }

      // Keyboard: the first focusable control inside the resource gets a visible focus indicator.
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${PREVIEW}/?resource=${slug}&floor=AAA`);
      await expect(page.locator('#root .p-4 section').first()).toBeVisible({ timeout: 15000 });
      const focusable = page.locator('#root .p-4 :is(a[href], button, input, select, textarea, [tabindex="0"])');
      if ((await focusable.count()) === 0) return; // display-only resource (e.g. order summary)
      const first = focusable.first();
      await expect(first).toBeVisible();
      await first.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return 'none';
        const s = getComputedStyle(el);
        return s.outlineStyle === 'none' || s.outlineWidth === '0px' ? 'none' : `${s.outlineStyle} ${s.outlineWidth}`;
      });
      expect(outline, `${slug}: visible focus indicator`).not.toBe('none');
    });
  }
});
