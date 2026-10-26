import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('registry command is keyboard scrollable on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/registry/');
  const axe = await new AxeBuilder({ page }).options({ preload: false }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.locator('pre').focus();
  await expect(page.locator('pre')).toBeFocused();
});

test('the CLI documentation shell stays within a 320px phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/docs/cli/');

  const documentWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(documentWidth.document).toBeLessThanOrEqual(documentWidth.viewport);
});

test('CLI examples stay within the phone viewport and long commands scroll by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto('/docs/cli/');

  const snippets = page.locator('main pre');
  await expect(snippets).toHaveCount(5);
  for (let index = 0; index < await snippets.count(); index += 1) {
    await expect(snippets.nth(index)).toHaveAttribute('tabindex', '0');
  }

  const documentWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(documentWidth.document).toBeLessThanOrEqual(documentWidth.viewport);

  const longCommand = page.locator('pre[aria-label="Validate a resource manifest command"]');
  await longCommand.focus();
  await expect(longCommand).toBeFocused();
  await longCommand.press('ArrowRight');
  await expect.poll(() => longCommand.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-44');
  mkdirSync(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, 'sites-docs-cli-after-360.png'), animations: 'disabled' });
});

test('long prose tokens and inline identifiers wrap without widening mobile documentation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/docs/product-hardening/');

  const widths = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);

  const overflowingInlineCode = await page.locator('main .documentation p code').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.right > document.documentElement.clientWidth + 1;
      })
      .map((element) => element.textContent),
  );
  expect(overflowingInlineCode).toEqual([]);

  const checkpoint = page.locator('main .documentation p').filter({ hasText: 'version appgprj_6acc036de8cc8191a823339566972d85' });
  await checkpoint.scrollIntoViewIfNeeded();
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-45/public-v38');
  mkdirSync(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'docs-product-hardening-mobile-after-local-390.png'),
    animations: 'disabled',
  });
});
