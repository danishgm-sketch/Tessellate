import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const outputDirectory = 'audit/evidence/catalog-search-step-08-local';
await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const observations = [];

async function captureViewport(name, viewport) {
  const page = await browser.newPage({ viewport });
  const observation = { viewport: `${viewport.width}x${viewport.height}`, consoleErrors: [], uncaughtErrors: [], failedRequests: [], httpErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') observation.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => observation.uncaughtErrors.push(error.message));
  page.on('requestfailed', (request) => observation.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => { if (response.status() >= 400) observation.httpErrors.push({ url: response.url(), status: response.status() }); });
  const response = await page.goto('http://localhost:4321/explore', { waitUntil: 'domcontentloaded' });
  await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ timeout: 30000 });
  if (viewport.width < 1024) await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('button', { name: /^Accessibility/ }).click();
  await page.getByRole('checkbox', { name: 'AA target or higher', exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('checkbox', { name: 'AAA target', exact: true }).waitFor({ state: 'visible' });
  observation.url = page.url();
  observation.httpStatus = response?.status() ?? null;
  observation.accessibilityOptions = await page.locator('label').allTextContents();
  observation.oldVerifiedAaOptionCount = await page.getByRole('checkbox', { name: 'Verified AA', exact: true }).count();
  observation.horizontalOverflow = await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth);
  observation.screenshot = `${outputDirectory}/explore-after-${name}.png`;
  await page.screenshot({ path: observation.screenshot });
  observations.push(observation);
  await page.close();
}

try {
  await captureViewport('1440x900', { width: 1440, height: 900 });
  await captureViewport('390x844', { width: 390, height: 844 });
  await writeFile(`${outputDirectory}/explore-after-browser-audit.json`, `${JSON.stringify({ localBuild: true, origin: 'http://localhost:4321', observations }, null, 2)}\n`);
} finally {
  await browser.close();
}
