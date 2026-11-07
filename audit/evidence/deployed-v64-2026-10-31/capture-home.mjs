import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/';
const evidenceDir = path.resolve('audit/evidence/deployed-v64-2026-10-31/home');
await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); if (message.type() === 'warning') runtime.consoleWarnings.push(message.text()); });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => { if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() }); });
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  const pageState = await page.evaluate(() => ({
    title: document.title,
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    overflowX: document.documentElement.scrollWidth > window.innerWidth,
    headingCount: document.querySelectorAll('h1,h2,h3').length,
    primaryActionCount: [...document.querySelectorAll('a,button')].filter((item) => item.getBoundingClientRect().width > 0 && item.getBoundingClientRect().height > 0).length,
  }));
  const label = viewport.width === 1440 ? 'desktop-1440x900' : 'mobile-390x844';
  const screenshot = path.join(evidenceDir, `homepage-${label}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  results.push({ route: '/', url: page.url(), viewport, httpStatus: response?.status() ?? null, classification: response?.ok() && pageState.h1 && !pageState.overflowX ? 'PASS' : 'DEGRADED', ...pageState, ...runtime, screenshot: path.relative(process.cwd(), screenshot) });
  await context.close();
}
await browser.close();
await writeFile(path.join(evidenceDir, 'runtime.json'), `${JSON.stringify({ capturedAt: new Date().toISOString(), deployment: { version: 64, canonicalCommit: '248a2a09c84a0734998850f8f3b85a14ddf3b78c', sitesSourceCommit: '8aca504b5d4231509bfd4d90d13aec949e979f58' }, results }, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ viewport, httpStatus, classification, overflowX, consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors, screenshot }) => ({ viewport, httpStatus, classification, overflowX, consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors, screenshot })), null, 2));
