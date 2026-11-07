import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('homepage preset briefs stay fully visible without horizontal clipping', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const row = page.locator('[aria-label="Preset briefs"]');
  await expect(row).toBeVisible();

  for (const width of [390, 360, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const layout = await row.evaluate((element) => {
      const rowRect = element.getBoundingClientRect();
      return {
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        buttons: Array.from(element.querySelectorAll('button')).map((button) => {
          const rect = button.getBoundingClientRect();
          return {
            label: button.textContent?.trim() ?? '',
            left: rect.left,
            right: rect.right,
            rowLeft: rowRect.left,
            rowRight: rowRect.right,
          };
        }),
      };
    });

    expect(layout.scrollWidth, `preset row overflowed at ${width}px`).toBeLessThanOrEqual(
      layout.clientWidth + 1,
    );
    for (const button of layout.buttons) {
      expect(button.left, `${button.label} is clipped on the left at ${width}px`).toBeGreaterThanOrEqual(
        button.rowLeft - 1,
      );
      expect(button.right, `${button.label} is clipped on the right at ${width}px`).toBeLessThanOrEqual(
        button.rowRight + 1,
      );
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'AI research terminal' }).click();
  await expect(page.locator('#hero-product-brief')).toContainText('quant teams');
  await page.getByRole('button', { name: 'playful HR platform' }).click();
  await expect(page.locator('#hero-product-brief')).toContainText('employee experience platform');

  const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-45');
  mkdirSync(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'aud-351-home-mobile-390-after.png'),
  });
});
