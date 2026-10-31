/* global getComputedStyle, innerWidth, document */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium, expect } from '@playwright/test';

const baseUrl = process.env.TESSELLATE_EXPORT_PREVIEW_URL ?? 'http://127.0.0.1:4173';
const outputDir = path.resolve(process.env.TESSELLATE_AUDIT_OUTPUT_DIR ?? 'audit/evidence/deployed-v14-flagship');
const exportDir = process.env.TESSELLATE_PARITY_EXPORT_DIR;
if (!exportDir) throw new Error('TESSELLATE_PARITY_EXPORT_DIR must point to the clean extracted deployment ZIP.');

const errors = { console: [], page: [], failedRequests: [], http: [] };
const report = { previewUrl: baseUrl, cleanExportDirectory: exportDir, viewports: [], errors };
const browser = await chromium.launch({ headless: true });

function instrument(page, viewport) {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') errors.console.push({ level: message.type(), text: message.text(), viewport });
  });
  page.on('pageerror', (error) => errors.page.push({ message: error.message, viewport }));
  page.on('requestfailed', (request) => errors.failedRequests.push({ url: request.url(), error: request.failure()?.errorText, viewport }));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.http.push({ url: response.url(), status: response.status(), viewport });
  });
}

async function runViewport({ width, height, mobile }) {
  const label = `${width}x${height}`;
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  instrument(page, label);
  const response = await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const main = page.locator('main');
  await expect(main).toContainText('Content from resource props');
  await expect(main).toContainText('Content from nested manifest node');
  await expect(main).toContainText('Content from declared resource slot');
  const action = main.locator('[data-tracking-id="parity-action"]');
  await expect(action).toBeVisible();
  const dialog = page.getByRole('dialog', { name: 'Hostless dialog' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  const omit = main.locator('[data-node-id="parity-mobile-omit"]');
  const omitDisplay = await omit.evaluate((node) => getComputedStyle(node).display);
  const stackDirection = await main.locator('[data-node-id="parity-mobile-stack"]').evaluate((node) => getComputedStyle(node).flexDirection);
  const collapseMaxHeight = await main.locator('[data-node-id="parity-mobile-collapse"]').evaluate((node) => getComputedStyle(node).maxHeight);
  const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  const screenshot = `deployed-parity-export-${label}.png`;
  await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true });
  const result = {
    viewport: label,
    status: response?.status() ?? null,
    projectTitle: await page.title(),
    propAndNestedChildrenVisible: true,
    declaredSlotAndNestedChildrenVisible: true,
    dataTrackingId: await action.getAttribute('data-tracking-id'),
    ariaLabel: await action.getAttribute('aria-label'),
    dialogEscapeCloses: true,
    omitDisplay,
    stackDirection,
    collapseMaxHeight,
    dimensions,
    noHorizontalOverflow: dimensions.document <= width && dimensions.body <= width,
    noUnresolvedResources: !/(unresolved resource:|unknown resource:|missing component)/i.test(await main.innerText()),
    screenshot,
  };
  report.viewports.push(result);
  await context.close();
  return result;
}

try {
  const desktop = await runViewport({ width: 1440, height: 900, mobile: false });
  const mobile = await runViewport({ width: 390, height: 844, mobile: true });
  report.summary = {
    loadedAtDesktopAndMobile: desktop.status === 200 && mobile.status === 200,
    propAndSlotChildrenPreserved: desktop.propAndNestedChildrenVisible && mobile.declaredSlotAndNestedChildrenVisible,
    dataAndAriaAttributesPreserved: desktop.dataTrackingId === 'parity-action' && desktop.ariaLabel === 'Parity action',
    dialogClosesWithEscapeWithoutHostCallback: desktop.dialogEscapeCloses && mobile.dialogEscapeCloses,
    responsiveOmitWorksAt390: mobile.omitDisplay === 'none',
    responsiveStackWorksAt390: mobile.stackDirection === 'column',
    responsiveCollapseWorksAt390: mobile.collapseMaxHeight !== 'none',
    noUnresolvedResources: desktop.noUnresolvedResources && mobile.noUnresolvedResources,
    mobileNoOverflow: mobile.noHorizontalOverflow,
    zeroConsoleErrors: errors.console.filter((entry) => entry.level === 'error').length === 0,
    zeroUncaughtErrors: errors.page.length === 0,
    zeroFailedRequests: errors.failedRequests.length === 0,
    zeroHttpErrors: errors.http.length === 0,
  };
  report.finishedAt = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'deployed-parity-export-runtime.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ summary: report.summary, viewports: report.viewports, errors, outputDir }, null, 2)}\n`);
  if (Object.values(report.summary).some((value) => value === false)) process.exitCode = 1;
} finally {
  await browser.close();
}
