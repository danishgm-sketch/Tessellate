/* global URL, window, document */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { chromium, expect } from '@playwright/test';

const baseUrl = (process.env.TESSELLATE_AUDIT_URL ?? 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site').replace(/\/$/, '');
const outputDir = resolve(process.env.TESSELLATE_AUDIT_OUTPUT_DIR ?? 'audit/evidence/deployed-v14-flagship');
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  target: baseUrl,
  deployment: {
    version: Number(process.env.TESSELLATE_SITE_VERSION ?? 14),
    sourceCommit: process.env.TESSELLATE_SOURCE_COMMIT ?? '32803eb15d72b4020fe6aec90e9b587e2f7812fb',
  },
  console: [],
  pageErrors: [],
  failedRequests: [],
  httpErrors: [],
};

function instrument(page, viewport) {
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      report.console.push({ type: message.type(), text: message.text(), url: message.location().url, viewport });
    }
  });
  page.on('pageerror', (error) => report.pageErrors.push({ message: error.message, viewport }));
  page.on('requestfailed', (request) => report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText, viewport }));
  page.on('response', (response) => {
    if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status(), viewport });
  });
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  instrument(page, '1440x900');

  const composeResponse = await page.goto(`${baseUrl}/compose`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Catalogue ready', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByLabel('Product Description & Objectives').fill(
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.',
  );
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Inventive', exact: true }).click();
  await page.getByRole('button', { name: 'Compose Interface System', exact: true }).click();
  await page.getByRole('heading', { name: 'Three Generated Directions', exact: true }).waitFor({ state: 'visible' });
  const directions = await page.locator('[data-testid^="direction-card-"]').allTextContents();
  await page.getByRole('button', { name: 'Open in Workbench', exact: true }).nth(2).click();
  await page.waitForURL('**/workbench?project=proj-direction-c-**', { timeout: 30000 });
  await page.getByTestId('top-toolbar').waitFor({ state: 'visible' });
  const projectId = new URL(page.url()).searchParams.get('project');

  const manifestPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-manifest-btn').click();
  const manifestDownload = await manifestPromise;
  const manifestPath = resolve(outputDir, manifestDownload.suggestedFilename());
  await manifestDownload.saveAs(manifestPath);
  const manifestBytes = await readFile(manifestPath);
  const manifest = JSON.parse(manifestBytes.toString('utf8'));

  const zipPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  const zipDownload = await zipPromise;
  const zipPath = resolve(outputDir, zipDownload.suggestedFilename());
  await zipDownload.saveAs(zipPath);
  const zipBytes = await readFile(zipPath);

  report.publicWorkflow = {
    composeStatus: composeResponse?.status() ?? null,
    directionCount: directions.length,
    directionTitlesDiffer: new Set(directions).size === directions.length,
    projectId,
    workbenchUrl: page.url(),
    manifest: {
      file: manifestDownload.suggestedFilename(),
      bytes: manifestBytes.byteLength,
      sha256: sha256(manifestBytes),
      id: manifest.id,
      schemaVersion: manifest.schemaVersion,
      screenCount: manifest.screens?.length ?? null,
      screenNames: manifest.screens?.map((screen) => screen.name) ?? [],
      identityMatchesHandoff: manifest.id === projectId,
      screensHaveRoots: Boolean(manifest.screens?.length) && manifest.screens.every((screen) => Boolean(screen.rootNode)),
    },
    standaloneZip: {
      file: zipDownload.suggestedFilename(),
      bytes: zipBytes.byteLength,
      sha256: sha256(zipBytes),
      signature: zipBytes.subarray(0, 4).toString('hex'),
    },
    screenshots: [],
  };

  const motionMode = page.getByTestId('top-toolbar').getByRole('button', { name: 'motion', exact: true });
  await motionMode.click();
  await expect(motionMode).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: resolve(outputDir, 'workbench-exported-project-1440x900.png'), fullPage: true });
  report.publicWorkflow.screenshots.push('workbench-exported-project-1440x900.png');

  await context.close();
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
  const mobile = await mobileContext.newPage();
  instrument(mobile, '390x844');
  const mobileCompose = await mobile.goto(`${baseUrl}/compose`, { waitUntil: 'domcontentloaded' });
  await mobile.getByText('Catalogue ready', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await mobile.getByLabel('Product Description & Objectives').fill(
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.',
  );
  await mobile.getByRole('button', { name: 'Refined', exact: true }).click();
  await mobile.getByRole('button', { name: 'Inventive', exact: true }).click();
  await mobile.getByRole('button', { name: 'Compose Interface System', exact: true }).click();
  await mobile.getByRole('heading', { name: 'Three Generated Directions', exact: true }).waitFor({ state: 'visible' });
  await mobile.getByRole('button', { name: 'Open in Workbench', exact: true }).nth(2).click();
  await mobile.waitForURL('**/workbench?project=proj-direction-c-**', { timeout: 30000 });
  const mobileWorkbenchRoot = mobile.locator('[data-testid="mobile-workbench"]');
  await mobileWorkbenchRoot.waitFor({ state: 'visible', timeout: 15000 });
  const mobileWorkbench = await mobileWorkbenchRoot.count();
  const mobileDimensions = await mobile.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  await mobile.screenshot({ path: resolve(outputDir, 'workbench-exported-project-390x844.png'), fullPage: true });
  report.mobile = {
    composeStatus: mobileCompose?.status() ?? null,
    workbenchShellCount: mobileWorkbench,
    ...mobileDimensions,
    noHorizontalOverflow: mobileDimensions.document <= mobileDimensions.viewport && mobileDimensions.body <= mobileDimensions.viewport,
    screenshot: 'workbench-exported-project-390x844.png',
  };

  report.finishedAt = new Date().toISOString();
  report.summary = {
    composeLoaded: report.publicWorkflow.composeStatus === 200 && report.mobile.composeStatus === 200,
    threeDirections: report.publicWorkflow.directionCount === 3,
    manifestMatchesDirectionC: report.publicWorkflow.manifest.identityMatchesHandoff && report.publicWorkflow.manifest.screensHaveRoots,
    manifestContainsNineScreens: report.publicWorkflow.manifest.screenCount === 9,
    standaloneZipLooksValid: report.publicWorkflow.standaloneZip.signature === '504b0304',
    mobileWorkbenchLoaded: report.mobile.workbenchShellCount === 1,
    mobileHasNoOverflow: report.mobile.noHorizontalOverflow,
    zeroConsoleErrors: report.console.filter((entry) => entry.type === 'error').length === 0,
    zeroPageErrors: report.pageErrors.length === 0,
    zeroFailedRequests: report.failedRequests.length === 0,
    zeroHttpErrors: report.httpErrors.length === 0,
  };
  await writeFile(resolve(outputDir, 'visible-export-audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify({ summary: report.summary, projectId, screenNames: report.publicWorkflow.manifest.screenNames, manifest: report.publicWorkflow.manifest, standaloneZip: report.publicWorkflow.standaloneZip, mobile: report.mobile, outputDir }, null, 2)}\n`);
  if (Object.values(report.summary).some((value) => value === false)) process.exitCode = 1;
  await mobileContext.close();
} finally {
  await browser.close();
}
