/* global localStorage, getComputedStyle */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium, expect } from '@playwright/test';

const baseUrl = (process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site').replace(/\/$/, '');
const outputDir = path.resolve(process.env.TESSELLATE_AUDIT_OUTPUT_DIR ?? 'audit/evidence/deployed-v14-flagship');
const parity = JSON.parse(await fs.readFile(path.join(outputDir, 'deployed-renderer-parity-diagnostic.tess.json'), 'utf8'));
const unsupported = JSON.parse(await fs.readFile(path.join(outputDir, 'deployed-unsupported-variant-diagnostic.tess.json'), 'utf8'));
const report = {
  target: baseUrl,
  deployment: { siteVersion: 14, canonicalGitCommit: '32803eb15d72b4020fe6aec90e9b587e2f7812fb' },
  setup: 'Schema-valid diagnostic manifests were loaded through the deployed Workbench local-project persistence key. All renderer and export interactions were performed through the deployed UI.',
  findings: {},
  console: [],
  pageErrors: [],
  failedRequests: [],
  httpErrors: [],
};
const browser = await chromium.launch({ headless: true });

function instrument(page, viewport) {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') report.console.push({ level: message.type(), text: message.text(), url: message.location().url, viewport });
  });
  page.on('pageerror', (error) => report.pageErrors.push({ message: error.message, viewport }));
  page.on('requestfailed', (request) => report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText, viewport }));
  page.on('response', (response) => {
    if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status(), viewport });
  });
}

