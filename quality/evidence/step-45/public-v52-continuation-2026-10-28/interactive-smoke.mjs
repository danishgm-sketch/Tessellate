/* global document, innerWidth */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const baseURL = 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const root = path.resolve('quality/evidence/step-45/public-v52-continuation-2026-10-28');
await mkdir(path.join(root, 'interactive'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const reports = [];

for (const viewport of [
  { name: 'desktop-1440x900', width: 1440, height: 900, mobile: false, touch: false },
  { name: 'mobile-390x844', width: 390, height: 844, mobile: true, touch: true },
]) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, isMobile: viewport.mobile, hasTouch: viewport.touch, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const capture = (page, route) => {
    const out = { route, viewport: viewport.name, console: [], pageErrors: [], failedRequests: [], badResponses: [] };
    page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') out.console.push({ type: msg.type(), text: msg.text().slice(0, 700) }); });
    page.on('pageerror', (error) => out.pageErrors.push(String(error)));
    page.on('requestfailed', (request) => out.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown' }));
    page.on('response', (response) => { if (response.status() >= 400) out.badResponses.push({ url: response.url(), status: response.status() }); });
    return out;
  };

  const explore = await context.newPage();
  const exploreReport = capture(explore, '/explore');
  try {
    const response = await explore.goto(baseURL + '/explore', { waitUntil: 'domcontentloaded' });
    exploreReport.httpStatus = response?.status() ?? null;
    const query = explore.getByRole('textbox', { name: 'Search catalogue' });
    await query.fill('dashboard');
    await query.press('Enter');
    await explore.getByText('Showing 25 of 25 resources').waitFor();
    exploreReport.search = { url: explore.url(), count: '25 of 25' };
    if (viewport.mobile) await explore.getByRole('button', { name: 'Filters', exact: true }).click();
    await explore.getByRole('checkbox', { name: 'Motion' }).check();
    if (viewport.mobile) await explore.getByRole('button', { name: 'Close filters' }).click();
    await explore.getByText('Showing 0 of 0 resources').waitFor();
    exploreReport.combinedFilter = { url: explore.url(), count: '0 of 0' };
    await explore.getByRole('button', { name: 'Clear search' }).click();
    await explore.getByText('Showing 24 of 24 resources').waitFor();
    exploreReport.clearSearchPreservesMotionFilter = { url: explore.url(), count: '24 of 24' };
    if (viewport.mobile) await explore.getByRole('button', { name: 'Filters', exact: true }).click();
    await explore.getByRole('checkbox', { name: 'Motion' }).uncheck();
    if (viewport.mobile) await explore.getByRole('button', { name: 'Close filters' }).click();
    await explore.getByText('Showing 50 of 324 resources').waitFor();
    exploreReport.clearFilter = { url: explore.url(), count: '50 of 324' };
    await explore.screenshot({ path: path.join(root, 'interactive', 'explore-search-' + viewport.name + '.png'), animations: 'disabled' });
  } catch (error) { exploreReport.interactionError = String(error); }
  exploreReport.expectedPreviewCancellations = exploreReport.failedRequests.filter((request) => request.error === 'net::ERR_ABORTED').length;
  reports.push(exploreReport);
  await explore.close();

  const planner = await context.newPage();
  const plannerReport = capture(planner, '/tools/section-planner/');
  try {
    const response = await planner.goto(baseURL + '/tools/section-planner/', { waitUntil: 'domcontentloaded' });
    plannerReport.httpStatus = response?.status() ?? null;
    const title = planner.getByRole('textbox', { name: 'Custom section title' });
    plannerReport.inputBefore = await title.evaluate((el) => ({ id: el.id || null, name: el.getAttribute('name'), ariaLabel: el.getAttribute('aria-label') }));
    await title.fill('Employee timeline');
    await planner.getByRole('button', { name: 'Add', exact: true }).click();
    await planner.getByRole('heading', { name: 'Page Sections (9 active)' }).waitFor();
    await planner.getByText('Employee timeline', { exact: true }).waitFor();
    plannerReport.addSection = { heading: 'Page Sections (9 active)', sectionVisible: true };
    plannerReport.horizontalOverflow = await planner.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await planner.screenshot({ path: path.join(root, 'interactive', 'section-planner-add-' + viewport.name + '.png'), animations: 'disabled', fullPage: false });
  } catch (error) { plannerReport.interactionError = String(error); }
  reports.push(plannerReport);
  await planner.close();
  await context.close();
}

await browser.close();
const output = { site: baseURL, siteVersion: 52, capturedAt: new Date().toISOString(), checks: reports };
await writeFile(path.join(root, 'interactive-smoke.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(reports.map(({ route, viewport, httpStatus, search, combinedFilter, clearSearchPreservesMotionFilter, clearFilter, expectedPreviewCancellations, inputBefore, addSection, horizontalOverflow, interactionError, console, pageErrors, failedRequests, badResponses }) => ({
  route, viewport, httpStatus, search, combinedFilter, clearSearchPreservesMotionFilter, clearFilter, expectedPreviewCancellations, inputBefore, addSection, horizontalOverflow, interactionError, console, pageErrors, failedRequests, badResponses,
})), null, 2));

