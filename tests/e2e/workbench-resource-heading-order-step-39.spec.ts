import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  ProjectManifestSchema,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function firstResourceNode(node: ProjectNode): ProjectNode | null {
  if (node.resourceRef) return node;
  for (const child of node.children) {
    const found = firstResourceNode(child);
    if (found) return found;
  }
  return null;
}

async function headingOrder(page: Page) {
  const result = await new AxeBuilder({ page }).withRules(['heading-order']).analyze();
  return result.violations.map((violation) => ({
    id: violation.id,
    targets: violation.nodes.map((node) => node.target),
  }));
}

test('Workbench resource details and replacement preserve heading hierarchy', async ({ page }, testInfo) => {
  const runtime = { consoleErrors: [] as string[], uncaughtExceptions: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => { if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`); });

  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = `resource-heading-order-${testInfo.project.name}`;
  manifest.name = 'Employee resource heading test';
  const resourceNode = firstResourceNode(manifest.screens[0]!.rootNode);
  expect(resourceNode, 'The employee showcase should contain a resource-backed node.').not.toBeNull();

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
  await expect(page.getByTestId('resource-tab').getByText(resourceNode!.resourceRef!.slug)).toBeVisible();
  const resourceDetailsViolations = await headingOrder(page);

  await page.getByTestId('resource-tab').getByTestId('open-replace-drawer-btn').click();
  const replaceDialog = page.getByRole('dialog', { name: 'Replace Resource' });
  await expect(replaceDialog).toBeVisible();
  await expect(replaceDialog.getByRole('heading').first()).toBeVisible();
  const replacementViolations = await headingOrder(page);

  expect({ resourceDetailsViolations, replacementViolations }).toEqual({
    resourceDetailsViolations: [],
    replacementViolations: [],
  });
  expect(runtime).toEqual({ consoleErrors: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] });

  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-39/workbench-heading-order');
  await mkdir(evidenceDir, { recursive: true });
  const screenshot = path.join(evidenceDir, `replace-${testInfo.project.name}-after.png`);
  await page.screenshot({ path: screenshot });
  await writeFile(path.join(evidenceDir, `replace-${testInfo.project.name}-after.json`), `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    axe: { resourceDetailsViolations, replacementViolations },
    runtime,
    screenshot,
  }, null, 2)}\n`, 'utf8');
});