async function seedAndOpen(context, manifest) {
  const page = await context.newPage();
  await page.addInitScript(({ project }) => {
    localStorage.setItem('tessellate_active_project', JSON.stringify(project));
    localStorage.setItem(`tessellate_project_${project.id}`, JSON.stringify(project));
  }, { project: manifest });
  instrument(page, '1440x900');
  const response = await page.goto(`${baseUrl}/workbench?project=${encodeURIComponent(manifest.id)}`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('top-toolbar').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('workbench-canvas').waitFor({ state: 'visible' });
  return { page, response };
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const { page, response } = await seedAndOpen(context, parity);
  const canvas = page.getByTestId('workbench-canvas');

  await expect(canvas).toContainText('Content from resource props');
  await expect(canvas).toContainText('Content from nested manifest node');
  await expect(canvas).toContainText('Content from declared resource slot');
  const dataAttribute = canvas.locator('[data-tracking-id="parity-action"]');
  await expect(dataAttribute).toBeVisible();

  const dialog = canvas.getByRole('dialog', { name: 'Hostless dialog' });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: path.join(outputDir, 'deployed-renderer-parity-1440x900.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await page.getByTestId('canvas-toolbar').getByRole('button', { name: '390', exact: true }).click();
  const screen = page.locator('.tess-screen');
  await expect(screen).toHaveAttribute('data-viewport', 'mobile');
  await expect(canvas.locator('[data-node-id="parity-mobile-omit"]')).toHaveCount(0);
  const stack = canvas.locator('[data-node-id="parity-mobile-stack"]');
  const stackDirection = await stack.evaluate((node) => getComputedStyle(node).flexDirection);
  const collapseHeight = await canvas.locator('[data-node-id="parity-mobile-collapse"]').evaluate((node) => getComputedStyle(node).maxHeight);
  await page.screenshot({ path: path.join(outputDir, 'deployed-renderer-parity-390-preset.png'), fullPage: true });

  report.findings['AUD-072'] = { bothPropAndNestedChildrenVisible: true };
  report.findings['AUD-075'] = { bothDeclaredSlotAndNestedChildrenVisible: true };
  report.findings['AUD-077'] = { dataTrackingAttribute: await dataAttribute.getAttribute('data-tracking-id'), ariaLabel: await dataAttribute.getAttribute('aria-label') };
  report.findings['AUD-078'] = { dialogOpened: true, escapeClosedWithoutHostCallback: true };
  report.findings['AUD-076'] = {
    responsiveViewport: await screen.getAttribute('data-viewport'),
    omitNodeAbsent: (await canvas.locator('[data-node-id="parity-mobile-omit"]').count()) === 0,
    stackDirection,
    collapseMaxHeight: collapseHeight,
  };
  report.deploymentRuntime = { status: response?.status() ?? null, url: page.url(), projectId: parity.id };

  const zipDownloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  const zipDownload = await zipDownloadPromise;
  const zipPath = path.join(outputDir, 'deployed-renderer-parity-export.zip');
  await zipDownload.saveAs(zipPath);
  report.export = { filename: zipDownload.suggestedFilename(), path: path.basename(zipPath), bytes: (await fs.stat(zipPath)).size };
  await context.close();

  const invalidContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const invalid = await seedAndOpen(invalidContext, unsupported);
  const invalidCanvas = invalid.page.getByTestId('workbench-canvas');
  const variantDiagnostic = invalidCanvas.getByTestId('unsupported-resource-variant');
  await expect(variantDiagnostic).toBeVisible();
  await expect(variantDiagnostic).toContainText('deliberately-unsupported');
  await expect(invalidCanvas.locator('[data-node-id="parity-data-attribute-action"] button')).toHaveCount(0);
  await invalid.page.screenshot({ path: path.join(outputDir, 'deployed-unsupported-variant-1440x900.png'), fullPage: true });
  let exportAlertMessage = null;
  let unexpectedExportDownload = null;
  let invalidDownloadSaved;
  invalid.page.on('dialog', async (dialog) => {
    exportAlertMessage = dialog.message();
    await dialog.accept();
  });
  invalid.page.on('download', (download) => {
    unexpectedExportDownload = download.suggestedFilename();
    invalidDownloadSaved = download.saveAs(path.join(outputDir, 'deployed-invalid-variant-export.zip'));
  });
  await invalid.page.getByTestId('export-button').click();
  await invalid.page.getByTestId('export-zip-btn').click();
  await invalid.page.waitForTimeout(500);
  if (invalidDownloadSaved) await invalidDownloadSaved;
  const exportRejected = typeof exportAlertMessage === 'string' && /unsupported variant/i.test(exportAlertMessage) && /quiet, expressive, nocturne/i.test(exportAlertMessage) && unexpectedExportDownload === null;
  report.findings['AUD-074'] = {
    visibleDiagnostic: await variantDiagnostic.innerText(),
    invalidResourceNotRendered: (await invalidCanvas.locator('[data-node-id="parity-data-attribute-action"] button').count()) === 0,
    manifestValuePreservedInDiagnostic: await variantDiagnostic.getAttribute('data-resource-variant'),
    exportRejectedWithSupportedValues: exportRejected,
    exportAlertMessage,
    unexpectedExportDownload,
    invalidZipPath: unexpectedExportDownload ? 'deployed-invalid-variant-export.zip' : null,
  };
  await invalidContext.close();

  report.summary = {
    siteResponded: report.deploymentRuntime.status === 200,
    AUD072: report.findings['AUD-072'].bothPropAndNestedChildrenVisible,
    AUD073: null,
    AUD074: report.findings['AUD-074'].manifestValuePreservedInDiagnostic === 'deliberately-unsupported' && report.findings['AUD-074'].exportRejectedWithSupportedValues,
    AUD075: report.findings['AUD-075'].bothDeclaredSlotAndNestedChildrenVisible,
    AUD076: report.findings['AUD-076'].omitNodeAbsent && report.findings['AUD-076'].stackDirection === 'column' && report.findings['AUD-076'].collapseMaxHeight !== 'none',
    AUD077: report.findings['AUD-077'].dataTrackingAttribute === 'parity-action' && report.findings['AUD-077'].ariaLabel === 'Parity action',
    AUD078: report.findings['AUD-078'].escapeClosedWithoutHostCallback,
    zeroConsoleErrors: report.console.filter((entry) => entry.level === 'error').length === 0,
    zeroUncaughtErrors: report.pageErrors.length === 0,
    zeroFailedRequests: report.failedRequests.length === 0,
    zeroHttpErrors: report.httpErrors.length === 0,
  };
  report.finishedAt = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'deployed-renderer-parity-audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ summary: report.summary, findings: report.findings, errors: { console: report.console, page: report.pageErrors, failedRequests: report.failedRequests, http: report.httpErrors }, outputDir }, null, 2)}\n`);
  if (Object.values(report.summary).some((value) => value === false)) process.exitCode = 1;
} finally {
  await browser.close();
}
