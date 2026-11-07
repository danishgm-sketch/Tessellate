import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const siteUrl = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const outputDirectory = 'audit/evidence/catalog-search-v16';
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const uncaughtErrors = [];
const failedRequests = [];
const httpErrors = [];
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', (error) => uncaughtErrors.push(error.message));
page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });

try {
  const response = await page.goto(`${siteUrl}/explore`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Showing 50 resources', { exact: true }).waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: /^Motion/ }).click();
  await page.waitForTimeout(2500);
  const rail = page.locator('aside').filter({ hasText: 'Motion' }).first();
  const visibleMotionOptions = await rail.locator('label').allTextContents();
  const screenshot = `${outputDirectory}/empty-motion-facet-options-1440x900.png`;
  await page.screenshot({ path: screenshot });

  const catalogResponse = await globalThis.fetch(`${siteUrl}/data/catalog.json`);
  const catalog = await catalogResponse.json();
  const motionCounts = {};
  const densityCounts = {};
  const resourceTypeCounts = {};
  for (const resource of catalog.resources) {
    const score = resource.interactionDNA.motionIntensity;
    const motion = score === 0 ? 'None' : score <= 30 ? 'Light' : score <= 60 ? 'Moderate' : 'Heavy';
    motionCounts[motion] = (motionCounts[motion] ?? 0) + 1;
    const densityScore = resource.layoutDNA.density;
    const density = densityScore <= 40 ? 'Sparse' : densityScore <= 65 ? 'Balanced' : 'Dense';
    densityCounts[density] = (densityCounts[density] ?? 0) + 1;
    resourceTypeCounts[resource.resourceType] = (resourceTypeCounts[resource.resourceType] ?? 0) + 1;
  }

  const report = {
    url: page.url(),
    viewport: '1440x900',
    httpStatus: response?.status() ?? null,
    catalogueHttpStatus: catalogResponse.status,
    catalogueResourceCount: catalog.resources.length,
    visibleMotionOptions: visibleMotionOptions.map((value) => value.trim()).filter(Boolean),
    motionCounts,
    densityCounts,
    resourceTypeCounts,
    consoleErrors,
    uncaughtErrors,
    failedRequests,
    httpErrors,
    screenshot,
  };
  await writeFile(`${outputDirectory}/empty-filter-options-before.json`, `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await browser.close();
}
