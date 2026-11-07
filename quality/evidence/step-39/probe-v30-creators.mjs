/* global process, console, document */
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require(path.resolve('node_modules/.pnpm/playwright@1.63.0/node_modules/playwright'));
const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const evidenceDirectory = path.resolve('quality/evidence/step-39/deployed-v30-creators');
fs.mkdirSync(evidenceDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const runtime = { console: [], uncaught: [], failed: [], badResponses: [] };
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) runtime.console.push({ type: message.type(), text: message.text().slice(0, 500) }); });
    page.on('pageerror', error => runtime.uncaught.push(String(error)));
    page.on('requestfailed', request => runtime.failed.push({ url: request.url(), error: request.failure()?.errorText }));
    page.on('response', response => { if (response.status() >= 400) runtime.badResponses.push({ url: response.url(), status: response.status() }); });
    const response = await page.goto(`${site}/creators`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      title: document.title,
      visibleText: document.body.innerText,
      links: [...document.querySelectorAll('main a[href]')].map(anchor => ({ label: anchor.innerText.trim(), href: anchor.href })),
    }));
    const screenshot = path.join(evidenceDirectory, `${viewport.width}x${viewport.height}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    results.push({
      route: '/creators',
      viewport: `${viewport.width}x${viewport.height}`,
      url: page.url(),
      httpStatus: response?.status() ?? null,
      layout: { clientWidth: metrics.clientWidth, scrollWidth: metrics.scrollWidth },
      title: metrics.title,
      visibleText: metrics.visibleText,
      links: metrics.links,
      runtime,
      screenshot: path.relative(process.cwd(), screenshot),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const evidence = { generatedAt: new Date().toISOString(), site, version: 30, results };
fs.writeFileSync(path.resolve('quality/evidence/step-39/deployed-v30-creators.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(results.map(({ route, viewport, httpStatus, layout, runtime, screenshot }) => ({ route, viewport, httpStatus, layout, consoleErrors: runtime.console.length, uncaught: runtime.uncaught.length, failed: runtime.failed.length, badResponses: runtime.badResponses.length, screenshot })), null, 2));
