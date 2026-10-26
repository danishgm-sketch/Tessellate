import { expect, test } from '@playwright/test';
import { ProjectManifestSchema, type ProjectNode } from '../../packages/schemas/src/index.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

function firstResourceNode(node: ProjectNode): ProjectNode | null {
  if (node.resourceRef) return node;
  for (const child of node.children) {
    const found = firstResourceNode(child);
    if (found) return found;
  }
  return null;
}

test('Replace Resource dialog uses a host element compatible with its dialog role', async ({ page }, testInfo) => {
  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = `dialog-role-${testInfo.project.name}`;
  manifest.name = 'Employee dialog role test';
  const resourceNode = firstResourceNode(manifest.screens[0]!.rootNode);
  expect(resourceNode).not.toBeNull();

  await page.addInitScript((savedManifest) => {
    const serialized = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, serialized);
    localStorage.setItem('tessellate_active_project', serialized);
  }, manifest);
  await page.goto(`/workbench?project=${manifest.id}`);
  await expect(page.getByRole('heading', { name: `Workbench: ${manifest.name}` })).toBeAttached();
  await page.locator(`[data-node-id="${resourceNode!.id}"]`).click();
  if (testInfo.project.name.includes('mobile')) {
    await page.getByTestId('mobile-workbench').getByRole('button', { name: 'Inspect' }).click();
  }
  const inspector = page.getByRole('complementary', { name: 'Workbench inspector' });
  await inspector.getByRole('button', { name: 'Resource', exact: true }).click();
  await expect(page.getByTestId('resource-tab').getByTestId('open-replace-drawer-btn')).toBeEnabled();
  await page.getByTestId('resource-tab').getByTestId('open-replace-drawer-btn').click();

  const dialog = page.getByRole('dialog', { name: 'Replace Resource' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('aside[role="dialog"]')).toHaveCount(0);
});
