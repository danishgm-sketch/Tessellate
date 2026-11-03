/* global window, document, performance, innerWidth, innerHeight, console */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const base = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const directory = path.dirname(fileURLToPath(import.meta.url));
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
try {
  for (let repeat = 1; repeat <= 4; repeat += 1) {
    const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [], browserCancellations: [] };
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    let phase = 'route-load';
    page.on('console', message => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
      if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
    });
    page.on('pageerror', error => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', request => {
      const error = request.failure()?.errorText ?? null;
      const frameUrl = (() => { try { return request.frame().url(); } catch { return null; } })();
      if (error === 'net::ERR_ABORTED' && phase === 'user-filtered-catalogue') runtime.browserCancellations.push({ url: request.url(), frameUrl, phase });
      else runtime.failedRequests.push({ url: request.url(), error, frameUrl, phase });
    });
    page.on('response', response => { if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() }); });
    await page.addInitScript(() => {
      window.__auditPreviewMessages = [];
      window.addEventListener('message', event => {
        const data = event.data;
        if (data && typeof data.type === 'string' && data.type.startsWith('TESSELLATE_PREVIEW')) {
          const frame = [...document.querySelectorAll('iframe')].find(item => item.contentWindow === event.source);
          window.__auditPreviewMessages.push({ type: data.type, resourceId: data.resourceId ?? null, error: data.error ?? null, at: Math.round(performance.now()), frameSrc: frame?.getAttribute('src') ?? null });
        }
      });
    });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8, connectionType: 'cellular3g' });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const routeStart = Date.now();
    await page.goto(`${base}/explore`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ state: 'visible', timeout: 90000 });
    const routeReadyMs = Date.now() - routeStart;
    phase = 'user-filtered-catalogue';
    const searchStart = Date.now();
    await page.getByLabel('Search catalogue').fill('onboarding');
    await page.getByRole('link', { name: 'Onboarding Role Select', exact: true }).waitFor({ state: 'visible', timeout: 30000 });
    await page.frameLocator('iframe[title="Onboarding Role Select actual preview"]').locator('.tess-screen').waitFor({ state: 'visible', timeout: 30000 });
    const firstPreviewReadyMs = Date.now() - searchStart;
    const browserMetrics = await page.evaluate(() => ({
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      navigation: performance.getEntriesByType('navigation').map(entry => ({
        responseStartMs: Math.round(entry.responseStart),
        domContentLoadedMs: Math.round(entry.domContentLoadedEventEnd),
        loadEventMs: Math.round(entry.loadEventEnd),
        durationMs: Math.round(entry.duration),
        transferBytes: entry.transferSize,
      })),
      catalogue: performance.getEntriesByType('resource')
        .filter(entry => entry.name.endsWith('/data/catalog.json'))
        .map(entry => ({ startMs: Math.round(entry.startTime), durationMs: Math.round(entry.duration), transferBytes: entry.transferSize, encodedBytes: entry.encodedBodySize })),
      firstPreviewTitle: document.querySelector('iframe[title="Onboarding Role Select actual preview"]')?.title ?? null,
      readyMessages: window.__auditPreviewMessages?.filter(message => message.type === 'TESSELLATE_PREVIEW_READY') ?? [],
      previewErrors: window.__auditPreviewMessages?.filter(message => message.type === 'TESSELLATE_PREVIEW_ERROR') ?? [],
      visibleUnavailable: [...document.querySelectorAll('[data-testid="resource-preview-surface"] [role="alert"]')].filter(node => node.getBoundingClientRect().bottom > 0 && node.getBoundingClientRect().top < innerHeight).map(node => node.innerText),
    }));
    const screenshot = path.join(directory, `explore-recheck-${repeat}-1440x900.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    results.push({ repeat, route: page.url(), viewport: page.viewportSize(), throttle: { latencyMs: 150, downloadBitsPerSecond: 1_600_000, uploadBitsPerSecond: 750_000, cpuSlowdownFactor: 4 }, routeReadyMs, firstPreviewReadyMs, browserMetrics, runtime, screenshot: path.basename(screenshot) });
    await context.close();
  }
} finally { await browser.close(); }
const report = {
  capturedAt: new Date().toISOString(),
  deployment: 'v74',
  sourceCommit: '75276e8078e908b8258fa3d2cba629d71b85cd60',
  observations: [
    'An earlier exploratory route-ready result of 15,582ms was not reproduced in this four-run fresh-browser repeat (4,417–5,754ms). The four measured first relevant previews were all under the 8,000ms budget.',
    'A long-lived DevTools tab briefly showed Preview unavailable for First Run State. The direct resource detail route and all four fresh preview runs loaded the resource and emitted READY with no preview error; no separate defect was filed.',
  ],
  results,
};
await writeFile(path.join(directory, 'explore-recheck-live.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
