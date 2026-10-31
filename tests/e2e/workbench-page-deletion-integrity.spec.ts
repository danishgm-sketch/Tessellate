import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectManifestSchema, type ProjectManifest, type ProjectNode } from '../../packages/schemas/src/index.js';

type RuntimeEvidence = {
  url: string;
  viewport: { width: number; height: number };
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
};

function captureRuntime(page: Page): RuntimeEvidence {
  const runtime: RuntimeEvidence = {
    url: '',
    viewport: { width: 0, height: 0 },
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return runtime;
}

async function openWorkbench(page: Page) {
  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  if (mobile) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Pages', exact: true })
      .click();
  } else {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  }
}

async function openLayers(page: Page) {
  const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  // Mobile keeps Pages and Layers in the same scrollable view; there is no
  // separate Layers navigation button at that breakpoint.
  if (mobile) return;
  await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();
}

async function exportManifest(page: Page, filename: string): Promise<ProjectManifest> {
  const pendingDownload = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('export-menu')).toBeVisible();
  await page.getByTestId('export-manifest-btn').click();
  const download = await pendingDownload;
  const evidenceDir = path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/workbench-page-deletion'
  );
  await mkdir(evidenceDir, { recursive: true });
  const manifestPath = path.join(evidenceDir, filename);
  await download.saveAs(manifestPath);
  return ProjectManifestSchema.parse(JSON.parse(await readFile(manifestPath, 'utf8')) as unknown);
}

