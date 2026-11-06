import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const routes = [
  '/', '/explore', '/components', '/sections', '/blocks', '/pages', '/effects', '/motion',
  '/backgrounds', '/ai', '/data', '/compose', '/workbench', '/blueprints', '/collections',
  '/creators', '/showcase', '/trends', '/tools', '/agents', '/docs', '/sponsor', '/about',
  '/license', '/privacy', '/terms', '/r/advanced-data-table', '/showcase/showcase-playful-hr/',
  '/blueprints/b2b-saas/', '/tools/palette', '/docs/cli',
];
const axeRoutes = new Set(['/', '/explore', '/compose', '/workbench', '/r/advanced-data-table', '/showcase/showcase-playful-hr/']);
const outputRoot = path.dirname(fileURLToPath(import.meta.url));
const deployedSiteUrl = process.env.TESS_SITE_URL;
if (!deployedSiteUrl) throw new Error('Set TESS_SITE_URL to the deployed review Site before running this audit.');

type RouteEvidence = {
  route: string;
  url: string;
  viewport: string;
  status: number | null;
  title: string;
  headings: string[];
  bodyCharacters: number;
  overflow: boolean;
  documentWidth: number;
  viewportWidth: number;
  catalogueStatus?: string;
  catalogueCards?: number;
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: string[];
  navigationAborts: string[];
  httpErrors: Array<{ status: number; url: string }>;
  axe?: { violations: Array<{ id: string; impact: string | null; description: string }>;
    incomplete: Array<{ id: string; impact: string | null }>;
    instrumentationConsole: string[];
    instrumentationWarnings: string[] };
  screenshot: string;
};

