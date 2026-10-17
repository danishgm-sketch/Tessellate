import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { ProjectManifest } from '@tessellate/schemas';
import { validProjectFixture } from '../../packages/schemas/src/fixtures/valid-project.js';

test('Workbench preserves both resource prop children and nested manifest children', async ({ page }) => {
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

  const manifest = JSON.parse(JSON.stringify(validProjectFixture)) as ProjectManifest;
  manifest.id = 'renderer-children-parity-regression';
  manifest.name = 'Renderer children parity regression';
  manifest.locks = [];
  manifest.screens[0]!.rootNode = {
    id: 'canvas-shell-with-two-child-sources',
    nodeType: 'component',
    semanticRole: 'application-shell',
    resourceRef: { id: 'res_block_canvas_workspace_shell', slug: 'canvas-workspace-shell', version: '1.0.0' },
    props: { children: 'Content from resource props' },
    slots: {},
    children: [{
      id: 'nested-content-node',
      nodeType: 'element',
      semanticRole: 'content',
      props: { children: 'Content from nested manifest node' },
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
  const canvas = page.locator('[data-node-id="canvas-shell-with-two-child-sources"]');
  await expect(canvas).toContainText('Content from resource props');
  await expect(canvas).toContainText('Content from nested manifest node');

  const screenshot = path.resolve(process.cwd(), 'audit/evidence/step-07/after/manifest-and-prop-children.png');
  mkdirSync(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: true });
  expect(consoleErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
