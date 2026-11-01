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
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: string[];
  httpErrors: Array<{ status: number; url: string }>;
  axe?: { violations: Array<{ id: string; impact: string | null; description: string }>;
    incomplete: Array<{ id: string; impact: string | null }>;
    instrumentationConsole: string[] };
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
  page.on('console', (message) => {
    if (!current) return;
    if (message.type() === 'error') {
      if (axeConsole) axeConsole.push(message.text());
      else current.consoleErrors.push(message.text());
    }
    if (message.type() === 'warning') current.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => current?.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => current?.failedRequests.push(
    `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`
  ));
  page.on('response', (response) => {
    if (response.status() >= 400) current?.httpErrors.push({ status: response.status(), url: response.url() });
  });

  for (const route of routes) {
    current = {
      route, url: '', viewport, status: null, title: '', headings: [], bodyCharacters: 0,
      overflow: false, documentWidth: 0, viewportWidth: 0, consoleErrors: [], consoleWarnings: [],
      uncaughtExceptions: [], failedRequests: [], httpErrors: [], screenshot: '',
    };
    const response = await page.goto(route, { waitUntil: 'load' });
    current.status = response?.status() ?? null;
    current.url = page.url();
    await page.locator('body').waitFor();
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
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      current.axe = {
        violations: axe.violations.map(({ id, impact, description }) => ({ id, impact, description })),
        incomplete: axe.incomplete.map(({ id, impact }) => ({ id, impact })),
        instrumentationConsole: axeConsole,
      };
      axeConsole = undefined;
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