test('public routes and core accessibility remain clean in the deployed Site', async ({ page }, info) => {
  test.setTimeout(240_000);
  const viewport = info.project.name;
  const screenshotDirectory = path.join(outputRoot, 'screenshots', viewport);
  await mkdir(screenshotDirectory, { recursive: true });
  const all: RouteEvidence[] = [];
  let current: RouteEvidence | undefined;
  let axeConsole: string[] | undefined;
  let axeWarnings: string[] | undefined;
  const requestOwners = new WeakMap<import('@playwright/test').Request, RouteEvidence>();
  page.on('request', (request) => {
    if (current) requestOwners.set(request, current);
  });
  page.on('console', (message) => {
    if (!current) return;
    if (message.type() === 'error') {
      if (axeConsole) axeConsole.push(message.text());
      else current.consoleErrors.push(message.text());
    }
    if (message.type() === 'warning') {
      if (axeWarnings) axeWarnings.push(message.text());
      else current.consoleWarnings.push(message.text());
    }
  });
  page.on('pageerror', (error) => current?.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => {
    const owner = requestOwners.get(request);
    const target = owner ?? current;
    const failure = request.failure()?.errorText ?? '';
    const description = `${request.method()} ${request.url()} ${failure}`;
    if (failure === 'net::ERR_ABORTED' && owner && owner !== current) {
      owner.navigationAborts.push(`${description} (next route: ${current?.route ?? 'unknown'})`);
      return;
    }
    target?.failedRequests.push(description);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const owner = requestOwners.get(response.request());
      (owner ?? current)?.httpErrors.push({ status: response.status(), url: response.url() });
    }
  });

  for (const route of routes) {
    current = {
      route, url: '', viewport, status: null, title: '', headings: [], bodyCharacters: 0,
      overflow: false, documentWidth: 0, viewportWidth: 0, consoleErrors: [], consoleWarnings: [],
      uncaughtExceptions: [], failedRequests: [], navigationAborts: [], httpErrors: [], screenshot: '',
    };
    const response = await page.goto(route, { waitUntil: 'load' });
    current.status = response?.status() ?? null;
    current.url = page.url();
    await page.locator('body').waitFor();
    const catalogueStatus = page.locator('#explore-catalogue-status');
    if (await catalogueStatus.count()) {
      await expect(catalogueStatus, `${route} catalogue readiness`).toContainText(
        /^Showing \d+ of \d+ resources?$/,
        { timeout: 30_000 },
      );
      await expect(page.getByTestId('resource-card-skeleton-grid')).toHaveCount(0);
      current.catalogueStatus = await catalogueStatus.innerText();
      current.catalogueCards = await page.locator('a[href^="/r/"]').evaluateAll((links) =>
        [...new Set(links.map((link) => link.getAttribute('href')))].length,
      );
    }
    if (route === '/compose') {
      await expect(page.getByTestId('catalog-status'), 'Compose catalogue readiness').toContainText('Catalogue ready', {
        timeout: 30_000,
      });
    }
    if (route === '/workbench') {
      await expect(page.getByTestId('top-toolbar'), 'direct Workbench startup completes').toBeVisible({
        timeout: 30_000,
      });
      if (info.project.use.viewport?.width && info.project.use.viewport.width < 1024) {
        await expect(page.getByTestId('mobile-workbench')).toBeVisible();
      } else {
        await expect(page.getByTestId('command-bar')).toBeVisible();
      }
    }
    if (route === '/r/advanced-data-table') {
      const preview = page.locator('iframe[title$="live preview"]');
      await expect(preview).toBeVisible();
      await expect(preview.locator('xpath=..')).toHaveAttribute('aria-busy', 'false', {
        timeout: 30_000,
      });
    }
    const state = await page.evaluate(() => ({
      title: document.title,
      headings: [...document.querySelectorAll('h1,h2')].slice(0, 8).map((heading) => heading.textContent?.trim() ?? ''),
      bodyCharacters: document.body.innerText.trim().length,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    Object.assign(current, state, { overflow: state.documentWidth > state.viewportWidth + 1 });
    const filename = `${String(all.length + 1).padStart(2, '0')}-${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home'}.png`;
    current.screenshot = path.join('screenshots', viewport, filename).replace(/\\/g, '/');
    await page.screenshot({ path: path.join(screenshotDirectory, filename), fullPage: true });

    if (axeRoutes.has(route)) {
      axeConsole = [];
      axeWarnings = [];
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      current.axe = {
        violations: axe.violations.map(({ id, impact, description }) => ({ id, impact, description })),
        incomplete: axe.incomplete.map(({ id, impact }) => ({ id, impact })),
        instrumentationConsole: axeConsole,
        instrumentationWarnings: axeWarnings,
      };
      axeConsole = undefined;
      axeWarnings = undefined;
    }
    all.push(current);
  }

  const report = {
    deploymentUrl: new URL('/', deployedSiteUrl).toString(),
    viewport,
    routesRequested: routes.length,
    routes: all,
    totals: {
      httpFailures: all.filter((entry) => entry.status !== 200).length,
      consoleErrors: all.reduce((n, entry) => n + entry.consoleErrors.length, 0),
      uncaughtExceptions: all.reduce((n, entry) => n + entry.uncaughtExceptions.length, 0),
      failedRequests: all.reduce((n, entry) => n + entry.failedRequests.length, 0),
      navigationAborts: all.reduce((n, entry) => n + entry.navigationAborts.length, 0),
      badResponses: all.reduce((n, entry) => n + entry.httpErrors.length, 0),
      overflow: all.filter((entry) => entry.overflow).length,
      axeScans: all.filter((entry) => entry.axe).length,
      axeViolations: all.reduce((n, entry) => n + (entry.axe?.violations.length ?? 0), 0),
      axeIncomplete: all.reduce((n, entry) => n + (entry.axe?.incomplete.length ?? 0), 0),
    },
  };
  await writeFile(path.join(outputRoot, `route-audit-${viewport}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(report.totals.httpFailures, `${viewport} HTTP route failures`).toBe(0);
  expect(all.filter((entry) => entry.bodyCharacters <= 20).map((entry) => entry.route), `${viewport} empty pages`).toEqual([]);
  expect(report.totals.consoleErrors, `${viewport} console errors`).toBe(0);
  expect(report.totals.uncaughtExceptions, `${viewport} uncaught exceptions`).toBe(0);
  expect(report.totals.failedRequests, `${viewport} failed requests`).toBe(0);
  expect(report.totals.badResponses, `${viewport} failed responses`).toBe(0);
  expect(report.totals.overflow, `${viewport} overflow routes`).toBe(0);
  expect(report.totals.axeViolations, `${viewport} Axe violations`).toBe(0);
});
