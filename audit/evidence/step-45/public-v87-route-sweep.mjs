/* global document, location, innerHeight, innerWidth, console */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const origin = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const routes = [
  '/', '/explore', '/components', '/sections', '/blocks', '/pages', '/effects',
  '/motion', '/backgrounds', '/ai', '/data', '/compose', '/workbench',
  '/blueprints', '/collections', '/creators', '/showcase', '/trends', '/tools',
  '/agents', '/docs', '/sponsor', '/about', '/license', '/privacy', '/terms',
  '/r/editorial-hero', '/showcase/showcase-playful-hr', '/blueprints/b2b-saas',
  '/tools/palette', '/docs/cli',
];
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false },
  { name: 'mobile-390x844', width: 390, height: 844, isMobile: true },
];
const outDir = 'audit/evidence/step-45/public-v87-route-sweep';
await fs.mkdir(path.join(outDir, 'screenshots'), { recursive: true });
const previousReport = await fs.readFile(path.join(outDir, 'report.json'), 'utf8')
  .then((contents) => JSON.parse(contents))
  .catch(() => null);
const previousReview = new Map((previousReport?.results ?? []).map((result) => [
  `${result.route}|${result.viewport}`,
  { classification: result.classification, classificationNote: result.classificationNote },
]));

const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const consoleWarnings = [];
    const uncaught = [];
    const failedRequests = [];
    const httpErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => uncaught.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? 'unknown',
    }));
    page.on('response', (response) => {
      if (response.status() >= 400) httpErrors.push({
        url: response.url(),
        status: response.status(),
      });
    });

    let status = 0;
    let navigationError = null;
    try {
      const response = await page.goto(`${origin}${route}`, {
        waitUntil: 'networkidle',
        timeout: 45_000,
      });
      status = response?.status() ?? 0;
      await page.waitForTimeout(route === '/workbench' ? 2_800 : route === '/compose' ? 1_800 : 500);
    } catch (error) {
      navigationError = error instanceof Error ? error.message : String(error);
    }

    const safeRouteName = route === '/' ? 'home' : route.replaceAll('/', '_').replace(/^_/, '');
    const screenshot = path.join(outDir, 'screenshots', `${safeRouteName}-${viewport.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: false }).catch(() => undefined);
    const dom = await page.evaluate(() => {
      const main = document.querySelector('main');
      const text = main?.innerText ?? document.body.innerText;
      return {
        url: location.href,
        title: document.title,
        viewport: `${innerWidth}x${innerHeight}`,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        h1: document.querySelector('main h1, h1')?.innerText?.trim() ?? null,
        mainTextLength: text.trim().length,
        mainText: text.trim().slice(0, 5_000),
        links: [...(main ?? document.body).querySelectorAll('a[href]')]
          .slice(0, 80)
          .map((anchor) => ({ text: anchor.innerText.trim(), href: anchor.getAttribute('href') })),
        buttons: [...(main ?? document.body).querySelectorAll('button')]
          .slice(0, 80)
          .map((button) => ({
            text: button.innerText.trim(),
            disabled: button.disabled,
            ariaLabel: button.getAttribute('aria-label'),
          })),
      };
    }).catch(() => ({ url: `${origin}${route}`, title: '', viewport: '', documentWidth: null, documentHeight: null, h1: null, mainTextLength: 0, mainText: '', links: [], buttons: [] }));

    results.push({
      route,
      viewport: viewport.name,
      status,
      navigationError,
      ...dom,
      horizontalOverflow: dom.documentWidth !== null && dom.documentWidth > viewport.width,
      consoleErrors,
      consoleWarnings,
      uncaught,
      failedRequests,
      httpErrors,
      screenshot: screenshot.replaceAll('\\', '/'),
      classification: previousReview.get(`${route}|${viewport.name}`)?.classification ?? 'pending-manual-content-review',
      classificationNote: previousReview.get(`${route}|${viewport.name}`)?.classificationNote ?? null,
    });
    await context.close();
  }
}

await browser.close();
const report = {
  site: origin,
  version: 87,
  canonicalCommit: '73cca33c263d8c1f6ae93fb35347ad7e33b7e749',
  sitesMirrorCommit: '20ebad8da9aa0ead9fff30581986f671be7d8a00',
  generatedAt: new Date().toISOString(),
  scope: '31 public routes at 1440x900 and 390x844; route shell, visible text, controls, console/network, overflow, and screenshot capture. Not a claim that every interaction on every route was exercised.',
  manualReview: previousReport?.manualReview ?? null,
  supplementalRoutes: previousReport?.supplementalRoutes ?? [],
  results,
};
await fs.writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  routes: routes.length,
  captures: results.length,
  non200: results.filter((result) => result.status !== 200).map(({ route, viewport, status }) => ({ route, viewport, status })),
  consoleErrors: results.reduce((sum, result) => sum + result.consoleErrors.length, 0),
  uncaught: results.reduce((sum, result) => sum + result.uncaught.length, 0),
  failedRequests: results.reduce((sum, result) => sum + result.failedRequests.length, 0),
  httpErrors: results.reduce((sum, result) => sum + result.httpErrors.length, 0),
  overflows: results.filter((result) => result.horizontalOverflow).map(({ route, viewport }) => ({ route, viewport })),
  report: path.join(outDir, 'report.json'),
}));
