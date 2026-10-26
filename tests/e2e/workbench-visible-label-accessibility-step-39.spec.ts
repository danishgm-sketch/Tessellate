import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ProjectManifestSchema, type ProjectNode } from '../../packages/schemas/src/index.js';
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

test('Workbench visible control labels remain present in accessible names', async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name.includes('mobile');
  const runtime = { consoleErrors: [] as string[], uncaughtExceptions: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(`${request.method()} ${request.url()}`));
  page.on('response', (response) => { if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`); });
  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = 'visible-control-labels';
  manifest.name = 'Employee visible-label test';
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
  const inspector = page.getByRole('complementary', { name: 'Workbench inspector' });
  await inspector.getByRole('button', { name: 'Content', exact: true }).click();
  const contentAxe = await new AxeBuilder({ page }).withRules(['label-content-name-mismatch']).analyze();
  let commandAxe = contentAxe;
  if (isMobile) {
    await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Command' }).click();
    await expect(page.getByRole('textbox', { name: 'Tessellate command' })).toBeVisible();
    commandAxe = await new AxeBuilder({ page }).withRules(['label-content-name-mismatch']).analyze();
  }
  const visibleNames = {
    moveUp: await page.getByRole('button', { name: 'Move up', exact: true }).count(),
    moveDown: await page.getByRole('button', { name: 'Move down', exact: true }).count(),
    laptopSwitch: await page.getByRole('switch', { name: /Laptop model.*Lab.*Off/i }).count(),
  };
  const violations = [...new Set([...contentAxe.violations, ...commandAxe.violations].map((violation) => `${violation.id}:${violation.nodes.map((node) => node.target.join(' ')).join(',')}`))];
  expect({ violations, visibleNames }).toEqual({
    violations: [],
    visibleNames: { moveUp: isMobile ? 0 : 1, moveDown: isMobile ? 0 : 1, laptopSwitch: 1 },
  });
  expect(runtime).toEqual({ consoleErrors: [], uncaughtExceptions: [], failedRequests: [], httpErrors: [] });

  const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-39/workbench-visible-labels');
  await mkdir(evidenceDir, { recursive: true });
  const screenshot = path.join(evidenceDir, `${testInfo.project.name}-after.png`);
  await page.screenshot({ path: screenshot });
  await writeFile(path.join(evidenceDir, `${testInfo.project.name}-after.json`), `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    axe: { rule: 'label-content-name-mismatch', violations },
    visibleNames,
    runtime,
    screenshot,
  }, null, 2)}\n`, 'utf8');
});
