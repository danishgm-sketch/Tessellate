import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const output = path.resolve('audit/evidence/step-39/live-v72/resource-preview-copy-sweep');
const catalogResponse = await fetch(`${site}/data/catalog.json`);
if (!catalogResponse.ok) throw new Error(`Catalogue request failed: ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const resources = catalog.resources;
if (!Array.isArray(resources) || resources.length !== 324) throw new Error(`Expected 324 resources; found ${resources?.length}`);
const uniqueSlugs = new Set(resources.map(({ slug }) => slug));
if (uniqueSlugs.size !== resources.length) throw new Error('Duplicate resource slugs in deployed catalogue');

const riskPatterns = [
  ['lorem-ipsum', /\blorem ipsum\b/i],
  ['placeholder-copy', /\b(?:coming soon|your text here|insert (?:text|content)|sample text)\b/i],
  ['unverified-accessibility-guarantee', /\b(?:fully accessible|100%\s*accessible|wcag\s*aaa compliant|zero accessibility issues)\b/i],
  ['unsupported-outcome-guarantee', /\b(?:zero hallucinations|guaranteed results|100%\s*accurate)\b/i],
  ['fake-customer-count', /\b(?:trusted by|used by|joined by)\s+[\d,]+/i],
  ['fake-performance-claim', /\b(?:99\.9%|zero latency|under \d+ms|enterprise-grade security)\b/i],
  ['product-specific-pricing-claims', /\b(?:Free Core|Team Sync|complete access to all 324|all 324 launch resources|cloud checkpoints & sync|custom DNA token storage|dedicated SLA|private registry|cancel anytime)\b/i],
  ['fictional-first-party-testimonial-or-press', /\b(?:TechCrunch|redefines how software teams|allowed our engineering team to ship|without hiring a dedicated design agency|architectural coherence is unmatched)\b/i],
  ['finance-domain-residue', /\b(?:order book|portfolio allocation|trading terminal|execute trades)\b/i],
];
const viewports = [
  { label: '1440x900', width: 1440, height: 900 },
  { label: '390x844', width: 390, height: 844 },
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const pages = await Promise.all(Array.from({ length: 4 }, () => context.newPage()));
  await Promise.all(pages.map(async (page, worker) => {
    let activeSlug = '';
    let runtime = null;
    const add = (key, value) => { if (runtime && activeSlug) runtime[key].push(String(value)); };
    page.on('console', (message) => {
      if (message.type() === 'error') add('consoleErrors', message.text());
      if (message.type() === 'warning') add('consoleWarnings', message.text());
    });
    page.on('pageerror', (error) => add('uncaughtExceptions', error.message));
    page.on('requestfailed', (request) => add('failedRequests', `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
    page.on('response', (response) => { if (response.status() >= 400) add('httpErrors', `${response.status()} ${response.url()}`); });

    for (let index = worker; index < resources.length; index += pages.length) {
      const resource = resources[index];
      activeSlug = resource.slug;
      runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] };
      const route = `/r/${encodeURIComponent(resource.slug)}/`;
      let status = null;
      let navigationError = null;
      let parent = null;
      let previewFrames = [];
      try {
        const response = await page.goto(`${site}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
        status = response?.status() ?? null;
        await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 15000 });
        parent = await page.evaluate(() => {
          const main = document.querySelector('main');
          const text = main?.innerText ?? '';
          return {
            title: document.title,
            h1: main?.querySelector('h1')?.innerText.trim() ?? '',
            text: text.slice(0, 3600),
            textLength: text.length,
            innerWidth: window.innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            frameCount: document.querySelectorAll('iframe').length,
            brokenImages: Array.from(document.images).filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src).slice(0, 8),
          };
        });
        previewFrames = await Promise.all(page.frames().slice(1).filter((frame) => frame.url() !== 'about:blank').map(async (frame) => {
          try {
            return await frame.evaluate(() => ({
              url: location.href,
              title: document.title,
              text: (document.body?.innerText ?? '').slice(0, 6000),
              textLength: document.body?.innerText.length ?? 0,
              bodyChildren: document.body?.children.length ?? 0,
              readyState: document.readyState,
            }));
          } catch (error) {
            return { url: frame.url(), inaccessible: error instanceof Error ? error.message : String(error) };
          }
        }));
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }
      const financeRelevant = ['categories', 'roles', 'tags', 'purposes'].some((key) =>
        Array.isArray(resource[key]) && resource[key].some((value) => /(^|[\s_-])(finance|fintech|trading|market|order-book|liquidity)([\s_-]|$)/i.test(String(value)))
      );
      const scannedText = [parent?.text ?? '', ...previewFrames.map((frame) => frame.text ?? '')].join('\n');
      const copyFlags = riskPatterns
        .filter(([name, expression]) => expression.test(scannedText) && (name !== 'finance-domain-residue' || !financeRelevant))
        .map(([name]) => name);
      const screenshotBase = `audit/evidence/step-39/live-v72/resource-route-sweep/screenshots/${resource.slug}-${viewport.label}.jpg`;
      const routeFailure = status !== 200 || Boolean(navigationError) || !parent?.h1 ||
        (parent?.documentWidth ?? 0) > (parent?.innerWidth ?? 0) + 1 || Boolean(parent?.brokenImages?.length) ||
        runtime.consoleErrors.length > 0 || runtime.uncaughtExceptions.length > 0 || runtime.failedRequests.length > 0 || runtime.httpErrors.length > 0;
      results.push({
        slug: resource.slug,
        route,
        viewport: viewport.label,
        status,
        navigationError,
        parent,
        previewFrames,
        previewFrameScreenshot: screenshotBase,
        copyFlags,
        routeFailure,
        runtime: structuredClone(runtime),
      });
    }
  }));
  await context.close();
}
await browser.close();

results.sort((a, b) => a.viewport.localeCompare(b.viewport) || a.slug.localeCompare(b.slug));
const failures = results.filter((row) => row.routeFailure || row.previewFrames.some((frame) => frame.inaccessible));
const copyFlagRows = results.filter((row) => row.copyFlags.length > 0);
const report = {
  capturedAt: new Date().toISOString(),
  siteVersion: 72,
  versionId: 'appgprj_6acc036de8cc8191a823339566972d85~appgver_a660452f84c88191b499c629ca5c0893',
  canonicalSourceCommit: 'b5f9f1ea9a884c544f3f7c8862655a69648e6464',
  siteSourceCommit: '95cf423eac1f30d22e3aaf8d8ba3d29d08cb53f57',
  deploymentId: 'appgdep_6ae7ba14362c819191d533692c30487b',
  site,
  catalogueCount: resources.length,
  uniqueSlugCount: uniqueSlugs.size,
  routeViewportCount: results.length,
  previewFrameCount: results.reduce((count, row) => count + row.previewFrames.length, 0),
  routeFailureCount: failures.length,
  copyFlagOccurrenceCount: copyFlagRows.length,
  copyFlagRows,
  failures,
  screenshotSource: 'The route screenshot for the exact slug and viewport is retained at previewFrameScreenshot from the preceding v72 648-route pass.',
  scanLimits: [
    'Risk patterns prioritize discovery. Each match requires human review and may be accurate for a specialized resource.',
    'Parent copy is limited to 3,600 characters and preview frame text to 6,000 characters per frame.',
    'This is not a semantic certification, a full interaction-state test, or a licence/provenance review.',
  ],
  results,
};
const reportPath = path.join(output, 'report.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ report: path.relative(process.cwd(), reportPath).replaceAll('\\', '/'), routeViewports: results.length, previewFrames: report.previewFrameCount, routeFailures: failures.length, copyFlagRows: copyFlagRows.length }));
/* global console, document, fetch, location, process, structuredClone, window */

