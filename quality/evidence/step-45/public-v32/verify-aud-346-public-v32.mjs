/* global URL, localStorage */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = process.cwd();
const modulePath = process.env.TESS_PLAYWRIGHT_MODULE;
const { chromium } = await import(pathToFileURL(path.join(modulePath, 'index.mjs')).href);
const fixturePath = path.join(root, 'apps/site/public/data/showcases/showcase-playful-hr.json');
const manifest = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
manifest.id = 'public-v32-catalogue-retry-audit';
manifest.name = 'Saved employee workspace';
const baseUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const badResponses = [];
const catalogResponses = [];
let catalogRequests = 0;
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(String(error)));
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
page.on('response', response => {
  if (response.status() >= 400) badResponses.push({ status: response.status(), url: response.url() });
  if (new URL(response.url()).pathname === '/data/catalog.json') catalogResponses.push(response.status());
});
await page.addInitScript(saved => {
  const serialized = JSON.stringify(saved);
  localStorage.setItem(`tessellate_project_${saved.id}`, serialized);
  localStorage.setItem('tessellate_active_project', serialized);
}, manifest);
await page.route('**/data/catalog.json', async route => {
  catalogRequests += 1;
  if (catalogRequests === 1) await route.fulfill({ status: 503, body: 'temporarily unavailable' });
  else await route.continue();
});
try {
  const response = await page.goto(`${baseUrl}/workbench?project=${manifest.id}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByRole('heading', { name: `Workbench: ${manifest.name}` }).waitFor({ state: 'visible', timeoutMs: 15000 });
  const startupCatalogRequests = catalogRequests;
  await page.screenshot({ path: path.join(outputDir, 'workbench-before-catalogue-1440x900.png'), fullPage: false });
  await page.getByTestId('left-panel').getByRole('button', { name: 'Library', exact: true }).click();
  const library = page.getByTestId('library-tab');
  await library.getByRole('alert').waitFor({ state: 'visible', timeoutMs: 10000 });
  const failureMessage = await library.getByRole('alert').innerText({ timeoutMs: 5000 });
  await page.screenshot({ path: path.join(outputDir, 'library-retry-state-1440x900.png'), fullPage: false });
  await library.getByRole('button', { name: 'Retry catalogue' }).click();
  await library.getByText(/Gold runtime/i).first().waitFor({ state: 'visible', timeoutMs: 20000 });
  await page.getByRole('heading', { name: `Workbench: ${manifest.name}` }).waitFor({ state: 'visible', timeoutMs: 5000 });
  await page.screenshot({ path: path.join(outputDir, 'library-recovered-1440x900.png'), fullPage: false });
  const outcome = {
    candidate: 'ChatGPT Sites v32 deployed Workbench catalogue outage check', siteVersion: 32,
    canonicalSourceCommit: '4eca97890e2d8182bcd72edfe5659997d4317c21',
    sitesSourceCommit: '5533d1082b649ec4429bb356cdc91ab3e2f2daf5',
    route: page.url(), viewport: '1440x900', pageStatus: response?.status() ?? null,
    savedProjectRestoredBeforeCatalogue: true, startupCatalogRequests,
    firstCatalogueFailure: { status: catalogResponses[0] ?? null, retryableMessage: failureMessage },
    catalogueRequests: catalogRequests, catalogueResponseStatuses: catalogResponses,
    projectStillVisibleAfterFailureAndRetry: true,
    consoleErrors, pageErrors, failedRequests, badResponses,
    screenshots: ['workbench-before-catalogue-1440x900.png','library-retry-state-1440x900.png','library-recovered-1440x900.png'],
    capturedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.join(outputDir, 'aud-346-live-verification.json'), JSON.stringify(outcome, null, 2) + '\n');
  process.stdout.write(JSON.stringify(outcome, null, 2) + '\n');
} finally { await context.close(); await browser.close(); }
