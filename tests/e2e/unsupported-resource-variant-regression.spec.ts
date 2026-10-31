import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { ProjectManifest } from '@tessellate/schemas';
import { validProjectFixture } from '../../packages/schemas/src/fixtures/valid-project.js';

test('Workbench rejects unsupported resource variants without rendering a fallback or opening a blocking dialog', async ({ page }, testInfo) => {
  const uncaught: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const dialogs: string[] = [];
  page.on('dialog', async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });
  page.on('pageerror', (error) => uncaught.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  const manifest = JSON.parse(JSON.stringify(validProjectFixture)) as ProjectManifest;
  manifest.id = 'renderer-invalid-variant-regression';
  manifest.name = 'Renderer invalid variant regression';
  manifest.locks = [];
  manifest.screens[0]!.rootNode = {
    id: 'renderer-test-root',
    nodeType: 'layout',
    semanticRole: 'container',
    props: {},
    slots: {},
    children: [{
      id: 'invalid-variant-button',
      nodeType: 'component',
      semanticRole: 'action',
      resourceRef: { id: 'res_primitive_button_01', slug: 'button', version: '1.0.0' },
      variant: 'unsupported-variant',
      props: { children: 'Unsupported variant action' },
      slots: {},
      children: [],
    }],
  };

  await page.addInitScript((savedManifest: ProjectManifest) => {
    const json = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, json);
    localStorage.setItem('tessellate_active_project', json);
  }, manifest);

  await page.goto(`/workbench?project=${manifest.id}`);
  await expect(page.locator('[data-node-id="invalid-variant-button"]')).toBeAttached();
  await expect(page.getByTestId('unsupported-resource-variant')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Unsupported variant action' })).toHaveCount(0);

  const afterPath = testInfo.outputPath('unsupported-variant-diagnostic.png');
  mkdirSync(path.dirname(afterPath), { recursive: true });
  await page.screenshot({ path: afterPath, fullPage: true });
  const exportDownloadPromise = page.waitForEvent('download', { timeout: 750 }).catch(() => null);
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  await expect(page.getByRole('alert').filter({ hasText: 'Export failed:' })).toContainText(
    'Unsupported variant "unsupported-variant"',
  );
  expect(await exportDownloadPromise).toBeNull();
  expect(dialogs).toEqual([]);
  expect(uncaught).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
