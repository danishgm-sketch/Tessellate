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
  const isMobileLayout = (page.viewportSize()?.width ?? 1440) < 1024;
  const renderSurface = page.getByTestId(isMobileLayout ? 'mobile-workbench' : 'workbench-canvas');
  await expect(renderSurface).toBeVisible();
  await expect(renderSurface.locator('[data-node-id="parity-resource-prop-children"]')).toContainText('Content from resource props');
  await expect(renderSurface.locator('[data-node-id="parity-resource-prop-children"]')).toContainText('Content from nested manifest node');
  await expect(renderSurface.locator('[data-node-id="parity-resource-slot-children"]')).toContainText('Content from declared resource slot');
  await expect(renderSurface.locator('[data-node-id="parity-resource-slot-children"]')).toContainText('Content from nested manifest node');
  await expect(renderSurface.locator('[data-tracking-id="parity-action"]')).toBeVisible();
  if (isMobileLayout) {
    await expect(renderSurface.locator('[data-node-id="parity-mobile-omit"]')).toHaveCount(0);
  } else {
    await expect(renderSurface.locator('[data-node-id="parity-mobile-omit"]')).toContainText('Content omitted on mobile');
  }
  await expect(renderSurface).toContainText('Content from resource props');
  await expect(renderSurface).toContainText('Content from nested manifest node');

  const screenshot = path.resolve(process.cwd(), `audit/evidence/step-07/after/${isMobileLayout ? 'workbench-mobile-shell-390' : 'manifest-and-prop-children'}.png`);
  mkdirSync(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });

  await page.getByRole('button', { name: 'Preview' }).first().click();
  const preview = page.getByTestId('preview-modal');
  await expect(preview).toContainText('Content from resource props');
  await expect(preview).toContainText('Content from declared resource slot');
  await expect(preview).toContainText('Content from nested manifest node');
  const previewScreenshot = path.resolve(process.cwd(), `audit/evidence/step-07/after/${isMobileLayout ? 'preview-modal-children-mobile-390' : 'preview-modal-children'}.png`);
  await page.screenshot({ path: previewScreenshot, fullPage: true });

  await page.getByRole('button', { name: 'Exit Preview' }).click();
  if (!isMobileLayout) await page.getByTestId('canvas-toolbar').getByRole('button', { name: '390' }).click();
  const responsiveSurface = page.getByTestId(isMobileLayout ? 'mobile-workbench' : 'workbench-canvas');
  await expect(responsiveSurface.locator('[data-node-id="parity-mobile-omit"]')).toHaveCount(0);
  await expect(responsiveSurface.locator('[data-node-id="parity-resource-prop-children"]')).toBeVisible();
  if (isMobileLayout) {
    await expect(responsiveSurface.locator('[data-node-id="parity-mobile-stack"]')).toHaveClass(/flex-col/);
    await expect(responsiveSurface.locator('[data-node-id="parity-mobile-collapse"]')).toHaveClass(/max-h-48/);
  }
  const mobileScreenshot = path.resolve(process.cwd(), `audit/evidence/step-07/after/${isMobileLayout ? 'workbench-mobile-responsive-390' : 'workbench-responsive-390'}.png`);
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
  const isMobileLayout = (page.viewportSize()?.width ?? 1440) < 1024;
  const renderSurface = page.getByTestId(isMobileLayout ? 'mobile-workbench' : 'workbench-canvas');
  await expect(renderSurface).toBeVisible();
  const canvas = renderSurface.locator('[data-node-id="parity-resource-slot-children"]');
  await expect(canvas).toBeAttached();
  await expect(canvas).toContainText('Content from declared resource slot');
  await expect(canvas).toContainText('Content from nested manifest node');
  const after = path.resolve(process.cwd(), `audit/evidence/step-07/after/${isMobileLayout ? 'resource-slot-and-nested-children-mobile-390' : 'resource-slot-and-nested-children'}.png`);
  mkdirSync(path.dirname(after), { recursive: true });
  await page.screenshot({ path: after, fullPage: true });

  await page.getByRole('button', { name: 'Preview' }).first().click();
  const preview = page.getByTestId('preview-modal');
  await expect(preview).toContainText('Content from declared resource slot');
  await expect(preview).toContainText('Content from nested manifest node');
  const previewScreenshot = path.resolve(process.cwd(), `audit/evidence/step-07/after/${isMobileLayout ? 'preview-modal-slot-children-mobile-390' : 'preview-modal-slot-children'}.png`);
  await page.screenshot({ path: previewScreenshot, fullPage: true });
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
