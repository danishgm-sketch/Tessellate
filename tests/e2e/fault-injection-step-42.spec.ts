import { expect, test, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type RuntimeEvidence = {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ status: number; url: string }>;
};

function observeRuntime(page: Page): RuntimeEvidence {
  const evidence: RuntimeEvidence = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    httpErrors: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => evidence.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    evidence.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      evidence.httpErrors.push({ status: response.status(), url: response.url() });
    }
  });
  return evidence;
}

async function saveEvidence(
  page: Page,
  testInfo: TestInfo,
  id: string,
  result: RuntimeEvidence,
  checks: Record<string, unknown>,
  injectedFailures: string[] = []
) {
  const suffix = testInfo.project.name;
  const relativeScreenshot = `quality/evidence/step-42/${id}-${suffix}.png`;
  const screenshotPath = path.resolve(process.cwd(), relativeScreenshot);
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const record = {
    step: 42,
    id,
    status: 'pass',
    url: page.url(),
    viewport: page.viewportSize(),
    browser: 'Chromium',
    injectedFailures,
    checks,
    runtime: result,
    screenshot: relativeScreenshot,
  };
  const recordPath = path.resolve(process.cwd(), `quality/evidence/step-42/${id}-${suffix}.json`);
  await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  return record;
}

async function downloadManifest(page: Page, testInfo: TestInfo, filename: string) {
  await page.getByTestId('export-button').click();
  const downloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPending;
  const downloadedPath = await download.path();
  if (!downloadedPath) throw new Error('Workbench did not create the manifest download.');
  const manifest = JSON.parse(await readFile(downloadedPath, 'utf8')) as Record<string, unknown>;
  const outputPath = testInfo.outputPath(filename);
  await writeFile(outputPath, JSON.stringify(manifest, null, 2), 'utf8');
  return { manifest, outputPath };
}

function replaceFirstResourceSlug(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(replaceFirstResourceSlug);
  const record = value as Record<string, unknown>;
  if (record.resourceRef && typeof record.resourceRef === 'object') {
    const reference = record.resourceRef as Record<string, unknown>;
    reference.id = 'res_fault_injected_step_42';
    reference.slug = 'missing-resource-step-42';
    return true;
  }
  return Object.values(record).some(replaceFirstResourceSlug);
}

