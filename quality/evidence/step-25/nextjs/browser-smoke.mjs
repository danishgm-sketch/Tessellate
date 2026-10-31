/* global process, document, window, location, console */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const baseURL = process.env.NEXT_EXPORT_URL ?? 'http://127.0.0.1:4179/';
const browser = await chromium.launch({ headless: true });
const report = {
  url: baseURL,
  project: 'Employee experience Next.js export from Step 24 handoff manifest',
  viewports: [],
  consoleErrors: [],
  pageErrors: [],
  failedRequests: [],
  httpFailures: [],
  axe: null,
};

try {
  for (const viewport of [
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'mobile-390x844', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') report.consoleErrors.push(`${viewport.name}: ${message.text()}`);
    });
    page.on('pageerror', (error) => report.pageErrors.push(`${viewport.name}: ${error.message}`));
    page.on('requestfailed', (request) => report.failedRequests.push({
      viewport: viewport.name,
      url: request.url(),
      failure: request.failure()?.errorText ?? 'unknown',
    }));
    page.on('response', (response) => {
      if (response.status() >= 400) report.httpFailures.push({
        viewport: viewport.name,
        url: response.url(),
        status: response.status(),
      });
    });

    const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
    const heading = (await page.locator('h1').allTextContents()).join(' ').trim();
    const bodyText = await page.locator('body').innerText();
    const nav = await page.getByRole('navigation').first().innerText().catch(() => '');
    const navigationTargetHeights = await page.getByRole('navigation').first().locator('a').evaluateAll((links) =>
      links.map((link) => Math.round(link.getBoundingClientRect().height))
    ).catch(() => []);
    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      bodyWidth: document.body.scrollWidth,
    }));
    const screenshot = path.join(here, `${viewport.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    const viewportResult = {
      ...viewport,
      status: response?.status() ?? null,
      title: await page.title(),
      heading,
      hasEmployeeExperienceCopy: bodyText.includes('people') && bodyText.includes('onboarding'),
      hasExpectedProductName: bodyText.includes('People & Co'),
      navigationLabels: nav.split('\n').map((label) => label.trim()).filter(Boolean),
      navigationTargetHeights,
      minimumNavigationTargetHeight: navigationTargetHeights.length ? Math.min(...navigationTargetHeights) : null,
      navigationHasLiteralQuotes: /"(?:Marketing Home|Team Overview|People Directory|Settings & Policies)"/.test(nav),
      overflow,
      screenshot: path.basename(screenshot),
    };

    if (viewport.name === 'desktop-1440x900') {
      const settingsLink = page.getByRole('link', { name: 'Settings & Policies' }).first();
      await settingsLink.click();
      await page.waitForFunction(() => location.hash === '#screen-settings');
      viewportResult.settingsNavigationHash = await page.evaluate(() => location.hash);
      viewportResult.settingsScreenTextPresent = (await page.locator('main').innerText()).toLowerCase().includes('settings');
      const settingsScreenshot = path.join(here, 'desktop-settings-1440x900.png');
      await page.screenshot({ path: settingsScreenshot, fullPage: true });
      viewportResult.settingsScreenshot = path.basename(settingsScreenshot);
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      report.axe = await new AxeBuilder({ page }).analyze().then((result) => ({
        violations: result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          description: violation.description,
          nodes: violation.nodes.length,
        })),
        seriousOrCritical: result.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? '')).length,
      }));
    }

    report.viewports.push(viewportResult);
    await context.close();
  }
} finally {
  await browser.close();
}

fs.writeFileSync(path.join(here, 'runtime-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

const failed = report.viewports.some((viewport) =>
  viewport.status !== 200 ||
  !viewport.hasEmployeeExperienceCopy ||
  !viewport.hasExpectedProductName ||
  viewport.navigationHasLiteralQuotes ||
  viewport.overflow.documentWidth > viewport.width ||
  viewport.overflow.bodyWidth > viewport.width ||
  (viewport.minimumNavigationTargetHeight ?? 0) < 44
) || report.consoleErrors.length > 0 || report.pageErrors.length > 0 || report.failedRequests.length > 0 || report.httpFailures.length > 0;

if (failed) process.exitCode = 1;
