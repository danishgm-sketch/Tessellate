import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/* global process, document, location, console */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const output = path.resolve(
  root,
  process.env.TESSELLATE_AUDIT_OUTPUT ?? 'audit/evidence/v24'
);
const baseURL = (process.env.TESSELLATE_AUDIT_URL ??
  'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site').replace(/\/$/, '');
const routes = [
  '/',
  '/explore',
  '/components',
  '/sections',
  '/blocks',
  '/pages',
  '/effects',
  '/motion',
  '/backgrounds',
  '/ai',
  '/data',
  '/compose',
  '/workbench',
  '/blueprints',
  '/collections',
  '/creators',
  '/showcase',
  '/trends',
  '/tools',
  '/agents',
  '/docs',
  '/sponsor',
  '/about',
  '/license',
  '/privacy',
  '/terms',
  '/r/advanced-data-table',
  '/showcase/showcase-playful-hr',
  '/blueprints/b2b-saas',
  '/tools/typography',
  '/docs/cli',
];
const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
];
const axeRoutes = new Set([
  '/',
  '/explore',
  '/compose',
  '/workbench',
  '/r/advanced-data-table',
  '/showcase/showcase-playful-hr',
]);
const all = [];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const route of routes) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });
      const page = await context.newPage();
      const current = {
        route,
        viewport: `${viewport.width}x${viewport.height}`,
        consoleErrors: [],
        consoleWarnings: [],
        uncaughtExceptions: [],
        failedRequests: [],
        responses: [],
      };
      page.on('console', (message) => {
        if (message.type() === 'error') current.consoleErrors.push(message.text());
        if (message.type() === 'warning') current.consoleWarnings.push(message.text());
      });
      page.on('pageerror', (error) => current.uncaughtExceptions.push(error.message));
      page.on('requestfailed', (request) => {
        current.failedRequests.push({
          method: request.method(),
          url: request.url(),
          error: request.failure()?.errorText ?? 'unknown',
        });
      });
      page.on('response', (response) => {
        current.responses.push({
          url: response.url(),
          status: response.status(),
          resourceType: response.request().resourceType(),
        });
      });

      let navigationStatus = null;
      let navigationError = null;
      try {
        const response = await page.goto(`${baseURL}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });
        navigationStatus = response?.status() ?? null;
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => undefined);
        await page.waitForTimeout(500);
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }

      let pageState = null;
      let screenshot = null;
      if (navigationStatus !== null) {
        pageState = await page.evaluate(() => {
          const headings = [...document.querySelectorAll('h1,h2,h3')].map((item) => ({
            tag: item.tagName.toLowerCase(),
            text: item.textContent?.trim().replace(/\s+/g, ' ') ?? '',
          }));
          const images = [...document.images].map((image) => ({
            src: image.currentSrc || image.src,
            loaded: image.complete && image.naturalWidth > 0,
            alt: image.alt,
          }));
          const rootWidth = document.documentElement.scrollWidth;
          const viewportWidth = document.documentElement.clientWidth;
          const text = document.body.innerText.replace(/\s+/g, ' ').trim();
          return {
            title: document.title,
            url: location.href,
            headings,
            h1Count: document.querySelectorAll('h1').length,
            mainCount: document.querySelectorAll('main').length,
            visibleButtons: [...document.querySelectorAll('button')]
              .filter((button) => button.getClientRects().length > 0)
              .map((button) => ({
                text: button.innerText.trim().replace(/\s+/g, ' ').slice(0, 90),
                disabled: button.disabled,
                label: button.getAttribute('aria-label'),
              })),
            links: [...document.querySelectorAll('a[href]')]
              .filter((link) => link.getClientRects().length > 0)
              .map((link) => ({
                text: link.innerText.trim().replace(/\s+/g, ' ').slice(0, 90),
                href: link.href,
              })),
            textLength: text.length,
            textStart: text.slice(0, 1200),
            horizontalOverflow: rootWidth > viewportWidth + 1,
            documentWidth: rootWidth,
            viewportWidth,
            unloadedImages: images.filter((image) => !image.loaded),
            imageCount: images.length,
          };
        });

        const safeRoute = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\/$/, '').replaceAll('/', '__');
        const screenshotPath = path.join(output, `${safeRoute}-${viewport.name}.png`);
        screenshot = path.relative(root, screenshotPath).replaceAll('\\', '/');
        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' });
        await page.waitForTimeout(250);

        if (viewport.name.startsWith('desktop') && axeRoutes.has(route)) {
          const consoleErrorCountBeforeAxe = current.consoleErrors.length;
          try {
            const axe = await new AxeBuilder({ page }).analyze();
            current.axe = {
              violations: axe.violations.map((item) => ({
                id: item.id,
                impact: item.impact,
                description: item.description,
                help: item.help,
                nodes: item.nodes.map((node) => ({ target: node.target, failureSummary: node.failureSummary })),
              })),
              passes: axe.passes.length,
              incomplete: axe.incomplete.length,
            };
          } catch (error) {
            current.axeError = error instanceof Error ? error.message : String(error);
          } finally {
            current.axeToolConsoleMessages = current.consoleErrors.splice(consoleErrorCountBeforeAxe);
          }
        }
      }

      const entry = {
        ...current,
        navigationStatus,
        navigationError,
        screenshot,
        page: pageState,
      };
      all.push(entry);
      console.log(`${entry.viewport} ${route} ${navigationStatus ?? 'navigation-error'} h1=${pageState?.h1Count ?? 0} overflow=${pageState?.horizontalOverflow ?? 'n/a'} errors=${entry.consoleErrors.length + entry.uncaughtExceptions.length + entry.failedRequests.length}`);
      await context.close();
    }
  }

  await writeFile(
    path.join(output, 'route-audit.json'),
    JSON.stringify({ site: baseURL, siteVersion: process.env.TESSELLATE_AUDIT_VERSION ?? 24, capturedAt: new Date().toISOString(), routes: all }, null, 2),
    'utf8'
  );
} finally {
  await browser.close();
}
