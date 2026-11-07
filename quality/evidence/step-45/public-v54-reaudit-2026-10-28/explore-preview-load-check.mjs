/* global innerHeight */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.resolve('quality/evidence/step-45/public-v54-reaudit-2026-10-28');
await mkdir(path.join(outputDir, 'routes'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: 'reduce' });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
  page.on('response', (response) => { if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }); });
  const response = await page.goto(`${baseURL}/explore`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('body').waitFor({ state: 'visible' });
  await page.waitForTimeout(6000);
  const previews = await page.locator('iframe[src*="preview-content"]').evaluateAll((frames) => frames.map((frame) => {
    const rect = frame.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
    const card = frame.closest('article, li, [class*="group"]') ?? frame.parentElement;
    return {
      resource: new URL(frame.src).searchParams.get('resource'),
      visible,
      loading: card?.innerText?.includes('Loading preview…') ?? false,
      unavailable: card?.innerText?.includes('Preview unavailable.') ?? false,
    };
  }));
  const screenshot = path.join(outputDir, 'routes', `explore-loaded-${viewport.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: false, animations: 'disabled' });
  results.push({
    viewport: viewport.name,
    httpStatus: response?.status() ?? null,
    visibleFrameCount: previews.filter((preview) => preview.visible).length,
    visibleLoadingCount: previews.filter((preview) => preview.visible && preview.loading).length,
    visibleUnavailableCount: previews.filter((preview) => preview.visible && preview.unavailable).length,
    previews,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
  });
  await page.close();
}

await browser.close();
const report = { site: baseURL, siteVersion: 54, capturedAt: new Date().toISOString(), results };
await writeFile(path.join(outputDir, 'explore-preview-load-check.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ viewport, httpStatus, visibleFrameCount, visibleLoadingCount, visibleUnavailableCount, consoleErrors, pageErrors, failedRequests, badResponses, screenshot }) => ({ viewport, httpStatus, visibleFrameCount, visibleLoadingCount, visibleUnavailableCount, consoleErrors, pageErrors, failedRequests, badResponses, screenshot })), null, 2));
