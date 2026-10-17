import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { ProjectManifest } from '@tessellate/schemas';
import { createRendererParityProject } from '../../packages/testing/src/renderer-parity-fixture.js';

test('Workbench renders the shared semantic parity fixture in canvas and Preview', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  const manifest = createRendererParityProject();

  await page.addInitScript((savedManifest: ProjectManifest) => {
    const json = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, json);
    localStorage.setItem('tessellate_active_project', json);
  }, manifest);

  await page.goto(`/workbench?project=${manifest.id}`);
  const canvas = page.locator('[data-testid="workbench-canvas"]');
  await expect(canvas.locator('[data-node-id="parity-resource-prop-children"]')).toContainText('Content from resource props');
  await expect(canvas.locator('[data-node-id="parity-resource-prop-children"]')).toContainText('Content from nested manifest node');
  await expect(canvas.locator('[data-node-id="parity-resource-slot-children"]')).toContainText('Content from declared resource slot');
  await expect(canvas.locator('[data-node-id="parity-resource-slot-children"]')).toContainText('Content from nested manifest node');
  await expect(canvas.locator('[data-node-id="parity-mobile-omit"]')).toContainText('Content omitted on mobile');
  await expect(canvas).toContainText('Content from resource props');
  await expect(canvas).toContainText('Content from nested manifest node');

  const screenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/manifest-and-prop-children.png');
  mkdirSync(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });

  await page.getByRole('button', { name: 'Preview' }).first().click();
  const preview = page.getByTestId('preview-modal');
  await expect(preview).toContainText('Content from resource props');
  await expect(preview).toContainText('Content from declared resource slot');
  await expect(preview).toContainText('Content from nested manifest node');
  const previewScreenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/preview-modal-children.png');
  await page.screenshot({ path: previewScreenshot, fullPage: true });

  await page.getByRole('button', { name: 'Exit Preview' }).click();
  await page.getByTestId('canvas-toolbar').getByRole('button', { name: '390' }).click();
  await expect(canvas.locator('[data-node-id="parity-mobile-omit"]')).toHaveCount(0);
  await expect(canvas.locator('[data-node-id="parity-resource-prop-children"]')).toBeVisible();
  const mobileScreenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/workbench-responsive-390.png');
  await page.screenshot({ path: mobileScreenshot, fullPage: true });

  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});

test('Workbench preserves declared resource slot content alongside nested manifest children', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  const manifest = createRendererParityProject();

  await page.addInitScript((savedManifest: ProjectManifest) => {
    const json = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, json);
    localStorage.setItem('tessellate_active_project', json);
  }, manifest);
  await page.goto(`/workbench?project=${manifest.id}`);
  const canvas = page.locator('[data-testid="workbench-canvas"] [data-node-id="parity-resource-slot-children"]');
  await expect(canvas).toBeAttached();
  await expect(canvas).toContainText('Content from declared resource slot');
  await expect(canvas).toContainText('Content from nested manifest node');
  const after = path.resolve(process.cwd(), 'audit/evidence/step-07/after/resource-slot-and-nested-children.png');
  mkdirSync(path.dirname(after), { recursive: true });
  await page.screenshot({ path: after, fullPage: true });

  await page.getByRole('button', { name: 'Preview' }).first().click();
  const preview = page.getByTestId('preview-modal');
  await expect(preview).toContainText('Content from declared resource slot');
  await expect(preview).toContainText('Content from nested manifest node');
  const previewScreenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/preview-modal-slot-children.png');
  await page.screenshot({ path: previewScreenshot, fullPage: true });
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
