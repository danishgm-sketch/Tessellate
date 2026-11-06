import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const evidenceDir = path.resolve('quality/evidence/step-45/public-v81-followup-2026-11-06/explore-settled');

test('Explore renders the fetched catalogue and search/filter controls act on real resources', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await mkdir(evidenceDir, { recursive: true });
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  const catalogueRequests: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }));
  page.on('response', (response) => {
    if (response.url().includes('/data/catalog.json')) catalogueRequests.push({ url: response.url(), status: response.status() });
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/explore');
  const resultsStatus = page.locator('#explore-catalogue-status');
  await expect(resultsStatus).toContainText(/^Showing \d+ of \d+ resources?$/, { timeout: 30_000 });
  await expect(page.getByTestId('resource-card-skeleton-grid')).toHaveCount(0);
  const beforeCards = await page.locator('a[href^="/r/"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')))]);
  const initialResults = await resultsStatus.innerText();
  expect(beforeCards.length).toBeGreaterThan(0);
  await page.screenshot({ path: path.join(evidenceDir, `explore-${testInfo.project.name}-loaded.png`), fullPage: true });

  const search = page.getByRole('textbox', { name: 'Search catalogue' });
  await search.fill('onboarding');
  await search.press('Enter');
  await expect(resultsStatus).toContainText(/^Showing \d+ of \d+ resources?$/, { timeout: 20_000 });
  const searchCards = await page.locator('a[href^="/r/"]').evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href')))]);
  expect(searchCards.length).toBeGreaterThan(0);
  const searchUrl = page.url();
  const searchReport = await resultsStatus.innerText();
  await page.screenshot({ path: path.join(evidenceDir, `explore-${testInfo.project.name}-search.png`), fullPage: true });

  if (testInfo.project.name === 'mobile-chrome') {
    const filterButton = page.getByRole('button', { name: 'Filters' });
    await filterButton.click();
    const filterDialog = page.getByRole('dialog', { name: 'Explore filters' });
    await expect(filterDialog).toBeVisible();
    await expect(filterDialog.getByRole('checkbox').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(filterDialog).toHaveCount(0);
    await expect(filterButton).toBeFocused();
  }

  const report = {
    deploymentUrl: page.url(),
    viewport: testInfo.project.name,
    checkedAt: new Date().toISOString(),
    initialResults,
    initialUniqueResourceLinks: beforeCards.length,
    search: 'onboarding',
    searchResults: searchReport,
    searchUniqueResourceLinks: searchCards.length,
    searchUrl,
    catalogueRequests,
    mobileFilterEscapeRestoredFocus: testInfo.project.name === 'mobile-chrome',
    consoleErrors,
    consoleWarnings,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
  };
  await writeFile(path.join(evidenceDir, `report-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(catalogueRequests.some((request) => request.status === 200 || request.status === 304)).toBe(true);
  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
