import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ProjectManifestSchema, SCHEMA_VERSION, validProjectFixture, type ProjectManifest } from '../../packages/schemas/src/index.js';

function observeRuntime(page: Page) {
  const report = {
    url: '',
    viewport: { width: 0, height: 0 },
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
    if (message.type() === 'warning') report.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => report.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    report.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) report.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return report;
}

async function exportManifest(page: Page): Promise<ProjectManifest> {
  await page.getByTestId('export-button').click();
  const pending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await pending;
  return ProjectManifestSchema.parse(JSON.parse(await readFile((await download.path())!, 'utf8')));
}

async function openProjectIntent(page: Page) {
  await page.goto('/showcase/showcase-playful-hr');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  if ((page.viewportSize()?.width ?? 1440) < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toBeVisible();
}

test('saved IndexedDB projects reopen when localStorage reads are unavailable', async ({ page }) => {
  test.setTimeout(60_000);
  const runtime = observeRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';

  await openProjectIntent(page);
  const projectId = new URL(page.url()).searchParams.get('project');
  expect(projectId).toBeTruthy();
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  await slider.press('ArrowRight');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
  const expected = await exportManifest(page);
  const projectUrl = page.url();

  const projectStorageKey = `tessellate_project_${projectId}`;
  await page.addInitScript(`(() => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function(key) {
      if (key === ${JSON.stringify(projectStorageKey)} || key === 'tessellate_active_project') {
        throw new DOMException('Storage access blocked by persistence regression test', 'SecurityError');
      }
      return originalGetItem.call(this, key);
    };
  })();`);
  await page.goto(projectUrl);

  const failureHeading = page.getByRole('heading', { name: 'Local project needs attention' });
  await Promise.race([
    page.getByTestId('top-toolbar').waitFor({ state: 'visible' }),
    failureHeading.waitFor({ state: 'visible' }),
  ]);
  if (await failureHeading.isVisible()) {
    const screenshot = `quality/evidence/step-22/before/localstorage-read-blocks-indexeddb-recovery-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await page.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = page.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/before/localstorage-read-blocks-indexeddb-recovery-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'reproduced', issue: 'AUD-159', expected: 'Load the schema-valid IndexedDB project when the recovery journal is unavailable.', actual: await page.getByRole('alert').innerText(), screenshot }, null, 2)}\n`,
      'utf8'
    );
  }

  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByTestId('storage-warning')).toHaveText(
    'The browser recovery journal could not be read. The project was restored from local database storage.'
  );
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue(
    String(expected.designDNA.visualAmbition)
  );
  expect(await exportManifest(page)).toEqual(expected);
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

  const screenshot = `quality/evidence/step-22/after/localstorage-read-blocks-indexeddb-recovery-${suffix}.png`;
  const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
  await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
  await page.screenshot({ path: absoluteScreenshot, fullPage: true });
  runtime.url = page.url();
  runtime.viewport = viewport;
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-22/after/localstorage-read-blocks-indexeddb-recovery-${suffix}.json`),
    `${JSON.stringify({ ...runtime, status: 'passed', issue: 'AUD-159', checks: { idbManifestRestoredExactly: true, undoHistoryRestored: true }, screenshot }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a full browser recovery journal degrades to IndexedDB without blocking the Workbench', async ({ page }) => {
  test.setTimeout(60_000);
  const runtime = observeRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';

  await page.goto('/showcase/showcase-playful-hr');
  await page.addInitScript(`(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('tessellate_')) {
        throw new DOMException('Quota exceeded by persistence regression test', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    };
  })();`);
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();

  const failureHeading = page.getByRole('heading', { name: 'Local project needs attention' });
  await Promise.race([
    page.getByTestId('top-toolbar').waitFor({ state: 'visible' }),
    failureHeading.waitFor({ state: 'visible' }),
  ]);
  if (await failureHeading.isVisible()) {
    const screenshot = `quality/evidence/step-22/before/recovery-journal-quota-blocks-workbench-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await page.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = page.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/before/recovery-journal-quota-blocks-workbench-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'reproduced', issue: 'AUD-160', expected: 'Keep Workbench available when IndexedDB saves the project but the redundant recovery journal is full.', actual: await page.getByRole('alert').innerText(), screenshot }, null, 2)}\n`,
      'utf8'
    );
  }

  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByTestId('storage-warning')).toContainText('recovery journal storage is full');
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  const initialValue = Number(await slider.inputValue());
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(initialValue + 1));
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
  const savedManifest = await exportManifest(page);
  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByTestId('storage-warning')).toContainText('recovery journal storage is full');
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue(String(initialValue + 1));
  expect(await exportManifest(page)).toEqual(savedManifest);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

  const screenshot = `quality/evidence/step-22/after/recovery-journal-quota-indexeddb-fallback-${suffix}.png`;
  const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
  await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
  await page.screenshot({ path: absoluteScreenshot, fullPage: true });
  runtime.url = page.url();
  runtime.viewport = viewport;
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-22/after/recovery-journal-quota-indexeddb-fallback-${suffix}.json`),
    `${JSON.stringify({ ...runtime, status: 'passed', issue: 'AUD-160', checks: { workbenchStayedEditable: true, indexedDbSaveSurvivedReload: true, exactManifestRestored: true }, screenshot }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('an unavailable IndexedDB keeps the journal-backed project editable and reports session-only history', async ({ page }) => {
  test.setTimeout(60_000);
  const runtime = observeRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';

  await page.goto('/showcase/showcase-playful-hr');
  await page.addInitScript(`(() => {
    IDBFactory.prototype.open = function() {
      throw new DOMException('IndexedDB disabled by persistence regression test', 'SecurityError');
    };
  })();`);
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();

  const failureHeading = page.getByRole('heading', { name: 'Local project needs attention' });
  await Promise.race([
    page.getByTestId('top-toolbar').waitFor({ state: 'visible' }),
    failureHeading.waitFor({ state: 'visible' }),
  ]);
  if (await failureHeading.isVisible()) {
    const screenshot = `quality/evidence/step-22/before/indexeddb-unavailable-blocks-workbench-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await page.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = page.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/before/indexeddb-unavailable-blocks-workbench-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'reproduced', issue: 'AUD-161', expected: 'Keep the Workbench available from its browser recovery journal while IndexedDB is unavailable, and report that undo history is session-only.', actual: await page.getByRole('alert').innerText(), screenshot }, null, 2)}\n`,
      'utf8'
    );
  }

  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByTestId('storage-warning')).toContainText('IndexedDB is unavailable');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'unavailable');
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  const initialValue = Number(await slider.inputValue());
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(initialValue + 1));
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'unavailable');
  const expected = await exportManifest(page);
  const projectUrl = page.url();
  await page.goto(projectUrl);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByTestId('storage-warning')).toContainText('IndexedDB is unavailable');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'unavailable');
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue(String(initialValue + 1));
  expect(await exportManifest(page)).toEqual(expected);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

  const screenshot = `quality/evidence/step-22/after/indexeddb-unavailable-journal-recovery-${suffix}.png`;
  const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
  await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
  await page.screenshot({ path: absoluteScreenshot, fullPage: true });
  runtime.url = page.url();
  runtime.viewport = viewport;
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-22/after/indexeddb-unavailable-journal-recovery-${suffix}.json`),
    `${JSON.stringify({ ...runtime, status: 'passed', issue: 'AUD-161', checks: { journalManifestRestoredExactly: true, workbenchRemainedEditable: true, historyAvailabilityWasTruthful: true }, screenshot }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('legacy project data is upgraded and saved in the current schema on open', async ({ page }) => {
  test.setTimeout(60_000);
  const runtime = observeRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  const legacy = JSON.parse(JSON.stringify(validProjectFixture)) as {
    id: string;
    schemaVersion: string;
    productModel: { schemaVersion: string };
  } & Record<string, unknown>;
  legacy.schemaVersion = '0.1.0';
  legacy.productModel.schemaVersion = '0.1.0';
  const projectId = legacy.id as string;
  const projectStorageKey = `tessellate_project_${projectId}`;

  await page.addInitScript(({ record, key, id }) => {
    const raw = JSON.stringify(record);
    localStorage.setItem(key, raw);
    localStorage.setItem('tessellate_active_project', raw);
    localStorage.setItem(`tessellate_journal_version_${id}`, '1');
  }, { record: legacy, key: projectStorageKey, id: projectId });
  await page.goto(`/workbench?project=${encodeURIComponent(projectId)}`);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const exported = await exportManifest(page);
  expect(exported.schemaVersion).toBe(SCHEMA_VERSION);
  const storedVersion = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).schemaVersion : null;
  }, projectStorageKey);
  if (storedVersion !== SCHEMA_VERSION) {
    const screenshot = `quality/evidence/step-22/before/legacy-project-not-upgraded-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await page.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = page.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/before/legacy-project-not-upgraded-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'reproduced', issue: 'AUD-162', expected: `Opening legacy project data upgrades its saved record to schema ${SCHEMA_VERSION}.`, actual: `Workbench rendered schema ${exported.schemaVersion} but left browser storage at schema ${storedVersion}.`, screenshot }, null, 2)}\n`,
      'utf8'
    );
  }
  expect(storedVersion).toBe(SCHEMA_VERSION);
  await expect(page.getByTestId('storage-warning')).toContainText('Older project data was upgraded');
  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  expect(await exportManifest(page)).toEqual(exported);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

  const screenshot = `quality/evidence/step-22/after/legacy-project-upgraded-${suffix}.png`;
  const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
  await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
  await page.screenshot({ path: absoluteScreenshot, fullPage: true });
  runtime.url = page.url();
  runtime.viewport = viewport;
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-22/after/legacy-project-upgraded-${suffix}.json`),
    `${JSON.stringify({ ...runtime, status: 'passed', issue: 'AUD-162', checks: { currentSchemaExported: true, currentSchemaPersisted: true, reloadRestoredSameManifest: true }, screenshot }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a malformed saved project stays in recoverable safe mode with its raw record exportable', async ({ page }) => {
  test.setTimeout(60_000);
  const runtime = observeRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  const projectId = `corrupt-${crypto.randomUUID()}`;
  const projectStorageKey = `tessellate_project_${projectId}`;
  const rawRecord = `{"id":"${projectId}","name":"Unfinished local draft","screens":[`;

  await page.addInitScript(({ key, raw }) => {
    localStorage.setItem(key, raw);
    localStorage.setItem('tessellate_active_project', raw);
  }, { key: projectStorageKey, raw: rawRecord });
  await page.goto(`/workbench?project=${encodeURIComponent(projectId)}`);
  await expect(page.getByRole('heading', { name: 'Recover your local project' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('original data has been preserved');
  if (await page.getByRole('link', { name: 'Export raw record 2' }).count()) {
    const screenshot = `quality/evidence/step-22/before/duplicate-corrupt-recovery-records-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await page.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = page.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/before/duplicate-corrupt-recovery-records-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'reproduced', issue: 'AUD-163', expected: 'A single invalid local record is listed once even when mirrored in the active-project journal.', actual: 'The same raw project is listed twice with duplicate export links.', screenshot }, null, 2)}\n`,
      'utf8'
    );
  }
  await expect(page.getByRole('link', { name: 'Export raw record 2' })).toHaveCount(0);
  const savedRaw = await page.evaluate((key) => localStorage.getItem(key), projectStorageKey);
  expect(savedRaw).toBe(rawRecord);
  expect(await page.getByRole('link', { name: 'Create a separate project' }).getAttribute('href')).toBe('/compose');
  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export raw record 1' }).click();
  const download = await pending;
  expect(await readFile((await download.path())!, 'utf8')).toBe(rawRecord);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

  const screenshot = `quality/evidence/step-22/after/corrupted-project-safe-recovery-${suffix}.png`;
  const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
  await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
  await page.screenshot({ path: absoluteScreenshot, fullPage: true });
  runtime.url = page.url();
  runtime.viewport = viewport;
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-22/after/corrupted-project-safe-recovery-${suffix}.json`),
    `${JSON.stringify({ ...runtime, status: 'passed', checks: { originalRecordUnchanged: true, rawExportExact: true, editingPaused: true }, screenshot }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a saved project survives a full browser process restart', async ({ browser }) => {
  test.setTimeout(60_000);
  let runtime: ReturnType<typeof observeRuntime>;
  const viewport = test.info().project.use.viewport ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  const profilePath = await mkdtemp(path.join(tmpdir(), 'tessellate-persistence-'));
  let context = await browser.browserType().launchPersistentContext(profilePath, { headless: true, viewport });
  try {
    const page = context.pages()[0] ?? await context.newPage();
    runtime = observeRuntime(page);
    const baseURL = test.info().project.use.baseURL ?? 'http://localhost:4321';
    await page.goto(`${baseURL}/showcase/showcase-playful-hr`);
    await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
    await expect(page.getByTestId('top-toolbar')).toBeVisible();
    if (viewport.width < 1024) {
      await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
    }
    await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
    const slider = page.getByRole('slider', { name: 'Visual Ambition' });
    const initialValue = Number(await slider.inputValue());
    await slider.press('ArrowRight');
    await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
    const expected = await exportManifest(page);
    const projectUrl = page.url();
    await context.close();

    context = await browser.browserType().launchPersistentContext(profilePath, { headless: true, viewport });
    const restarted = context.pages()[0] ?? await context.newPage();
    runtime = observeRuntime(restarted);
    await restarted.goto(projectUrl);
    await expect(restarted.getByTestId('top-toolbar')).toBeVisible();
    if (viewport.width < 1024) {
      await restarted.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
    }
    await restarted.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
    await expect(restarted.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue(String(initialValue + 1));
    expect(await exportManifest(restarted)).toEqual(expected);
    await expect(restarted.getByRole('button', { name: 'Undo' })).toBeEnabled();
    expect(await restarted.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

    const screenshot = `quality/evidence/step-22/after/browser-restart-restores-project-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await restarted.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = restarted.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/after/browser-restart-restores-project-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'passed', checks: { manifestRestoredExactly: true, undoHistoryRestored: true, persistentBrowserProfileRestarted: true }, screenshot }, null, 2)}\n`,
      'utf8'
    );
    expect(runtime.consoleErrors).toEqual([]);
    expect(runtime.consoleWarnings).toEqual([]);
    expect(runtime.uncaughtExceptions).toEqual([]);
    expect(runtime.failedRequests).toEqual([]);
    expect(runtime.httpErrors).toEqual([]);
  } finally {
    await context.close();
    await rm(profilePath, { recursive: true, force: true });
  }
});

test('unavailable persistent stores never claim that a project was saved', async ({ page }) => {
  test.setTimeout(60_000);
  const runtime = observeRuntime(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  await page.addInitScript(`(() => {
    Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith('tessellate_')) {
        throw new DOMException('Browser persistence disabled by regression test', 'QuotaExceededError');
      }
      return originalSetItem.call(this, key, value);
    };
  })();`);
  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const warning = page.getByTestId('storage-warning');
  if ((await warning.innerText()).includes('saved in the browser recovery journal')) {
    const screenshot = `quality/evidence/step-22/before/storage-unavailable-falsely-claims-saved-${suffix}.png`;
    const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
    await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
    await page.screenshot({ path: absoluteScreenshot, fullPage: true });
    runtime.url = page.url();
    runtime.viewport = viewport;
    await writeFile(
      path.resolve(process.cwd(), `quality/evidence/step-22/before/storage-unavailable-falsely-claims-saved-${suffix}.json`),
      `${JSON.stringify({ ...runtime, status: 'reproduced', issue: 'AUD-164', expected: 'When both durable browser stores fail, warn that the current project is unsaved and can be exported.', actual: await warning.innerText(), screenshot }, null, 2)}\n`,
      'utf8'
    );
  }
  await expect(warning).toContainText('could not be saved to browser storage');
  await expect(warning).not.toContainText('saved in the browser recovery journal');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'unavailable');
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  const initialValue = Number(await slider.inputValue());
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(initialValue + 1));
  const exportedManifest = await exportManifest(page);
  expect(exportedManifest.designDNA.visualAmbition).toBe(initialValue + 1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);

  const screenshot = `quality/evidence/step-22/after/storage-unavailable-export-warning-${suffix}.png`;
  const absoluteScreenshot = path.resolve(process.cwd(), screenshot);
  await mkdir(path.dirname(absoluteScreenshot), { recursive: true });
  await page.screenshot({ path: absoluteScreenshot, fullPage: true });
  runtime.url = page.url();
  runtime.viewport = viewport;
  await writeFile(
    path.resolve(process.cwd(), `quality/evidence/step-22/after/storage-unavailable-export-warning-${suffix}.json`),
    `${JSON.stringify({ ...runtime, status: 'passed', issue: 'AUD-164', checks: { unavailableStoresReportedTruthfully: true, currentManifestRemainedExportable: true, workbenchRemainedEditable: true }, screenshot }, null, 2)}\n`,
    'utf8'
  );
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
