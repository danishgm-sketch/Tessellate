import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

test('preview app compiles the utility styles used by canonical resources', async ({ page }) => {
  const diagnostics = { console: [] as string[], uncaught: [] as string[], network: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') diagnostics.console.push(message.text()); });
  page.on('pageerror', (error) => diagnostics.uncaught.push(error.message));
  page.on('requestfailed', (request) => diagnostics.network.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => { if (response.status() >= 400) diagnostics.network.push(`${response.status()} ${response.url()}`); });

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?resource=fade-up-reveal');

  const card = page.locator('div.w-full.p-6').last();
  await expect(card).toBeVisible();
  const style = await card.evaluate((element) => ({
    className: element.className,
    transitionDuration: getComputedStyle(element).transitionDuration,
  }));
  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-07', process.env.TESSELLATE_AUDIT_LABEL ?? 'preview-app-after');
  mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, 'resource-styles-1440x900.png'), fullPage: true });
  writeFileSync(path.join(evidenceDir, 'runtime.json'), JSON.stringify({
    url: page.url(),
    viewport: '1440x900',
    style,
    ...diagnostics,
  }, null, 2));

  expect(style.className).toContain('duration-300');
  expect(style.transitionDuration).toBe('0.3s');
  expect(diagnostics).toEqual({ console: [], uncaught: [], network: [] });
});

test('preview app applies and restores its reduced-motion state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?resource=fade-up-reveal');

  const card = page.locator('div.w-full.p-6').last();
  await expect(card).toBeVisible();
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0.3s');

  await page.evaluate(() => window.postMessage({ type: 'TESSELLATE_PREVIEW_UPDATE', reducedMotion: true }, '*'));
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.tessellateReducedMotion)).toBe('true');
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');

  await page.evaluate(() => window.postMessage({ type: 'TESSELLATE_PREVIEW_UPDATE', reducedMotion: false }, '*'));
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.tessellateReducedMotion)).toBeUndefined();
  await expect.poll(() => card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0.3s');
});
