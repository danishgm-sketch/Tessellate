/* global document, getComputedStyle, console */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const root = process.cwd();
const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = path.resolve(root, 'audit/evidence/v26/responsive');
const routes = [
  '/',
  '/explore',
  '/compose',
  '/workbench',
  '/r/advanced-data-table',
  '/showcase/showcase-playful-hr',
  '/tools/typography',
];
const viewports = [360, 390, 430, 768, 1024, 1280, 1440, 1536];
const browser = await chromium.launch({ headless: true });
const results = [];

await mkdir(outputDirectory, { recursive: true });
try {
  for (const width of viewports) {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: width <= 430 ? 3 : 1,
      isMobile: width <= 430,
      hasTouch: width <= 430,
    });
    for (const route of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      const httpErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('requestfailed', (request) => {
        failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null });
      });
      page.on('response', (response) => {
        if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
      });

      let status = null;
      let navigationError = null;
      try {
        const response = await page.goto(`${baseUrl}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        status = response?.status() ?? null;
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
        await page.waitForTimeout(400);
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }

      let layout = null;
      let screenshot = null;
      if (status !== null) {
        layout = await page.evaluate(() => {
          const width = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const overflowContainers = [...document.querySelectorAll('*')]
            .filter((element) => {
              const style = getComputedStyle(element);
              return (
                element.scrollWidth > element.clientWidth + 2 &&
                /(auto|scroll)/.test(style.overflowX)
              );
            })
            .slice(0, 30)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              testId: element.dataset.testid ?? null,
              className: String(element.className).slice(0, 140),
              clientWidth: element.clientWidth,
              scrollWidth: element.scrollWidth,
              overflowX: getComputedStyle(element).overflowX,
              label: (element.getAttribute('aria-label') ?? element.innerText ?? '')
                .trim()
                .replace(/\s+/g, ' ')
                .slice(0, 90),
            }));
          const headings = [...document.querySelectorAll('h1,h2,h3')]
            .map((element) => element.textContent?.trim().replace(/\s+/g, ' ') ?? '')
            .filter(Boolean);
          return {
            viewportWidth: width,
            documentWidth: scrollWidth,
            horizontalOverflow: scrollWidth > width + 1,
            bodyWidth: document.body.scrollWidth,
            h1Count: document.querySelectorAll('h1').length,
            headings: headings.slice(0, 12),
            overflowContainers,
            visibleTextLength: document.body.innerText.trim().length,
          };
        });
        const safeRoute = route === '/' ? 'home' : route.replace(/^\//, '').replaceAll('/', '__');
        screenshot = path.join(outputDirectory, `${safeRoute}-${width}x844.png`);
        await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
      }
      results.push({ route, viewport: `${width}x844`, status, navigationError, screenshot, layout, consoleErrors, pageErrors, failedRequests, httpErrors });
      console.log(`${width} ${route} ${status ?? 'navigation-error'} overflow=${layout?.horizontalOverflow ?? 'n/a'} errors=${consoleErrors.length + pageErrors.length + failedRequests.length + httpErrors.length}`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(
  path.join(outputDirectory, 'report.json'),
  `${JSON.stringify({ site: baseUrl, version: 26, capturedAt: new Date().toISOString(), routes, viewports, results }, null, 2)}\n`,
  'utf8',
);
