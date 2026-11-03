/* global document */

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('quality/evidence/step-39/public-v75-copy-risk-sweep-2026-11-03');
const viewports = [
  { name: '1440x900', width: 1440, height: 900, fullPage: true },
  { name: '390x844', width: 390, height: 844, fullPage: false },
];
const slugs = [
  'ai-multi-agent-board', 'ai-plan-review', 'marquee-typography', 'sticky-scroll-story',
  'number-count-up', 'version-history', 'data-hero', 'analytics-shell',
  'data-terminal-header', 'connection-lost-state', 'feature-with-live-demo',
  'kiosk-display-shell', 'interactive-globe',
];

await mkdir(path.join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const slug of slugs) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
      if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) => runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
    page.on('response', (response) => {
      if (response.status() >= 400) runtime.httpErrors.push({ status: response.status(), url: response.url() });
    });
    const route = `/r/${slug}/`;
    const response = await page.goto(new URL(route, site).href, { waitUntil: 'networkidle', timeout: 60000 });
    const frame = page.frames().find((candidate) => candidate.url().includes('/preview-content/'));
    if (!frame) throw new Error(`No isolated preview frame for ${slug} at ${viewport.name}`);
    await frame.locator('.tess-screen').waitFor({ state: 'visible', timeout: 20000 });
    const previewText = await frame.locator('body').innerText();
    const mainText = await page.locator('main').innerText();
    const buttons = await frame.locator('button').evaluateAll((items) => items.map((button) => ({
      text: (button.innerText || button.getAttribute('aria-label') || '').trim(),
      disabled: button.disabled,
      ariaDisabled: button.getAttribute('aria-disabled'),
      hasHandler: Boolean(button.onclick),
    })));
    const links = await frame.locator('a').evaluateAll((items) => items.map((link) => ({
      text: (link.innerText || link.getAttribute('aria-label') || '').trim(),
      href: link.getAttribute('href'),
    })));
    const geometry = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    const previewGeometry = await frame.locator('body').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
    }));
    const stem = `${slug}-${viewport.name}`;
    const screenshot = path.join(output, 'screenshots', `${stem}.png`);
    await page.screenshot({ path: screenshot, fullPage: viewport.fullPage });
    results.push({
      id: stem,
      route,
      url: page.url(),
      viewport: viewport.name,
      httpStatus: response?.status() ?? null,
      title: await page.title(),
      mainText,
      previewText,
      buttons,
      links,
      geometry,
      previewGeometry,
      runtime,
      screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/'),
    });
    await context.close();
    console.log(`captured ${stem}`);
  }
}

await browser.close();
const report = {
  capturedAt: new Date().toISOString(),
  publicSite: site,
  publicVersion: 75,
  canonicalSourceCommit: '8e1b07a7def8e94abaaf5701f758dd4812636d12',
  resultCount: results.length,
  failures: results.flatMap((result) => {
    const failures = [];
    if (result.httpStatus !== 200) failures.push(`${result.id}: HTTP ${result.httpStatus}`);
    if (result.runtime.consoleErrors.length) failures.push(`${result.id}: console errors`);
    if (result.runtime.uncaughtExceptions.length) failures.push(`${result.id}: uncaught exceptions`);
    if (result.runtime.failedRequests.length) failures.push(`${result.id}: failed requests`);
    if (result.runtime.httpErrors.length) failures.push(`${result.id}: HTTP errors`);
    if (result.geometry.horizontalOverflow || result.previewGeometry.horizontalOverflow) failures.push(`${result.id}: horizontal overflow`);
    return failures;
  }),
  results,
};
const reportPath = path.join(output, 'deployed-v75-copy-risk-sweep.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: reportPath, routes: results.length, failures: report.failures }, null, 2));