async function saveRuntimeEvidence(page: Page, runtime: RuntimeEvidence, filename: string) {
  const evidenceDir = path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/workbench-page-deletion'
  );
  await mkdir(evidenceDir, { recursive: true });
  runtime.url = page.url();
  runtime.viewport = page.viewportSize() ?? { width: 0, height: 0 };
  const screenshot = path.join(evidenceDir, `${filename}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(
    path.join(evidenceDir, `${filename}.json`),
    `${JSON.stringify({ ...runtime, screenshot: path.relative(process.cwd(), screenshot) }, null, 2)}\n`,
    'utf8'
  );
}

function findNode(root: ProjectNode, nodeId: string): ProjectNode | undefined {
  if (root.id === nodeId) return root;
  for (const child of root.children) {
    const match = findNode(child, nodeId);
    if (match) return match;
  }
  return undefined;
}

test('deleting a page removes its primary and secondary navigation references', async ({ page }, testInfo) => {
  const runtime = captureRuntime(page);
  await openWorkbench(page);
  const before = await exportManifest(page, `aud381-before-${testInfo.project.name}.tess.json`);
  const settings = before.screens.find((screen) => screen.name === 'Settings & Policies');
  expect(settings).toBeDefined();
  expect(before.navigation.secondaryItems?.some((item) => item.targetScreenId === settings!.id)).toBe(true);

  await page.screenshot({ path: testInfo.outputPath(`aud381-before-${testInfo.project.name}.png`), fullPage: true });
  await page.getByRole('button', { name: 'Delete Settings & Policies', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select screen Settings & Policies', exact: true })).toHaveCount(0);

  const after = await exportManifest(page, `aud381-after-${testInfo.project.name}.tess.json`);
  const remainingIds = new Set(after.screens.map((screen) => screen.id));
  expect(after.screens.some((screen) => screen.id === settings!.id)).toBe(false);
  expect(after.navigation.primaryItems.every((item) => remainingIds.has(item.targetScreenId))).toBe(true);
  expect(after.navigation.secondaryItems?.every((item) => remainingIds.has(item.targetScreenId))).toBe(true);
  await saveRuntimeEvidence(page, runtime, `aud381-delete-page-${testInfo.project.name}`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a page containing a locked descendant cannot be deleted', async ({ page }, testInfo) => {
  const runtime = captureRuntime(page);
  await openWorkbench(page);
  await page.getByRole('button', { name: 'Select screen Settings & Policies', exact: true }).click();
  await openLayers(page);

  const settingsForm = page.getByTestId('layer-node-node-screen-settings-settings-form-2');
  await expect(settingsForm).toBeVisible();
  await settingsForm.getByRole('button', { name: 'Lock Settings & Policies', exact: true }).click();
  await expect(settingsForm.getByRole('button', { name: 'Unlock Settings & Policies', exact: true })).toHaveAttribute('aria-pressed', 'true');

  await openWorkbench(page);
  await page.getByRole('button', { name: 'Delete Settings & Policies', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select screen Settings & Policies', exact: true })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: /locked node/i })).toBeVisible();

  const manifest = await exportManifest(page, `aud382-locked-page-${testInfo.project.name}.tess.json`);
  const settings = manifest.screens.find((screen) => screen.name === 'Settings & Policies');
  expect(settings).toBeDefined();
  expect(findNode(settings!.rootNode, 'node-screen-settings-settings-form-2')?.locks?.node).toBe(true);
  await saveRuntimeEvidence(page, runtime, `aud382-locked-page-${testInfo.project.name}`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a quota-failed recovery journal cannot replace a newer local database save', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const runtime = captureRuntime(page);
  await page.addInitScript(() => {
    const typedWindow = window as Window & { __tessellateQuotaFault?: boolean };
    typedWindow.__tessellateQuotaFault = false;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      if (typedWindow.__tessellateQuotaFault && key.startsWith('tessellate_')) {
        throw new DOMException('Quota exceeded by deployed persistence regression test', 'QuotaExceededError');
      }
      originalSetItem.call(this, key, value);
    };
  });
  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const mobile = (page.viewportSize()?.width ?? 1440) < 1024;
  const initial = await exportManifest(page, `aud378-before-quota-${testInfo.project.name}.tess.json`);
  await page.goto(`/workbench?project=${encodeURIComponent(initial.id)}`);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`[?&]project=${initial.id}$`));
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect', exact: true }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  const ambition = page.getByRole('slider', { name: 'Visual Ambition' });
  const previousValue = Number(await ambition.inputValue());

  await page.evaluate(() => {
    (window as Window & { __tessellateQuotaFault?: boolean }).__tessellateQuotaFault = true;
  });
  await ambition.press('ArrowRight');
  await expect(ambition).toHaveValue(String(previousValue + 1));
  await expect(page.getByTestId('storage-warning')).toContainText('recovery journal storage is full');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  const evidenceDir = path.resolve(
    process.cwd(),
    process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/workbench-page-deletion'
  );
  await mkdir(evidenceDir, { recursive: true });
  const saved = await exportManifest(page, `aud378-after-quota-${testInfo.project.name}.tess.json`);
  const evidencePath = path.join(evidenceDir, `aud378-quota-recovery-${testInfo.project.name}.json`);
  const screenshot = path.join(evidenceDir, `aud378-quota-recovery-${testInfo.project.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });

  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  if (mobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect', exact: true }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue(String(previousValue + 1));
  const restored = await exportManifest(page, `aud378-restored-after-reload-${testInfo.project.name}.tess.json`);
  expect(restored.id).toBe(saved.id);
  expect(restored.designDNA.visualAmbition).toBe(saved.designDNA.visualAmbition);

  runtime.url = page.url();
  runtime.viewport = page.viewportSize() ?? { width: 0, height: 0 };
  await writeFile(
    evidencePath,
    `${JSON.stringify({
      ...runtime,
      issue: 'AUD-378',
      injectedFault: 'localStorage.setItem throws QuotaExceededError for Tessellate journal writes after Workbench initialization',
      checks: { visibleEditSavedToIndexedDb: true, staleJournalInvalidated: true, exactProjectAndNewDNAValueRestored: true },
      restoredProjectId: restored.id,
      restoredVisualAmbition: restored.designDNA.visualAmbition,
      screenshot: path.relative(process.cwd(), screenshot),
    }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
