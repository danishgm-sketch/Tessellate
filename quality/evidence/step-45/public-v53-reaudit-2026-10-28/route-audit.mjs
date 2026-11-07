/* global document, location, innerWidth, innerHeight */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.resolve('quality/evidence/step-45/public-v53-reaudit-2026-10-28');
const routes = [
  '/', '/explore', '/components', '/sections', '/blocks', '/pages', '/effects',
  '/motion', '/backgrounds', '/ai', '/data', '/compose', '/workbench',
  '/blueprints', '/collections', '/creators', '/showcase', '/trends', '/tools',
  '/agents', '/docs', '/sponsor', '/about', '/license', '/privacy', '/terms',
  '/r/dashboard-kpi-grid/', '/showcase/showcase-playful-hr/', '/blueprints/b2b-saas/',
  '/tools/section-planner/', '/docs/manifest/',
];
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { name: 'mobile-390x844', width: 390, height: 844, isMobile: true, hasTouch: true },
];

await mkdir(path.join(outputDir, 'routes'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.hasTouch,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  for (const route of routes) {
    const page = await context.newPage();
    const consoleMessages = [];
    const failedRequests = [];
    const badResponses = [];
    const responseStatuses = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleMessages.push({ type: message.type(), text: message.text().slice(0, 600) });
      }
    });
    page.on('pageerror', (error) => consoleMessages.push({ type: 'uncaught', text: String(error).slice(0, 1000) }));
    page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('response', (response) => {
      const request = response.request();
      const item = { url: response.url(), status: response.status(), type: request.resourceType() };
      responseStatuses.push(item);
      if (response.status() >= 400) badResponses.push(item);
    });

    let navigationStatus = null;
    let navigationError = null;
    const url = new URL(route, baseURL).toString();
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
      navigationStatus = response?.status() ?? null;
      await page.locator('body').waitFor({ state: 'visible', timeout: 15_000 });
      await page.waitForTimeout(900);
    } catch (error) {
      navigationError = String(error).slice(0, 1000);
    }

    const metrics = await page.evaluate(() => {
      const root = document.documentElement;
      const body = document.body;
      const brokenImages = [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src);
      return {
        title: document.title,
        url: location.href,
        viewport: { width: innerWidth, height: innerHeight },
        document: { width: root.scrollWidth, height: root.scrollHeight },
        horizontalOverflow: root.scrollWidth > innerWidth + 1,
        bodyText: (body?.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 1800),
        headings: [...document.querySelectorAll('h1,h2')].slice(0, 12).map((heading) => heading.innerText.trim()),
        mainCount: document.querySelectorAll('main').length,
        linkCount: document.querySelectorAll('a[href]').length,
        buttonCount: document.querySelectorAll('button').length,
        disabledButtonCount: document.querySelectorAll('button:disabled').length,
        brokenImages,
      };
    }).catch((error) => ({ evaluateError: String(error) }));

    const screenshot = path.join(outputDir, 'routes', `${route.replaceAll('/', '_') || 'home'}-${viewport.name}.png`);
    try {
      await page.screenshot({ path: screenshot, animations: 'disabled', fullPage: false });
    } catch (error) {
      results.push({ route, viewport: viewport.name, url, navigationStatus, navigationError, metrics, console: consoleMessages, failedRequests, badResponses, responseCount: responseStatuses.length, screenshot: null, screenshotError: String(error) });
      await page.close();
      continue;
    }
    results.push({ route, viewport: viewport.name, url, navigationStatus, navigationError, metrics, console: consoleMessages, failedRequests, badResponses, responseCount: responseStatuses.length, screenshot: path.relative(process.cwd(), screenshot).replaceAll('\\', '/') });
    await page.close();
  }
  await context.close();
}

await browser.close();
await writeFile(path.join(outputDir, 'route-audit.json'), `${JSON.stringify({ site: baseURL, siteVersion: 53, capturedAt: new Date().toISOString(), routes, viewports: viewports.map(({ name, width, height }) => ({ name, width, height })), results }, null, 2)}\n`);
console.log(JSON.stringify({ resultCount: results.length, routeCount: routes.length, viewportCount: viewports.length, errors: results.filter((x) => x.navigationError || x.navigationStatus >= 400 || x.failedRequests.length || x.badResponses.length || x.console.some((m) => m.type === 'error' || m.type === 'uncaught')).map((x) => ({ route: x.route, viewport: x.viewport, status: x.navigationStatus, navigationError: x.navigationError, failedRequests: x.failedRequests, badResponses: x.badResponses, console: x.console })) }, null, 2));
