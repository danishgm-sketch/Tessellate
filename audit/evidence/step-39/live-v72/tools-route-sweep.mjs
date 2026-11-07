import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('audit/evidence/step-39/live-v72/tools-route-sweep');
const routes = [
  '/tools/',
  '/tools/accessibility/',
  '/tools/backgrounds/',
  '/tools/dataviz/',
  '/tools/dna/',
  '/tools/icons/',
  '/tools/layout/',
  '/tools/motion/',
  '/tools/palette/',
  '/tools/section-planner/',
  '/tools/typography/',
];
const viewports = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '390x844', width: 390, height: 844 },
];
const riskPatterns = [
  ['lorem-ipsum', /\blorem ipsum\b/i],
  ['placeholder-copy', /\b(?:coming soon|your text here|insert (?:text|content)|sample text)\b/i],
  ['fake-customer-count', /\b(?:trusted by|used by|joined by)\s+[\d,]+/i],
  ['unsupported-live-claim', /\b(?:live (?:data|analytics|AI)|real[- ]time insights|AI powered)\b/i],
  ['finance-domain-residue', /\b(?:order book|portfolio allocation|trading terminal|execute trades)\b/i],
];

await mkdir(path.join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  let runtime = null;
  const add = (key, value) => { if (runtime) runtime[key].push(String(value)); };
  page.on('console', (message) => {
    if (message.type() === 'error') add('consoleErrors', message.text());
    if (message.type() === 'warning') add('consoleWarnings', message.text());
  });
  page.on('pageerror', (error) => add('uncaughtExceptions', error.message));
  page.on('requestfailed', (request) => add('failedRequests', `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
  page.on('response', (response) => { if (response.status() >= 400) add('httpErrors', `${response.status()} ${response.url()}`); });
  for (const route of routes) {
    runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
    let status = null;
    let navigationError = null;
    let view = null;
    try {
      const response = await page.goto(`${site}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
      status = response?.status() ?? null;
      await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 15000 });
      view = await page.evaluate(() => {
        const main = document.querySelector('main');
        const buttons = Array.from(main?.querySelectorAll('button') ?? []).map((el) => ({
          name: el.getAttribute('aria-label') || el.innerText.trim().replace(/\s+/g, ' ').slice(0, 100),
          disabled: el.disabled,
          visible: Boolean(el.getClientRects().length),
        }));
        const links = Array.from(main?.querySelectorAll('a[href]') ?? []).map((el) => ({
          name: el.innerText.trim().replace(/\s+/g, ' ').slice(0, 100),
          href: el.getAttribute('href'),
        }));
        return {
          title: document.title,
          h1: main?.querySelector('h1')?.innerText.trim() ?? '',
          text: (main?.innerText ?? '').slice(0, 6000),
          textLength: (main?.innerText ?? '').length,
          documentWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
          buttons,
          links,
        };
      });
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error);
    }
    const copyFlags = riskPatterns.filter(([, pattern]) => pattern.test(view?.text ?? '')).map(([name]) => name);
    const slug = route.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'index';
    const screenshot = path.join(output, 'screenshots', `${slug}-${viewport.label}.jpg`);
    await page.screenshot({ path: screenshot, type: 'jpeg', quality: 72, fullPage: false }).catch(() => undefined);
    results.push({ route, viewport: viewport.label, status, navigationError, view, copyFlags, runtime: structuredClone(runtime), screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/') });
  }
  await context.close();
}
await browser.close();
const failures = results.filter((item) => item.status !== 200 || item.navigationError || !item.view?.h1 ||
  (item.view?.documentWidth ?? 0) > (item.view?.innerWidth ?? 0) + 1 || item.runtime.consoleErrors.length ||
  item.runtime.uncaughtExceptions.length || item.runtime.failedRequests.length || item.runtime.httpErrors.length);
const report = {
  capturedAt: new Date().toISOString(),
  siteVersion: 72,
  url: site,
  routeCount: routes.length,
  viewportCount: viewports.length,
  captures: results.length,
  failureCount: failures.length,
  failures,
  copyFlagCount: results.reduce((count, item) => count + item.copyFlags.length, 0),
  results,
  limitations: [
    'This route/copy sample records rendered text and control labels but does not activate every tool control; functional tool certification belongs to the later ordered tools gate.',
    'Risk patterns are only a conservative manual-review aid; a match may be accurate and a no-match is not semantic proof.',
  ],
};
const reportPath = path.join(output, 'report.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: path.relative(process.cwd(), reportPath).replaceAll('\\', '/'), routes: routes.length, captures: results.length, failures: failures.length, copyFlags: report.copyFlagCount }));
/* global console, document, process, structuredClone, window */