test('a corrupt catalogue fails closed and recovers through the visible retry control', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const runtime = observeRuntime(page);
  let catalogueRequests = 0;
  await page.route('**/data/catalog.json', async (route) => {
    catalogueRequests += 1;
    if (catalogueRequests === 1) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'cache-control': 'no-store' },
        body: JSON.stringify({ resources: [{}] }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/compose/');
  const status = page.getByTestId('catalog-status');
  await expect(status).toContainText('Catalogue unavailable');
  await expect(page.getByTestId('compose-submit-btn')).toBeDisabled();
  await page.getByLabel('Product Description & Objectives').fill(
    'An employee experience platform for a 500-person technology company.'
  );
  await page.getByRole('button', { name: 'retry', exact: true }).click();
  await expect(status).toContainText('Catalogue ready');
  expect(catalogueRequests).toBe(2);
  await expect(page.getByTestId('compose-submit-btn')).toBeEnabled();
  await page.getByTestId('compose-submit-btn').click();
  for (const direction of ['01', '02', '03']) {
    await expect(page.getByTestId(`direction-card-${direction}`)).toBeVisible({ timeout: 45_000 });
  }

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await saveEvidence(
    page,
    testInfo,
    'corrupt-catalogue-recovers',
    runtime,
    { invalid200Rejected: true, composeDisabledUntilReady: true, retryReloadedCatalogue: true, threeDirectionsRendered: true },
    ['First /data/catalog.json response returned HTTP 200 with a schema-invalid resource.']
  );
});

test('a stale Workbench project link enters read-only recovery without creating a replacement project', async ({ page }, testInfo) => {
  const runtime = observeRuntime(page);
  const staleId = `stale-step-42-${crypto.randomUUID()}`;
  await page.goto(`/workbench/?project=${encodeURIComponent(staleId)}`);
  await expect(page.getByRole('heading', { name: 'Workbench could not open' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(`${staleId} was not found in this browser`);
  await expect(page.getByRole('link', { name: 'Export the current manifest' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Open Compose' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Retry Workbench' })).toHaveAttribute('href', new RegExp(`[?&]project=${encodeURIComponent(staleId)}(?:&|$)`));
  await expect(page.getByTestId('workbench-shell')).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('tessellate_project_')))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await saveEvidence(
    page,
    testInfo,
    'stale-project-safe-recovery',
    runtime,
    { missingProjectReported: true, editingPaused: true, starterProjectNotCreated: true, retryKeepsMissingProjectIdentity: true, unrelatedManifestExportNotOffered: true, axeViolations: 0, noHorizontalOverflow: true }
  );
});

test('the visible ZIP export reports a browser download failure instead of losing it', async ({ page }, testInfo) => {
  const runtime = observeRuntime(page);
  await page.addInitScript(() => {
    const createObjectURL = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (object: Blob | MediaSource) => {
      if (object instanceof Blob && object.type === 'application/zip') {
        throw new Error('Injected ZIP download creation failure');
      }
      return createObjectURL(object);
    };
  });

  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  let dialogMessage = '';
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  expect(dialogMessage).toContain('Export failed: Injected ZIP download creation failure');
  expect(runtime.consoleErrors).toHaveLength(1);
  expect(runtime.consoleErrors[0]).toContain('Failed to generate standalone ZIP project:');
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await saveEvidence(
    page,
    testInfo,
    'zip-download-failure-visible',
    runtime,
    { browserDownloadFailureShownToUser: true, failureDetailsPreserved: true, uncaughtExceptions: 0 },
    ['URL.createObjectURL throws only for the generated application/zip Blob.'],
    runtime.consoleErrors
  );
});

test('an unresolved resource in an imported manifest blocks ZIP export with a useful error', async ({ page }, testInfo) => {
  const runtime = observeRuntime(page);
  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const { manifest, outputPath } = await downloadManifest(page, testInfo, 'source-project.tess.json');
  expect(replaceFirstResourceSlug(manifest)).toBe(true);
  manifest.id = `fault-injected-step-42-${crypto.randomUUID()}`;
  manifest.name = 'Fault-injected project';
  const malformedProjectPath = testInfo.outputPath('unresolved-resource.tess.json');
  await writeFile(malformedProjectPath, JSON.stringify(manifest, null, 2), 'utf8');
  expect(await readFile(outputPath, 'utf8')).toContain('showcase-playful-hr');

  await page.getByTestId('export-button').click();
  await page.getByTestId('manifest-import-input').setInputFiles(malformedProjectPath);
  await expect(page.getByTestId('manifest-import-status')).toContainText('Opened Fault-injected project');
  let dialogMessage = '';
  page.once('dialog', async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  expect(dialogMessage).toContain('Export failed: Unresolved resource in export: "missing-resource-step-42"');
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await saveEvidence(
    page,
    testInfo,
    'unresolved-resource-export-blocked',
    runtime,
    { importedManifestRemainedInspectable: true, unresolvedResourceRejected: true, noFallbackExported: true, uncaughtExceptions: 0 },
    ['The Workbench-imported manifest referenced an unknown resource slug.']
  );
});

test('deterministic commands remain available while the laptop Lab is offline', async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'The deterministic command bar is a desktop Workbench surface.');
  const runtime = observeRuntime(page);
  const injectedApiResponses: Array<{ pathname: string; status: number }> = [];
  // Model the Sites adapter's handled offline response. Aborting the request
  // creates a browser-console network error even though the product handles it.
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const isHealthCheck = pathname === '/api/inference/health';
    const status = isHealthCheck ? 200 : 503;
    injectedApiResponses.push({ pathname, status });
    return route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        isHealthCheck
          ? {
              apiOnline: false,
              hostOnline: false,
              activeWorkers: 0,
              pendingTasks: 0,
              engine: 'deterministic',
              reason: 'Laptop backend connection is not configured',
            }
          : {
              error: 'BackendUnavailable',
              message: 'This feature requires the laptop and Docker to be running.',
            },
      ),
    });
  });
  await page.goto('/workbench/?showcase=showcase-playful-hr');
  await expect(page.getByTestId('command-bar')).toBeVisible();
  await expect(page.getByTestId('laptop-host-status')).toContainText('Backend offline');
  await expect(page.getByRole('switch', { name: 'Laptop model Lab' })).toBeDisabled();
  const before = (await downloadManifest(page, testInfo, 'before-offline-command.tess.json')).manifest;
  const actionApiResponsesBeforeCommand = injectedApiResponses.filter(
    ({ pathname }) => pathname !== '/api/inference/health',
  );

  await page.getByLabel('Tessellate command').fill('reduce motion');
  await page.getByRole('button', { name: 'Execute command' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Lowered motion intensity' })).toBeVisible();
  const after = (await downloadManifest(page, testInfo, 'after-offline-command.tess.json')).manifest;
  const beforeDna = before.designDNA as Record<string, unknown>;
  const afterDna = after.designDNA as Record<string, unknown>;
  expect(afterDna.motion).toBeLessThan(beforeDna.motion as number);
  expect(after.id).toBe(before.id);
  expect(runtime.pageErrors).toEqual([]);
  expect(runtime.consoleErrors).toEqual([]);
  expect(injectedApiResponses.every(({ pathname, status }) => pathname === '/api/inference/health' && status === 200)).toBe(true);
  expect(
    injectedApiResponses.filter(({ pathname }) => pathname !== '/api/inference/health'),
  ).toEqual(actionApiResponsesBeforeCommand);
  expect(actionApiResponsesBeforeCommand).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  await saveEvidence(
    page,
    testInfo,
    'api-offline-deterministic-core',
    runtime,
    {
      hostLabDisabled: true,
      deterministicMutationCompleted: true,
      projectIdentityPreserved: true,
      motionReduced: true,
      offlineHealthResponsesObserved: injectedApiResponses.length,
      deterministicCommandMadeNoBackendRequest: true,
    },
    ['The laptop backend health probe returned the Sites adapter’s normal HTTP 200 offline response.'],
    runtime.consoleErrors
  );
});
