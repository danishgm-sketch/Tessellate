import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ProjectManifestSchema, type ProjectManifest } from '../../packages/schemas/src/index.js';

const EVIDENCE = path.resolve(process.cwd(), 'quality/evidence/step-21');

function captureRuntime(page: Page) {
  const runtime = {
    url: '',
    viewport: { width: 0, height: 0 },
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
    checks: {} as Record<string, unknown>,
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
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return runtime;
}

async function saveEvidence(page: Page, runtime: ReturnType<typeof captureRuntime>, phase: 'before' | 'after', name: string) {
  const directory = path.join(EVIDENCE, phase);
  await mkdir(directory, { recursive: true });
  const screenshot = path.join(directory, `${name}.png`);
  runtime.url = page.url();
  runtime.viewport = page.viewportSize() ?? { width: 0, height: 0 };
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(
    path.join(directory, `${name}.json`),
    `${JSON.stringify({ ...runtime, screenshot: path.relative(process.cwd(), screenshot) }, null, 2)}\n`,
    'utf8'
  );
}

async function saveBaselineEvidenceOnce(
  page: Page,
  runtime: ReturnType<typeof captureRuntime>,
  name: string
) {
  const evidencePath = path.join(EVIDENCE, 'before', `${name}.png`);
  try {
    await access(evidencePath);
  } catch {
    await saveEvidence(page, runtime, 'before', name);
  }
}

async function exportManifest(page: Page, filename: string, phase: 'before' | 'after'): Promise<ProjectManifest> {
  await page.getByTestId('export-button').click();
  const pending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await pending;
  const destination = path.join(EVIDENCE, phase, filename);
  await mkdir(path.dirname(destination), { recursive: true });
  await download.saveAs(destination);
  return ProjectManifestSchema.parse(JSON.parse(await readFile(destination, 'utf8')));
}

function withoutUpdatedAt(manifest: ProjectManifest) {
  const { updatedAt: _updatedAt, ...stable } = manifest;
  return stable;
}

async function selectIntentScope(page: Page) {
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  const inspector = page.getByTestId('right-inspector');
  await expect(inspector).toBeVisible();
  await inspector.getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toBeVisible();
  await expect(inspector.getByText('Project Scope')).toBeVisible();
}

async function openIntentScope(page: Page) {
  await page.goto('/showcase/showcase-playful-hr');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  await selectIntentScope(page);
}

test('undo, redo, and named checkpoints persist exact project states after reload', async ({ page }) => {
  test.setTimeout(120_000);
  const runtime = captureRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';

  await openIntentScope(page);
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  await slider.press('End');
  await slider.press('Home');
  await expect(slider).toHaveValue('0');
  await slider.press('ArrowRight');
  const retainedState = await exportManifest(page, `history-retained-${suffix}.tess.json`, 'before');
  await expect(slider).toHaveValue('1');

  for (let index = 0; index < 50; index += 1) await slider.press('ArrowRight');
  await expect(slider).toHaveValue('51');
  const finalState = await exportManifest(page, `history-final-before-reload-${suffix}.tess.json`, 'before');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
  runtime.checks = {
    generatedEdits: 51,
    retainedHistoryWindow: 50,
    retainedStateAmbition: retainedState.designDNA.visualAmbition,
    finalStateAmbition: finalState.designDNA.visualAmbition,
  };

  await page.reload();
  await selectIntentScope(page);
  await expect(slider).toHaveValue('51');
  const undo = page.getByRole('button', { name: 'Undo' });
  const undoEnabledAfterReload = await undo.isEnabled();
  runtime.checks.undoEnabledAfterReload = undoEnabledAfterReload;
  await saveBaselineEvidenceOnce(page, runtime, `undo-after-reload-${suffix}`);
  await expect(undo).toBeEnabled();

  for (let index = 0; index < 50; index += 1) {
    await undo.click();
    await expect(slider).toHaveValue(String(50 - index));
  }
  await expect(undo).toBeDisabled();
  const fullyUndone = await exportManifest(page, `history-fully-undone-${suffix}.tess.json`, 'after');
  expect(fullyUndone).toEqual(retainedState);

  const redo = page.getByRole('button', { name: 'Redo' });
  await expect(redo).toBeEnabled();
  for (let index = 0; index < 50; index += 1) {
    await redo.click();
    await expect(slider).toHaveValue(String(index + 2));
  }
  await expect(redo).toBeDisabled();
  const fullyRedone = await exportManifest(page, `history-fully-redone-${suffix}.tess.json`, 'after');
  expect(fullyRedone).toEqual(finalState);
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  const checkpointName = `History acceptance ${suffix}`;
  await page.getByRole('button', { name: /Snapshots/ }).click();
  const menu = page.getByRole('menu', { name: 'Checkpoints Menu' });
  await menu.getByRole('textbox', { name: 'Checkpoint name' }).fill(checkpointName);
  await menu.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(menu.getByText(checkpointName)).toBeVisible();
  await page.getByRole('button', { name: /Snapshots/ }).click();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('52');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  await page.reload();
  await selectIntentScope(page);
  await page.getByRole('button', { name: /Snapshots/ }).click();
  const restoredMenu = page.getByRole('menu', { name: 'Checkpoints Menu' });
  await expect(restoredMenu.getByText(checkpointName)).toBeVisible();
  await restoredMenu.getByRole('button', { name: 'Restore' }).first().click();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
  const restored = await exportManifest(page, `history-checkpoint-restored-${suffix}.tess.json`, 'after');
  expect(withoutUpdatedAt(restored)).toEqual(withoutUpdatedAt(finalState));

  runtime.checks = {
    generatedEdits: 51,
    retainedHistoryWindow: 50,
    undoEnabledAfterReload: true,
    undoRestoredExactRetainedState: true,
    redoRestoredExactFinalState: true,
    checkpointVisibleAfterReload: true,
    checkpointRestoredExactManifest: true,
  };
  await saveEvidence(page, runtime, 'after', `history-persistence-${suffix}`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
