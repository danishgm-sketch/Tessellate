/* global document */

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const site = process.env.TESS_SITE_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site';
const out = path.resolve('quality/evidence/step-39/public-v75-fixes-2026-11-03');
const viewports = [
  { label: '1440x900', width: 1440, height: 900, fullPage: true },
  { label: '390x844', width: 390, height: 844, fullPage: false },
];
const scenarios = [
  { slug: 'video-hero', title: 'Video Hero live preview', action: null },
  { slug: 'empty-dashboard-state', title: 'Empty Dashboard State live preview', action: null },
  { slug: 'dashboard-skeleton', title: 'Dashboard Skeleton live preview', action: null },
  { slug: 'empty-workspace', title: 'Empty Workspace live preview', action: /create new project/i },
];

function runtimeRecorder(page) {
  const runtime = { consoleErrors: [], consoleWarnings: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [], responses: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push({
    method: request.method(),
    url: request.url(),
    error: request.failure()?.errorText ?? null,
  }));
  page.on('response', (response) => {
    const item = { status: response.status(), url: response.url(), method: response.request().method() };
    runtime.responses.push(item);
    if (response.status() >= 400) runtime.httpErrors.push(item);
  });
  return runtime;
}

await mkdir(path.join(out, 'screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const viewport of viewports) {
  for (const scenario of scenarios) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const runtime = runtimeRecorder(page);
    const route = '/r/' + scenario.slug + '/';
    const response = await page.goto(new URL(route, site).href, { waitUntil: 'networkidle', timeout: 60000 });
    const frameSelector = 'iframe[title="' + scenario.title + '"]';
    const iframe = page.locator(frameSelector);
    await iframe.waitFor({ state: 'visible', timeout: 20000 });
    const preview = page.frameLocator(frameSelector);
    const root = preview.locator('.tess-screen');
    await root.waitFor({ state: 'visible', timeout: 20000 });
    const mainText = await page.locator('main').innerText();
    const beforeText = await preview.locator('body').innerText();
    const beforeGeometry = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    const stem = scenario.slug + '-' + viewport.label;
    const beforeScreenshot = path.join(out, 'screenshots', stem + '-before.png');
    const afterScreenshot = path.join(out, 'screenshots', stem + '-after.png');
    const previewScreenshot = path.join(out, 'screenshots', stem + '-preview.png');
    await page.screenshot({ path: beforeScreenshot, fullPage: viewport.fullPage });

    const outcome = { route: route, status: response?.status() ?? null, viewport: viewport.label };
    if (scenario.slug === 'video-hero') {
      outcome.playControlCount = await preview.getByRole('button', { name: /play video showreel/i }).count();
      outcome.videoElementCount = await preview.locator('video').count();
      outcome.noMediaDisclosure = /This preview contains no video media/i.test(beforeText);
      outcome.falsePlaybackCopy = /Playing High-Fidelity|1:45|4K|production-ready React applications|zero manual wiring/i.test(beforeText);
    } else if (scenario.slug === 'empty-dashboard-state') {
      const action = preview.getByRole('button', { name: 'Connect Telemetry Source' });
      outcome.connectButtonCount = await action.count();
      outcome.connectButtonEnabled = await action.isEnabled();
      outcome.noDataSourceDisclosure = /This preview does not connect to a data source/i.test(beforeText);
      outcome.actionHelpVisible = await preview.getByText(/Connect a telemetry source in the host application to enable this action/i).isVisible();
      outcome.telemetryClaimRemoved = !/populate live metrics|component audits/i.test(beforeText);
    } else if (scenario.slug === 'dashboard-skeleton') {
      outcome.detailCopy = mainText;
      outcome.previewText = beforeText;
      outcome.hasFinanceResidue = /trading portal|order book|portfolio terminal/i.test(mainText + '\n' + beforeText);
      outcome.hasAnalyticsContext = /analytics|dashboard|activity|people|orders/i.test(mainText + '\n' + beforeText);
    } else if (scenario.slug === 'empty-workspace') {
      const action = preview.getByRole('button', { name: scenario.action });
      outcome.createButtonCount = await action.count();
      outcome.createButtonEnabled = await action.isEnabled();
      await action.click();
      await preview.getByRole('status').filter({ hasText: /Project creation previewed/i }).waitFor({ state: 'visible', timeout: 5000 });
      outcome.actionStatus = await preview.getByRole('status').innerText();
      outcome.actionCompletedInPreview = /Project creation previewed/i.test(outcome.actionStatus);
    }

    await page.screenshot({ path: afterScreenshot, fullPage: viewport.fullPage });
    await root.screenshot({ path: previewScreenshot });
    const frameGeometry = await preview.locator('body').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      horizontalOverflow: element.scrollWidth > element.clientWidth + 1,
    }));
    const essentialResponses = runtime.responses.filter((item) => new URL(item.url).pathname === '/data/catalog.json');
    results.push({
      id: scenario.slug + '-' + viewport.label,
      route,
      url: page.url(),
      viewport: viewport.label,
      httpStatus: response?.status() ?? null,
      mainText,
      beforeText,
      outcome,
      geometry: { ...beforeGeometry, preview: frameGeometry },
      runtime,
      essentialCatalogResponses: essentialResponses,
      screenshots: {
        before: path.relative(process.cwd(), beforeScreenshot).replaceAll('\\', '/'),
        after: path.relative(process.cwd(), afterScreenshot).replaceAll('\\', '/'),
        preview: path.relative(process.cwd(), previewScreenshot).replaceAll('\\', '/'),
      },
    });
    await context.close();
  }
}

