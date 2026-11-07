/* global fetch, document, window, URL, console */
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import process from 'node:process';

const siteUrl = process.env.TESSELLATE_SITE_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const siteVersion = Number(process.argv[2] ?? process.env.TESSELLATE_SITE_VERSION ?? 18);
const sourceCommit = process.env.TESSELLATE_SOURCE_COMMIT ?? 'unknown';
const sitesSourceCommit = process.env.TESSELLATE_SITES_SOURCE_COMMIT ?? 'unknown';
const outputDirectory = `audit/evidence/catalog-search-v${siteVersion}`;
const viewportCases = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '390x844', width: 390, height: 844 },
];
await mkdir(outputDirectory, { recursive: true });

const report = {
  siteVersion,
  sourceCommit,
  sitesSourceCommit,
  route: '/explore',
  viewports: [],
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const viewport of viewportCases) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const result = {
    viewport: viewport.name,
    url: `${siteUrl}/explore`,
    viewportSize: `${viewport.width}x${viewport.height}`,
    httpStatus: null,
    catalogueHttpStatus: null,
    catalogueResourceCount: null,
    consoleErrors: [],
    consoleWarnings: [],
    consoleEvents: [],
    uncaughtErrors: [],
    failedRequests: [],
    httpErrors: [],
    responses: [],
    checks: [],
    screenshots: {},
    axe: null,
    overflow: null,
  };
  let observeTyping = false;

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') result.consoleEvents.push({ type: message.type(), text: message.text(), location: message.location() });
    if (message.type() === 'error') result.consoleErrors.push(message.text());
    if (message.type() === 'warning') result.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => result.uncaughtErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = { url: request.url(), error: request.failure()?.errorText ?? null, resourceType: request.resourceType(), frameUrl: request.frame()?.url() ?? null };
    result.failedRequests.push(failure);
    if (observeTyping) {
      result.typingFailedRequests ??= [];
      result.typingFailedRequests.push(failure);
    }
  });
  page.on('response', (response) => {
    result.responses.push({ url: response.url(), status: response.status(), resourceType: response.request().resourceType() });
    if (response.status() >= 400) result.httpErrors.push({ url: response.url(), status: response.status() });
  });

  try {
    const response = await page.goto(`${siteUrl}/explore`, { waitUntil: 'domcontentloaded' });
    result.httpStatus = response?.status() ?? null;
    await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ timeout: 30000 });
    const catalog = await page.evaluate(async () => {
      const response = await fetch('/data/catalog.json');
      const data = await response.json();
      return { status: response.status, count: data.resources?.length ?? null };
    });
    result.catalogueHttpStatus = catalog.status;
    result.catalogueResourceCount = catalog.count;
    assert(catalog.status === 200 && catalog.count === 324, 'Catalogue request did not return all 324 records.');
    await page.waitForTimeout(500);
    result.checks.push({ name: 'catalogue-ready-and-total', status: 'PASS', actual: await page.getByText('Showing 50 of 324 resources', { exact: true }).innerText() });
    result.screenshots.initial = `${outputDirectory}/explore-initial-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.initial });
    result.overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));

    const axe = await new AxeBuilder({ page }).analyze();
    result.axe = {
      violationCount: axe.violations.length,
      seriousOrCritical: axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')).map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
      })),
      violations: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.description, nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) })),
    };

    const relevanceCases = [
      { query: 'pricing', expectedSlug: 'pricing-three-tier' },
      { query: 'sidebar', expectedSlug: 'collapsible-sidebar' },
      { query: 'dashboard', expectedSlug: 'dashboard-skeleton' },
      { query: 'command palette', expectedSlug: 'command-results' },
      { query: 'data table', expectedSlug: 'advanced-data-table' },
      { query: 'empty state', expectedSlug: 'empty-collection-state' },
      { query: 'onboarding', expectedSlug: 'onboarding-role-select' },
      { query: 'AI answer', expectedSlug: 'ai-research-answer' },
      { query: 'checkout', expectedSlug: 'funnel-chart', note: 'Adjacent checkout-conversion analytics; the catalogue has no dedicated checkout-form resource.' },
      { query: 'payment', expectedSlug: 'billing-overview', requirePresence: true },
      { query: 'settings', expectedSlug: 'profile-settings' },
      { query: 'navigation', expectedSlug: 'dual-rail-nav' },
      { query: 'hero', expectedSlug: 'editorial-hero' },
    ];
    const relevanceResults = [];
    for (const testCase of relevanceCases) {
      await page.getByLabel('Search catalogue').fill(testCase.query);
      await page.waitForTimeout(400);
      await page.waitForFunction(() => {
        const summary = document.querySelector('[aria-live="polite"]')?.textContent ?? '';
        return summary.startsWith('Showing ') || summary === 'No matching resources found';
      }, null, { timeout: 10000 });
      const resultSlugs = await page.locator('a[href^="/r/"]').evaluateAll((links) => links.map((link) => {
        const path = new URL(link.href).pathname;
        return path.match(/^\/r\/([^/.]+)/)?.[1] ?? '';
      }).filter(Boolean));
      const firstSlug = resultSlugs[0] ?? null;
      assert(
        testCase.requirePresence ? resultSlugs.includes(testCase.expectedSlug) : firstSlug === testCase.expectedSlug,
        `Search relevance failed for "${testCase.query}": expected ${testCase.requirePresence ? 'to include' : 'first result'} ${testCase.expectedSlug}, got ${resultSlugs.slice(0, 5).join(', ') || 'no results'}.`,
      );
      relevanceResults.push({ query: testCase.query, expectedSlug: testCase.expectedSlug, firstSlug, resultSlugs: resultSlugs.slice(0, 5), note: testCase.note ?? null });
    }
    result.checks.push({ name: 'common-query-relevance', status: 'PASS', results: relevanceResults });
    result.screenshots.relevance = `${outputDirectory}/common-query-relevance-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.relevance });

    const search = page.getByLabel('Search catalogue');
    await search.fill('payment');
    await page.getByRole('link', { name: 'Billing Overview', exact: true }).waitFor({ timeout: 10000 });
    result.checks.push({ name: 'payment-intent-relevance', status: 'PASS', evidence: 'Billing Overview appears for payment.' });
    result.screenshots.payment = `${outputDirectory}/payment-results-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.payment });

    await search.fill('luxury checkout');
    await page.getByText('No matching resources found', { exact: true }).waitFor({ timeout: 10000 });
    assert(await page.getByRole('link', { name: 'Conic Light Field', exact: true }).count() === 0, 'Luxury checkout returned an irrelevant background result.');
    result.checks.push({ name: 'multi-term-relevance-gate', status: 'PASS', evidence: 'No unrelated result for luxury checkout.' });
    result.screenshots.emptySearch = `${outputDirectory}/luxury-checkout-empty-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.emptySearch });

    await search.fill('');
    await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ timeout: 10000 });
    const beforeMore = await page.locator('[aria-live="polite"]').innerText();
    const showMore = page.getByRole('button', { name: /show more/i });
    await showMore.waitFor({ state: 'visible', timeout: 10000 });
    await showMore.click();
    await page.getByText('Showing 100 of 324 resources', { exact: true }).waitFor({ timeout: 10000 });
    const afterMore = await page.locator('[aria-live="polite"]').innerText();
    result.checks.push({ name: 'pagination-and-truthful-count', status: 'PASS', before: beforeMore, after: afterMore, note: 'The unfiltered catalogue is the pagination case; data table correctly has fewer than 50 relevant results.' });
    result.screenshots.pagination = `${outputDirectory}/data-table-pagination-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.pagination });

    await search.fill('dashboard');
    const summary = page.locator('[aria-live="polite"]');
    await summary.waitFor({ timeout: 10000 });
    if (viewport.width < 1024) {
      const opener = page.getByRole('button', { name: 'Filters', exact: true });
      await opener.click();
      const dialog = page.getByRole('dialog', { name: 'Explore filters' });
      assert(await dialog.isVisible(), 'Mobile filters are not exposed as an accessible dialog.');
      assert(await dialog.getAttribute('aria-modal') === 'true', 'Mobile filters are not modal to assistive technology.');
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert(await opener.evaluate((element) => document.activeElement === element), 'Focus did not return to the filter button after Escape.');
      result.checks.push({ name: 'mobile-filter-dialog-escape-and-focus-return', status: 'PASS' });
      await opener.click();
    }
    await page.getByRole('button', { name: /^Density/ }).click();
    await page.getByRole('checkbox', { name: 'Dense', exact: true }).check();
    await page.getByRole('button', { name: /^Performance/ }).click();
    await page.getByRole('checkbox', { name: 'Lightweight', exact: true }).check();
    const filteredSummary = await summary.innerText();
    assert(new URL(page.url()).searchParams.get('density') === 'Dense', 'Density facet did not serialize to the URL.');
    assert(new URL(page.url()).searchParams.get('performance') === 'Lightweight', 'Performance facet did not serialize to the URL.');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await summary.waitFor({ timeout: 10000 });
    if (viewport.width < 1024) await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await page.getByRole('button', { name: /^Density/ }).click();
    assert(await page.getByRole('checkbox', { name: 'Dense', exact: true }).isChecked(), 'Density selection was not restored after reload.');
    await page.getByRole('button', { name: /^Performance/ }).click();
    assert(await page.getByRole('checkbox', { name: 'Lightweight', exact: true }).isChecked(), 'Performance selection was not restored after reload.');
    assert((await summary.innerText()) === filteredSummary, 'Filtered result count changed after reload.');
    result.checks.push({ name: 'combined-facets-and-reload-persistence', status: 'PASS', summary: filteredSummary, url: page.url() });
    result.screenshots.facets = `${outputDirectory}/combined-facets-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.facets });

    await page.getByRole('button', { name: /^Accessibility/ }).click();
    assert(await page.getByRole('checkbox', { name: 'AA target or higher', exact: true }).count() === 1, 'AA target wording is missing.');
    assert(await page.getByRole('checkbox', { name: 'AAA target', exact: true }).count() === 1, 'AAA target wording is missing.');
    assert(await page.getByRole('checkbox', { name: 'Verified AA', exact: true }).count() === 0, 'The misleading Verified AA label remains.');
    result.checks.push({ name: 'truthful-accessibility-target-labels', status: 'PASS' });
    result.screenshots.accessibilityFacet = `${outputDirectory}/accessibility-facet-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.accessibilityFacet });

    await page.getByRole('button', { name: /^Motion/ }).click();
    assert(await page.getByRole('checkbox', { name: 'None', exact: true }).count() === 0, 'Motion None is shown although it has no catalogue values.');
    assert(await page.getByRole('checkbox', { name: 'Heavy', exact: true }).count() === 0, 'Motion Heavy is shown although it has no catalogue values.');
    await page.getByRole('button', { name: /^Density/ }).click();
    assert(await page.getByRole('checkbox', { name: 'Sparse', exact: true }).count() === 0, 'Density Sparse is shown although it has no catalogue values.');
    result.checks.push({ name: 'empty-facet-values-hidden', status: 'PASS' });

    // Reopen a clean Explore session and type at a normal human cadence while
    // recording every request failure during and just after input.
    await page.goto(`${siteUrl}/explore`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Showing 50 of 324 resources', { exact: true }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(500);
    result.typingFailedRequests = [];
    observeTyping = true;
    await page.getByLabel('Search catalogue').pressSequentially('luxury checkout', { delay: 70 });
    await page.getByText('No matching resources found', { exact: true }).waitFor({ timeout: 10000 });
    await page.waitForTimeout(1000);
    observeTyping = false;
    result.checks.push({ name: 'natural-typing-preview-request-stability', status: result.typingFailedRequests.length === 0 ? 'PASS' : 'FAIL', failures: result.typingFailedRequests });
    result.screenshots.naturalTyping = `${outputDirectory}/natural-typing-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.naturalTyping });

    // Visit a URL containing an unavailable facet; it must remain removable.
    await page.goto(`${siteUrl}/explore?motion=Heavy`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Showing 0 of 0 resources', { exact: true }).waitFor({ timeout: 10000 });
    if (viewport.width < 1024) await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await page.getByRole('button', { name: /^Motion/ }).click();
    assert(await page.getByRole('checkbox', { name: 'Heavy', exact: true }).isChecked(), 'Stale facet selection is not exposed for removal.');
    result.checks.push({ name: 'stale-url-facet-is-removable', status: 'PASS' });
    result.screenshots.staleFacet = `${outputDirectory}/stale-facet-${viewport.name}.png`;
    await page.screenshot({ path: result.screenshots.staleFacet });
  } catch (error) {
    observeTyping = false;
    result.fatal = error instanceof Error ? error.message : String(error);
    result.failureScreenshot = `${outputDirectory}/failure-${viewport.name}.png`;
    await page.screenshot({ path: result.failureScreenshot, fullPage: true }).catch(() => {});
  } finally {
    // A search or filter replacement intentionally cancels work for iframes
    // belonging to results the user left. Keep every cancellation in the raw
    // report; distinguish it from CSP and other failures that need remediation.
    result.expectedRequestCancellations = result.failedRequests.filter((failure) => failure.error === 'net::ERR_ABORTED');
    result.unresolvedNetworkFailures = result.failedRequests.filter((failure) => failure.error !== 'net::ERR_ABORTED');
    await writeFile(`${outputDirectory}/explore-${viewport.name}.json`, `${JSON.stringify(result, null, 2)}\n`);
    await browser.close();
    report.viewports.push(result);
  }
}

