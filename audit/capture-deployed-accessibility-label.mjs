import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const outputDirectory = 'audit/evidence/catalog-search-v16';
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const uncaughtErrors = [];
const failedRequests = [];
const httpErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => uncaughtErrors.push(error.message));
page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
page.on('response', (response) => {
  if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
});

try {
  const response = await page.goto('https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/explore', { waitUntil: 'domcontentloaded' });
  await page.getByText('Showing 50 resources', { exact: true }).waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: /^Accessibility/ }).click();
  await page.getByText('Verified AA', { exact: true }).waitFor({ timeout: 5000 });
  await page.waitForTimeout(2500);
  const screenshot = `${outputDirectory}/accessibility-label-before-1440x900.png`;
  await page.screenshot({ path: screenshot });
  const catalogResponse = await globalThis.fetch('https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/data/catalog.json');
  const catalog = await catalogResponse.json();
  const accessibilityLevelTargetCounts = {};
  for (const resource of catalog.resources) {
    const target = resource.accessibility.levelTarget;
    accessibilityLevelTargetCounts[target] = (accessibilityLevelTargetCounts[target] ?? 0) + 1;
  }
  const report = {
    url: page.url(),
    viewport: '1440x900',
    httpStatus: response?.status() ?? null,
    catalogueHttpStatus: catalogResponse.status,
    catalogueResourceCount: catalog.resources.length,
    accessibilityLevelTargetCounts,
    visibleFacet: await page.getByText('Verified AA', { exact: true }).innerText(),
    declaredField: 'ResourceManifest.accessibility.levelTarget',
    consoleErrors,
    uncaughtErrors,
    failedRequests,
    httpErrors,
    screenshot,
  };
  await writeFile(`${outputDirectory}/accessibility-label-before.json`, `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await browser.close();
}
