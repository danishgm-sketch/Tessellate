/* global document, getComputedStyle, innerHeight, innerWidth, location */

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const root = path.resolve('quality/evidence/step-45/public-v51-recheck-2026-10-28');
const routes = [
  '/', '/explore', '/components', '/sections', '/blocks', '/pages', '/effects', '/motion',
  '/backgrounds', '/ai', '/data', '/compose', '/workbench', '/blueprints', '/collections',
  '/creators', '/showcase', '/trends', '/tools', '/agents', '/docs', '/sponsor', '/about',
  '/license', '/privacy', '/terms',
  '/r/button', '/showcase/showcase-playful-hr', '/blueprints/b2b-saas', '/tools/palette',
  '/docs/manifest', '/showcases',
];
const majorRoutes = ['/', '/explore', '/compose', '/workbench', '/tools', '/docs'];
const primarySizes = [{ width: 1440, height: 900 }, { width: 390, height: 844 }];
const responsiveSizes = [360, 430, 768, 1024, 1280, 1536].map((width) => ({ width, height: 900 }));
const cases = [
  ...routes.flatMap((route) => primarySizes.map((size) => ({ route, ...size, kind: 'route' }))),
  ...majorRoutes.flatMap((route) => responsiveSizes.map((size) => ({ route, ...size, kind: 'responsive' }))),
];
const placeholders = /lorem ipsum|\bTODO\b|\bundefined\b|coming soon|sample page/i;
const browser = await chromium.launch({ headless: true });
const results = [];
await fs.mkdir(path.join(root, 'routes'), { recursive: true });

for (let index = 0; index < cases.length; index += 1) {
  const item = cases[index];
  const viewport = { width: item.width, height: item.height };
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: item.width <= 430, hasTouch: item.width <= 430 });
  const page = await context.newPage();
  const consoleErrors = [];
  const consoleWarnings = [];
  const uncaughtExceptions = [];
  const failedRequests = [];
  const httpErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); if (message.type() === 'warning') consoleWarnings.push(message.text()); });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({ method: request.method(), url: request.url(), error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() }); });
  let responseStatus = null;
  let navigationError = null;
  let screenshot = null;
  let dom = null;
  try {
    const response = await page.goto(`${site}${item.route}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    responseStatus = response?.status() ?? null;
    await page.waitForTimeout(650);
    await page.evaluate(() => document.fonts?.ready);
    dom = await page.evaluate(() => {
      const main = document.querySelector('main') ?? document.body;
      const visible = (element) => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element); return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'; };
      const named = (element) => (element.getAttribute('aria-label') || element.getAttribute('title') || element.innerText || element.textContent || '').trim();
      return {
        url: location.href, title: document.title, viewport: { width: innerWidth, height: innerHeight },
        document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
        hasMain: Boolean(document.querySelector('main')), mainVisible: visible(main), mainText: (main.innerText || '').trim().slice(0, 2500),
        headingNames: [...document.querySelectorAll('h1,h2,h3')].filter(visible).slice(0, 30).map((node) => ({ level: node.tagName, text: (node.innerText || '').trim().slice(0, 180) })),
        buttons: [...document.querySelectorAll('button,[role="button"]')].filter(visible).slice(0, 80).map((node) => ({ name: named(node).slice(0, 120), disabled: Boolean(node.disabled || node.getAttribute('aria-disabled') === 'true') })),
        links: [...document.querySelectorAll('a[href]')].filter(visible).slice(0, 120).map((node) => ({ name: named(node).slice(0, 120), href: node.href })),
        unnamedButtons: [...document.querySelectorAll('button,[role="button"]')].filter(visible).filter((node) => !named(node)).length,
        unnamedLinks: [...document.querySelectorAll('a[href]')].filter(visible).filter((node) => !named(node)).length,
        unlabeledFields: [...document.querySelectorAll('input:not([type="hidden"]),textarea,select')].filter(visible).filter((node) => !node.labels?.length && !node.getAttribute('aria-label') && !node.getAttribute('aria-labelledby')).length,
      };
    });
    const stem = item.route === '/' ? 'home' : item.route.replace(/^\//, '').replace(/\//g, '__').replace(/[^a-z0-9_-]/gi, '_');
    screenshot = path.join(root, 'routes', `${item.kind}-${stem}-${item.width}x${item.height}.png`);
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
  } catch (error) { navigationError = error instanceof Error ? error.message : String(error); }
  const empty = !dom?.mainText?.trim();
  const overflow = Boolean(dom && dom.document.width > item.width);
  const placeholderText = Boolean(dom?.mainText && placeholders.test(dom.mainText));
  let classification = 'PASS';
  if (navigationError || (responseStatus ?? 0) >= 400 || !dom?.mainVisible || empty) classification = 'BROKEN';
  else if (overflow || consoleErrors.length || uncaughtExceptions.length || failedRequests.length || httpErrors.length || dom.unnamedButtons || dom.unlabeledFields) classification = 'DEGRADED';
  else if (placeholderText) classification = 'PLACEHOLDER';
  results.push({
    id: `LIVE-${String(index + 1).padStart(3, '0')}`, route: item.route, url: dom?.url ?? `${site}${item.route}`,
    viewport: `${item.width}x${item.height}`, kind: item.kind, responseStatus, classification,
    visual: { horizontalOverflow: overflow, scrollWidth: dom?.document.width ?? null, viewportWidth: item.width, pageHeight: dom?.document.height ?? null },
    title: dom?.title ?? null, headings: dom?.headingNames ?? [], mainText: dom?.mainText ?? null,
    interactive: dom ? { visibleButtons: dom.buttons.length, disabledButtons: dom.buttons.filter((button) => button.disabled).length, unnamedButtons: dom.unnamedButtons, visibleLinks: dom.links.length, unnamedLinks: dom.unnamedLinks, unlabeledFields: dom.unlabeledFields } : null,
    consoleErrors, consoleWarnings, uncaughtExceptions, failedRequests, httpErrors, navigationError,
    screenshot: screenshot ? path.relative(process.cwd(), screenshot) : null,
  });
  await context.close();
  if ((index + 1) % 10 === 0 || index + 1 === cases.length) console.log(`audited ${index + 1}/${cases.length}`);
}
await browser.close();
const report = {
  site, siteVersion: 51, canonicalSourceCommit: 'e70450cba88cf09d2f68ee126e31a51474c54de2',
  sitesMirrorCommit: 'e19db8af22097eb6d20a9fb2555157234ea1831d', startedAt: new Date().toISOString(),
  caseCount: results.length,
  counts: Object.fromEntries(['PASS', 'DEGRADED', 'BROKEN', 'PLACEHOLDER', 'MISLEADING'].map((status) => [status, results.filter((result) => result.classification === status).length])),
  routeResults: results,
};
await fs.writeFile(path.join(root, 'route-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  report: path.join(root, 'route-audit.json'), counts: report.counts, routeCases: report.caseCount,
  consoleErrors: results.reduce((sum, result) => sum + result.consoleErrors.length, 0),
  failedRequests: results.reduce((sum, result) => sum + result.failedRequests.length, 0),
  httpErrors: results.reduce((sum, result) => sum + result.httpErrors.length, 0),
  overflowCases: results.filter((result) => result.visual.horizontalOverflow).length,
  broken: results.filter((result) => result.classification === 'BROKEN').map(({ route, viewport, responseStatus, navigationError }) => ({ route, viewport, responseStatus, navigationError })),
}, null, 2));
