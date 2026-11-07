import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

const site = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDir = path.resolve('quality/evidence/step-45/public-v51-recheck-2026-10-28/network');
const brief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const runs = [];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: viewport.width <= 430,
    hasTouch: viewport.width <= 430,
  });
  const page = await context.newPage();
  const responses = [];
  const failedRequests = [];
  const consoleErrors = [];
  const uncaughtExceptions = [];
  page.on('response', async (response) => {
    const request = response.request();
    const size = response.headers()['content-length'] ?? null;
    responses.push({
      method: request.method(),
      url: response.url(),
      resourceType: request.resourceType(),
      status: response.status(),
      contentLength: size,
    });
  });
  page.on('requestfailed', (request) => failedRequests.push({
    method: request.method(),
    url: request.url(),
    resourceType: request.resourceType(),
    error: request.failure()?.errorText ?? null,
  }));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));

  const viewportName = `${viewport.width}x${viewport.height}`;
  const pageResponse = await page.goto(`${site}/compose`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('catalog-status').waitFor({ state: 'visible' });
  await page.getByTestId('catalog-status').getByText('Catalogue ready', { exact: false }).waitFor({ state: 'visible' });
  const catalogReady = await page.getByTestId('catalog-status').innerText();
  await page.screenshot({ path: path.join(outputDir, `compose-${viewportName}.png`), fullPage: false });

  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await page.getByText('Inferred Product Architecture', { exact: true }).waitFor({ state: 'visible' });
  for (const direction of ['01', '02', '03']) {
    await page.getByTestId(`direction-preview-${direction}`).waitFor({ state: 'visible' });
  }
  await page.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(/\/workbench\?project=/);
  await page.getByTestId('top-toolbar').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(outputDir, `workbench-${viewportName}.png`), fullPage: true });

  const catalogResponses = responses.filter(({ url }) => new URL(url).pathname.endsWith('/data/catalog.json'));
  const failedHttpResponses = responses.filter(({ status }) => status >= 400);
  const result = {
    viewport: viewportName,
    url: page.url(),
    composeDocumentStatus: pageResponse?.status() ?? null,
    catalogueReadyText: catalogReady,
    catalogueResponses: catalogResponses,
    responseCount: responses.length,
    responseTypes: Object.fromEntries([...new Set(responses.map(({ resourceType }) => resourceType))].map((type) => [type, responses.filter(({ resourceType }) => resourceType === type).length])),
    responses,
    failedHttpResponses,
    failedRequests,
    consoleErrors,
    uncaughtExceptions,
  };
  runs.push(result);
  await context.close();
}

await browser.close();
await fs.mkdir(outputDir, { recursive: true });
const report = {
  site,
  version: 51,
  source: { canonical: 'e70450cba88cf09d2f68ee126e31a51474c54de2', sitesMirror: 'e19db8af22097eb6d20a9fb2555157234ea1831d' },
  workflow: 'Compose -> catalogue ready -> three directions -> Direction C -> Workbench',
  apiRequests: runs.flatMap((run) => run.responses.filter(({ resourceType }) => resourceType === 'fetch' || resourceType === 'xhr')),
  failedRequestCount: runs.reduce((sum, run) => sum + run.failedRequests.length, 0),
  badResponseCount: runs.reduce((sum, run) => sum + run.failedHttpResponses.length, 0),
  consoleErrorCount: runs.reduce((sum, run) => sum + run.consoleErrors.length + run.uncaughtExceptions.length, 0),
  runs,
};
await fs.writeFile(path.join(outputDir, 'network-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  report: path.join(outputDir, 'network-audit.json'),
  totalResponses: runs.reduce((sum, run) => sum + run.responseCount, 0),
  catalogueResponses: runs.flatMap((run) => run.catalogueResponses),
  apiRequests: report.apiRequests,
  failedRequestCount: report.failedRequestCount,
  badResponseCount: report.badResponseCount,
  consoleErrorCount: report.consoleErrorCount,
}, null, 2));
