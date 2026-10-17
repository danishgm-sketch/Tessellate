import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium } from '@playwright/test';

const baseUrl = (process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site').replace(/\/$/, '');
const outputDir = resolve(process.env.TESSELLATE_AUDIT_OUTPUT_DIR ?? 'audit/evidence/deployed');
const brief = 'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
const report = {
  target: baseUrl,
  startedAt: new Date().toISOString(),
  viewport: { width: 1440, height: 900 },
  console: [],
  pageErrors: [],
  failedRequests: [],
  httpErrors: [],
};

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: report.viewport });
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      report.console.push({ type: message.type(), text: message.text(), url: message.location().url });
    }
  });
  page.on('pageerror', (error) => report.pageErrors.push(error.message));
  page.on('requestfailed', (request) => report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on('response', (response) => {
    if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() });
  });

  const catalogue = await page.request.get(`${baseUrl}/data/catalog.json`);
  const catalogueBody = await catalogue.json();
  report.catalogue = {
    status: catalogue.status(),
    resourceCount: Array.isArray(catalogueBody) ? catalogueBody.length : (catalogueBody.resources?.length ?? null),
  };

  const favicon = await page.request.get(`${baseUrl}/favicon.svg`);
  report.faviconStatus = favicon.status();
  if (favicon.status() >= 400) report.httpErrors.push({ url: `${baseUrl}/favicon.svg`, status: favicon.status(), source: 'explicit favicon request' });

  const composeResponse = await page.goto(`${baseUrl}/compose`, { waitUntil: 'domcontentloaded' });
  report.composeStatus = composeResponse?.status() ?? null;
  await page.getByText('Catalogue ready', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByLabel('Product Description & Objectives').fill(brief);
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.getByRole('button', { name: 'Compose Interface System', exact: true }).click();
  await page.getByRole('heading', { name: 'Inferred Product Architecture', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('heading', { name: 'Three Generated Directions', exact: true }).waitFor({ state: 'visible' });
  report.architecture = await page.locator('main').innerText();
  report.directionHeadings = (await page.locator('h3').allTextContents()).filter((text) => /Calm Foundation|Expressive Horizon|Adaptive Architecture/.test(text));
  report.previewCount = await page.locator('[role="region"][aria-label^="Direction"]').count();
  report.directionPreviewLengths = await page.locator('[role="region"][aria-label^="Direction"]').evaluateAll((regions) => regions.map((region) => (region.innerText ?? '').length));
  await page.screenshot({ path: resolve(outputDir, 'compose-directions-1440.png'), fullPage: true });

  const handoffButtons = page.getByRole('button', { name: 'Open in Workbench', exact: true });
  report.handoffButtonCount = await handoffButtons.count();
  await handoffButtons.nth(2).click();
  await page.waitForURL('**/workbench?project=proj-direction-c-**', { timeout: 30000 });
  await page.getByRole('button', { name: /Adaptive Architecture/ }).waitFor({ state: 'visible', timeout: 30000 });
  report.workbenchUrl = page.url();
  report.workbenchTitle = await page.getByRole('button', { name: /Adaptive Architecture/ }).innerText();
  report.workbenchEmployeeContext = (await page.locator('body').innerText()).includes('Employee experience');
  report.backendOfflineMessageVisible = (await page.locator('body').innerText()).includes('Backend offline');
  await page.screenshot({ path: resolve(outputDir, 'workbench-direction-c-1440.png'), fullPage: true });

  const unknownPreviewResponse = await page.goto(`${baseUrl}/preview/?resource=__missing-resource-for-renderer-audit__`, { waitUntil: 'domcontentloaded' });
  const unknownPreviewMessage = page.getByText(/Preview failed: Unknown resource/, { exact: false });
  await unknownPreviewMessage.waitFor({ state: 'visible' });
  report.unknownResourcePreview = {
    status: unknownPreviewResponse?.status() ?? null,
    alertCount: await page.getByRole('alert').count(),
    buttonCount: await page.getByRole('button').count(),
    text: await unknownPreviewMessage.innerText(),
  };
  await page.screenshot({ path: resolve(outputDir, 'unknown-resource-1440.png'), fullPage: true });

  report.finishedAt = new Date().toISOString();
  report.summary = {
    catalogueReady: report.catalogue.status === 200 && report.catalogue.resourceCount === 324,
    composeLoaded: report.composeStatus === 200,
    threePreviews: report.previewCount === 3,
    directionCOpened: report.workbenchUrl.includes('project=proj-direction-c-'),
    unknownResourceAnnounced: report.unknownResourcePreview.status === 200 && report.unknownResourcePreview.alertCount === 1 && report.unknownResourcePreview.buttonCount === 0,
    consoleErrorCount: report.console.filter((entry) => entry.type === 'error').length,
    pageErrorCount: report.pageErrors.length,
    requestFailureCount: report.failedRequests.length,
    httpErrorCount: report.httpErrors.length,
  };
  await writeFile(resolve(outputDir, 'flagship-smoke.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ summary: report.summary, faviconStatus: report.faviconStatus, directionHeadings: report.directionHeadings, previewCount: report.previewCount, workbenchUrl: report.workbenchUrl, evidenceDirectory: outputDir }, null, 2)}\n`);
} finally {
  await browser.close();
}
