import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('audit/evidence/step-39/live-v72/resource-route-sweep');
const catalogResponse = await fetch(`${site}/data/catalog.json`);
if (!catalogResponse.ok) throw new Error(`Catalogue request failed: ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const resources = catalog.resources;
if (!Array.isArray(resources) || resources.length !== 324) throw new Error(`Expected 324 resources; found ${resources?.length}`);
const slugs = new Set(resources.map(({ slug }) => slug));
if (slugs.size !== resources.length) throw new Error('Duplicate resource slugs in deployed catalogue');

const riskPatterns = [
  ['lorem-ipsum', /\blorem ipsum\b/i],
  ['placeholder-copy', /\b(?:coming soon|your text here|insert (?:text|content)|sample text)\b/i],
  ['unverified-accessibility-guarantee', /\b(?:fully accessible|100%\s*accessible|wcag\s*aaa compliant|zero accessibility issues)\b/i],
  ['unsupported-outcome-guarantee', /\b(?:zero hallucinations|guaranteed results|100%\s*accurate)\b/i],
  ['fake-customer-count', /\b(?:trusted by|used by|joined by)\s+[\d,]+/i],
  ['fake-performance-claim', /\b(?:99\.9%|zero latency|under \d+ms|enterprise-grade security)\b/i],
  ['finance-domain-residue', /\b(?:order book|portfolio allocation|trading terminal|execute trades)\b/i],
];
const viewports = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '390x844', width: 390, height: 844 },
];

await mkdir(path.join(output, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const pages = await Promise.all(Array.from({ length: 4 }, () => context.newPage()));
  await Promise.all(pages.map(async (page, worker) => {
    let activeSlug = '';
    let state = null;
    const push = (key, value) => { if (state && activeSlug) state[key].push(String(value)); };
    page.on('console', (message) => {
      if (message.type() === 'error') push('consoleErrors', message.text());
      if (message.type() === 'warning') push('consoleWarnings', message.text());
    });
    page.on('pageerror', (error) => push('uncaughtExceptions', error.message));
    page.on('request', () => { if (state) state.requestCount += 1; });
    page.on('requestfailed', (request) => push('failedRequests', `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
    page.on('response', (response) => {
      if (response.status() >= 400) push('httpErrors', `${response.status()} ${response.url()}`);
    });

    for (let index = worker; index < resources.length; index += pages.length) {
      const item = resources[index];
      activeSlug = item.slug;
      state = { requestCount: 0, consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      const route = `/r/${encodeURIComponent(item.slug)}/`;
      let status = null;
      let navigationError = null;
      let rendered = null;
      try {
        const response = await page.goto(`${site}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
        status = response?.status() ?? null;
        await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 15000 });
        rendered = await page.evaluate(() => {
          const main = document.querySelector('main');
          const fullText = main?.innerText ?? '';
          return {
            title: document.title,
            h1: main?.querySelector('h1')?.innerText.trim() ?? '',
            text: fullText.slice(0, 3600),
            textLength: fullText.length,
            innerWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src).slice(0, 8),
          };
        });
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }
      const financeRelevant = ['categories', 'roles', 'tags', 'purposes'].some((key) =>
        Array.isArray(item[key]) && item[key].some((value) => /(^|[\s_-])(finance|fintech|trading|market|order-book|liquidity)([\s_-]|$)/i.test(String(value)))
      );
      const fullText = rendered?.text ?? '';
      const copyFlags = riskPatterns
        .filter(([name, expression]) => expression.test(fullText) && (name !== 'finance-domain-residue' || !financeRelevant))
        .map(([name]) => name);
      const result = {
        slug: item.slug,
        name: item.name,
        route,
        viewport: viewport.label,
        status,
        navigationError,
        rendered,
        copyFlags,
        runtime: structuredClone(state),
      };
      results.push(result);
      const screenshot = path.join(output, 'screenshots', `${item.slug}-${viewport.label}.jpg`);
      await page.screenshot({ path: screenshot, type: 'jpeg', quality: 68, fullPage: false }).catch(() => undefined);
      result.screenshot = path.relative(process.cwd(), screenshot).replaceAll('\\', '/');
      const failed = status !== 200 || Boolean(navigationError) || !rendered?.h1 ||
        (rendered?.documentWidth ?? 0) > (rendered?.innerWidth ?? 0) + 1 || Boolean(rendered?.brokenImages?.length) ||
        result.runtime.consoleErrors.length > 0 || result.runtime.uncaughtExceptions.length > 0 ||
        result.runtime.failedRequests.length > 0 || result.runtime.httpErrors.length > 0;
      if (failed || copyFlags.length > 0) result.auditFlag = true;
    }
  }));
  await context.close();
}
await browser.close();

results.sort((a, b) => a.viewport.localeCompare(b.viewport) || a.slug.localeCompare(b.slug));
const routeFailures = results.filter((row) => row.status !== 200 || row.navigationError || !row.rendered?.h1 ||
  (row.rendered?.documentWidth ?? 0) > (row.rendered?.innerWidth ?? 0) + 1 || row.rendered?.brokenImages?.length ||
  row.runtime.consoleErrors.length || row.runtime.uncaughtExceptions.length || row.runtime.failedRequests.length || row.runtime.httpErrors.length);
const report = {
  capturedAt: new Date().toISOString(),
  siteVersion: 72,
  versionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_a660452f84c88191b499c629ca5c0893',
  canonicalSourceCommit: 'b5f9f1ea9a884c544f3f7c8862655a69648e6464',
  siteSourceCommit: '95cf423eac1f30d22e3aaf8d8ba3d29d08cb53f57',
  deploymentId: 'appgdep_6ae7ba14362c819191d533692c30487b',
  site,
  catalogueCount: resources.length,
  uniqueSlugCount: slugs.size,
  viewports: Object.fromEntries(viewports.map((viewport) => [viewport.label, results.filter((row) => row.viewport === viewport.label).length])),
  routeFailureCount: routeFailures.length,
  routeFailures,
  copyFlagOccurrenceCount: results.filter((row) => row.copyFlags.length).length,
  copyFlags: results.filter((row) => row.copyFlags.length).map((row) => ({ slug: row.slug, viewport: row.viewport, flags: row.copyFlags, excerpt: row.rendered?.text, screenshot: row.screenshot ?? null })),
  scanLimits: [
    'The copy rules are a conservative risk screen, not a semantic truth evaluator; each hit requires human review and may be a relevant example or documented product claim.',
    'The report records up to 3,600 characters of page text. A risk term beyond that excerpt may be missed.',
    'Preview iframe text is intentionally isolated from the parent-page scan; screenshots record the rendered preview but iframe copy was not separately extracted or semantically reviewed.',
    'This sweep exercises canonical /r/ routes at two viewports; it does not certify all resource states, variants, keyboard behavior, or all alias routes.',
  ],
  results,
};
const reportPath = path.join(output, 'report.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: path.relative(process.cwd(), reportPath).replaceAll('\\', '/'), routes: results.length, routeFailures: routeFailures.length, copyFlagOccurrences: report.copyFlagOccurrenceCount }));
/* global console, document, fetch, process, structuredClone, window */