await browser.close();
const report = {
  capturedAt: new Date().toISOString(),
  publicSite: site,
  publicVersion: 75,
  canonicalSourceCommit: '8e1b07a7def8e94abaaf5701f758dd4812636d12',
  siteSourceCommit: '7445659e8fa8036605c4da1b0bb2c19df4fcb440',
  resultCount: results.length,
  failures: results.flatMap((result) => {
    const failures = [];
    if (result.httpStatus !== 200) failures.push(result.id + ':HTTP ' + result.httpStatus);
    if (result.runtime.consoleErrors.length) failures.push(result.id + ':console errors');
    if (result.runtime.uncaughtExceptions.length) failures.push(result.id + ':uncaught exceptions');
    if (result.runtime.failedRequests.length) failures.push(result.id + ':failed requests');
    if (result.runtime.httpErrors.length) failures.push(result.id + ':HTTP errors');
    if (result.geometry.horizontalOverflow || result.geometry.preview.horizontalOverflow) failures.push(result.id + ':horizontal overflow');
    if (result.id.startsWith('video-hero') && (!result.outcome.noMediaDisclosure || result.outcome.videoElementCount !== 0 || result.outcome.playControlCount !== 0 || result.outcome.falsePlaybackCopy)) failures.push(result.id + ':video truthfulness');
    if (result.id.startsWith('empty-dashboard-state') && (result.outcome.connectButtonEnabled || !result.outcome.noDataSourceDisclosure || !result.outcome.actionHelpVisible || !result.outcome.telemetryClaimRemoved)) failures.push(result.id + ':empty dashboard truthfulness');
    if (result.id.startsWith('dashboard-skeleton') && (result.outcome.hasFinanceResidue || !result.outcome.hasAnalyticsContext)) failures.push(result.id + ':dashboard skeleton context');
    if (result.id.startsWith('empty-workspace') && (!result.outcome.actionCompletedInPreview || !result.outcome.createButtonEnabled)) failures.push(result.id + ':empty workspace action');
    return failures;
  }),
  results,
};
const reportPath = path.join(out, 'deployed-v75-resource-fixes.json');
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({
  report: path.relative(process.cwd(), reportPath).replaceAll('\\', '/'),
  publicVersion: report.publicVersion,
  routes: results.length,
  failures: report.failures,
  runtimeErrors: results.reduce((sum, result) => sum + result.runtime.consoleErrors.length + result.runtime.uncaughtExceptions.length, 0),
  failedRequests: results.reduce((sum, result) => sum + result.runtime.failedRequests.length, 0),
  httpErrors: results.reduce((sum, result) => sum + result.runtime.httpErrors.length, 0),
}, null, 2));
if (report.failures.length) process.exitCode = 1;
