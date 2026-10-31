import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
const targets = [
  {
    slug: 'error-state',
    selector: '[aria-label="Error code sample"]',
    screenContent: 'Manifest Compilation Fault',
    regionContent: '[ZodError] layoutDNA',
  },
  {
    slug: 'feature-matrix',
    selector: '[aria-label="Example capability matrix comparison table"]',
    screenContent: 'Example capability matrix',
    regionContent: 'Verified Zod Schemas',
  },
  {
    slug: 'three-pane-app-shell',
    selector: '[aria-label="Workspace canvas"]',
    screenContent: 'Nav Tree',
    regionContent: 'Visual Canvas',
  },
];
test('mobile Gold scroll regions remain visible and keyboard focusable on the deployed Site', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const diag = {
    console: [] as string[],
    errors: [] as string[],
    failed: [] as string[],
    http: [] as string[],
  };
  page.on('console', (m) => {
    if (m.type() === 'error') diag.console.push(m.text());
  });
  page.on('pageerror', (e) => diag.errors.push(e.message));
  page.on('requestfailed', (r) => diag.failed.push(`${r.url()} ${r.failure()?.errorText ?? ''}`));
  page.on('response', (r) => {
    if (r.status() >= 400) diag.http.push(`${r.status()} ${r.url()}`);
  });
  const out = path.resolve(process.cwd(), 'audit/evidence/v25/mobile-scroll-regions');
  await mkdir(out, { recursive: true });
  const results = [];
  for (const item of targets) {
    const route = `/resources/${item.slug}/`;
    const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    const iframe = page.locator('iframe[title$=" live preview"]');
    await expect(iframe).toBeVisible();
    const preview = page.frameLocator('iframe[title$=" live preview"]');
    const screen = preview.locator('.tess-screen');
    await expect(screen).toContainText(item.screenContent, { timeout: 15000 });
    const region = preview.locator(item.selector);
    await expect(region).toBeAttached({ timeout: 15000 });
    await expect(region).toBeVisible({ timeout: 15000 });
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region).toContainText(item.regionContent);
    await region.focus();
    await expect(region).toBeFocused();
    const focusedText = await region.innerText();
    await page.screenshot({
      path: path.join(out, `${item.slug}-390x844.png`),
      fullPage: true,
      animations: 'disabled',
    });
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    results.push({
      route,
      viewport: '390x844',
      selector: item.selector,
      text: focusedText.slice(0, 160),
      focus: true,
      tabIndex: '0',
      overflow,
    });
  }
  const report = {
    site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
    capturedAt: new Date().toISOString(),
    results,
    diagnostics: diag,
  };
  await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  expect(diag.console).toEqual([]);
  expect(diag.errors).toEqual([]);
  expect(diag.http).toEqual([]);
  expect(diag.failed.filter((x) => !x.includes('net::ERR_ABORTED'))).toEqual([]);
  expect(results.every((r) => r.overflow.document <= r.overflow.viewport)).toBe(true);
});
