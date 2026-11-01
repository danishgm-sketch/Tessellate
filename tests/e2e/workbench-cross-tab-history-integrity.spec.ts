import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ProjectManifestSchema, validProjectFixture } from '../../packages/schemas/src/index.js';

const EVIDENCE = path.resolve(process.cwd(), 'quality/evidence/step-21/after');

function observe(page: Page) {
  const report = {
    url: '',
    viewport: { width: 0, height: 0 },
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push(message.text());
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

test('a tab rewrites a history snapshot pruned by another tab before its next save', async ({ page, context }) => {
  test.setTimeout(90_000);
  const report = observe(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  const projectId = `local-cross-tab-history-${suffix}`;
  const staleSnapshotKey = `${projectId}:history-before-cross-tab-prune`;
  const currentSnapshotKey = `${projectId}:history-current`;
  const project = ProjectManifestSchema.parse({
    ...structuredClone(validProjectFixture),
    id: projectId,
    name: `Cross-tab history recovery ${suffix}`,
    designDNA: { ...validProjectFixture.designDNA, visualAmbition: 40 },
    updatedAt: '2026-11-01T12:00:00.000Z',
  });
  const previousProject = ProjectManifestSchema.parse({
    ...project,
    designDNA: { ...project.designDNA, visualAmbition: 39 },
    updatedAt: '2026-11-01T11:59:00.000Z',
  });

  await page.goto('/');
  await page.evaluate(async ({ project, previousProject, currentSnapshotKey, staleSnapshotKey }) => {
    await new Promise<void>((resolve, reject) => {
      const deleting = indexedDB.deleteDatabase('tessellate-local-db');
      deleting.onsuccess = () => resolve();
      deleting.onerror = () => reject(deleting.error);
      deleting.onblocked = () => reject(new Error('Could not reset test IndexedDB.'));
    });
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tessellate-local-db', 2);
      request.onupgradeneeded = () => {
        const database = request.result;
        database.createObjectStore('projects', { keyPath: 'id' });
        const checkpoints = database.createObjectStore('checkpoints', { keyPath: 'id' });
        checkpoints.createIndex('projectId', 'projectId', { unique: false });
        const history = database.createObjectStore('history', { keyPath: 'key' });
        history.createIndex('projectId', 'projectId', { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['projects', 'history'], 'readwrite');
      tx.objectStore('projects').put(project);
      tx.objectStore('history').put({
        key: currentSnapshotKey,
        projectId: project.id,
        kind: 'snapshot',
        manifest: project,
      });
      tx.objectStore('history').put({
        key: staleSnapshotKey,
        projectId: project.id,
        kind: 'snapshot',
        manifest: previousProject,
      });
      tx.objectStore('history').put({
        key: `${project.id}:stack`,
        projectId: project.id,
        kind: 'stack',
        schemaVersion: 1,
        currentId: currentSnapshotKey,
        historyIds: [staleSnapshotKey],
        futureIds: [],
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new Error('Could not seed test history.'));
      tx.onerror = () => reject(tx.error ?? new Error('Could not seed test history.'));
    });
    db.close();
  }, { project, previousProject, currentSnapshotKey, staleSnapshotKey });

  await page.goto(`/workbench?project=${encodeURIComponent(projectId)}`);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();

  const otherTab = await context.newPage();
  await otherTab.goto(`/workbench?project=${encodeURIComponent(projectId)}`);
  await expect(otherTab.getByTestId('top-toolbar')).toBeVisible();
  await otherTab.evaluate(async ({ projectId, staleSnapshotKey }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tessellate-local-db', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.delete(staleSnapshotKey);
      store.put({
        key: `${projectId}:stack`,
        projectId,
        kind: 'stack',
        schemaVersion: 1,
        currentId: `${projectId}:history-current`,
        historyIds: [],
        futureIds: [],
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error ?? new Error('Could not simulate the other tab pruning history.'));
      tx.onerror = () => reject(tx.error ?? new Error('Could not simulate the other tab pruning history.'));
    });
    db.close();
  }, { projectId, staleSnapshotKey });

  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
  }
  const inspector = page.getByTestId('right-inspector');
  await inspector.getByRole('button', { name: 'Intent', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  await expect(slider).toHaveValue('40');
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('41');
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  if (viewport.width < 1024) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Inspect' }).click();
    await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  }
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue('41');
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('slider', { name: 'Visual Ambition' })).toHaveValue('40');

  const historySnapshotRestored = await page.evaluate(async ({ staleSnapshotKey }) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('tessellate-local-db', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const present = await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction('history', 'readonly');
      const request = tx.objectStore('history').get(staleSnapshotKey);
      request.onsuccess = () => resolve(Boolean(request.result));
      request.onerror = () => reject(request.error);
    });
    db.close();
    return present;
  }, { staleSnapshotKey });
  expect(historySnapshotRestored).toBe(true);

  await mkdir(EVIDENCE, { recursive: true });
  report.url = page.url();
  report.viewport = viewport;
  const screenshot = path.join(EVIDENCE, `cross-tab-history-snapshot-integrity-${suffix}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(path.join(EVIDENCE, `cross-tab-history-snapshot-integrity-${suffix}.json`), `${JSON.stringify({
    ...report,
    issue: 'AUD-438',
    status: 'passed',
    checks: {
      otherTabPrunedSnapshot: true,
      savedTabRewroteMissingSnapshot: historySnapshotRestored,
      undoWasRestoredAfterReload: true,
      undoRestoredExactPriorVisualAmbition: true,
    },
    screenshot: path.relative(process.cwd(), screenshot),
  }, null, 2)}\n`, 'utf8');
  expect(report.consoleErrors).toEqual([]);
  expect(report.uncaughtExceptions).toEqual([]);
  expect(report.failedRequests).toEqual([]);
  expect(report.httpErrors).toEqual([]);
  await otherTab.close();
});
