import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const values = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
    const [red = 0, green = 0, blue = 0] = values.map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test('Accessibility Lab auto-fix produces AA contrast for normal text', async ({ page }, testInfo) => {
  await page.goto('/tools/accessibility/');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Foreground colour hex value').fill('#777777');
  await page.getByLabel('Background colour hex value').fill('#888888');
  await page.getByRole('button', { name: 'Auto-Fix Contrast' }).click();

  const foreground = await page.getByLabel('Foreground colour hex value').inputValue();
  const background = await page.getByLabel('Background colour hex value').inputValue();
  expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-48/after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, `accessibility-auto-fix-${testInfo.project.name}.png`) });
});

test('resource detail exposes the active visual variant to assistive technology', async ({ page }, testInfo) => {
  await page.goto('/r/collapsible-sidebar/');
  await page.waitForLoadState('networkidle');
  const nocturne = page.getByRole('button', { name: 'Nocturne', exact: true });

  await nocturne.focus();
  await nocturne.press('Enter');
  await expect(nocturne).toHaveAttribute('aria-pressed', 'true');
  await expect(nocturne).toHaveClass(/bg-\[var\(--tess-cobalt/);
  await expect.poll(() => nocturne.evaluate((button) => getComputedStyle(button).backgroundColor))
    .toBe('rgb(37, 71, 232)');
  await expect.poll(() => nocturne.evaluate((button) => getComputedStyle(button).color))
    .toBe('rgb(255, 255, 255)');
  await page.mouse.move(0, 0);
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-48/after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, `resource-variant-state-${testInfo.project.name}.png`) });
});