await writeFile(`${outputDirectory}/runtime-audit.json`, `${JSON.stringify(report, null, 2)}\n`);
const failedChecks = report.viewports.flatMap((viewport) => [
  ...(viewport.fatal ? [{ viewport: viewport.viewport, fatal: viewport.fatal }] : []),
  ...viewport.checks.filter((check) => check.status !== 'PASS').map((check) => ({ viewport: viewport.viewport, ...check })),
  ...viewport.uncaughtErrors.map((error) => ({ viewport: viewport.viewport, uncaughtError: error })),
  ...viewport.httpErrors.map((error) => ({ viewport: viewport.viewport, httpError: error })),
  ...(viewport.unresolvedNetworkFailures ?? viewport.failedRequests).map((error) => ({ viewport: viewport.viewport, failedRequest: error })),
  ...(viewport.overflow?.horizontalOverflow ? [{ viewport: viewport.viewport, overflow: viewport.overflow }] : []),
  ...(viewport.axe?.seriousOrCritical.length ? [{ viewport: viewport.viewport, axe: viewport.axe.seriousOrCritical }] : []),
]);
console.log(JSON.stringify({
  report: `${outputDirectory}/runtime-audit.json`,
  failedChecks,
  viewports: report.viewports.map((viewport) => ({
    viewport: viewport.viewport,
    httpStatus: viewport.httpStatus,
    catalogueHttpStatus: viewport.catalogueHttpStatus,
    catalogueResourceCount: viewport.catalogueResourceCount,
    consoleErrors: viewport.consoleErrors.length,
    uncaughtErrors: viewport.uncaughtErrors.length,
    failedRequests: viewport.failedRequests.length,
    expectedRequestCancellations: viewport.expectedRequestCancellations?.length ?? 0,
    unresolvedNetworkFailures: viewport.unresolvedNetworkFailures?.length ?? viewport.failedRequests.length,
    httpErrors: viewport.httpErrors.length,
    axeSeriousOrCritical: viewport.axe?.seriousOrCritical.length ?? null,
    screenshots: viewport.screenshots,
  })),
}, null, 2));
if (failedChecks.length) process.exitCode = 1;
