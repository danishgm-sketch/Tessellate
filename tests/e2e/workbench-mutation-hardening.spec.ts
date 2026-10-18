import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectManifestSchema, type ProjectManifest } from '../../packages/schemas/src/index.js';

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
  const directory = path.resolve(process.cwd(), `quality/evidence/step-19/${phase}`);
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

async function openPlayfulHrWorkbench(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/showcase/showcase-playful-hr');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
}

async function visibleLayerIds(page: Page) {
  return page.locator('[data-testid^="layer-node-"]').evaluateAll((items) =>
    items.map((item) => item.getAttribute('data-testid') ?? '')
  );
}

async function downloadManifestJson(page: Page, filename: string): Promise<unknown> {
  await page.getByTestId('export-button').click();
  const pending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await pending;
  const destination = path.resolve(process.cwd(), `quality/evidence/step-19/after/${filename}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await download.saveAs(destination);
  return JSON.parse(await readFile(destination, 'utf8')) as unknown;
}

async function exportManifest(page: Page, filename: string): Promise<ProjectManifest> {
  return ProjectManifestSchema.parse(await downloadManifestJson(page, filename));
}

test('duplicating the same screen twice produces distinct routes and node identities', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openPlayfulHrWorkbench(page);
  await saveEvidence(page, runtime, 'before', 'duplicate-screen-actions');

  await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  const duplicate = page.getByRole('button', { name: 'Duplicate Marketing Home', exact: true });
  await duplicate.click();
  await duplicate.click();

  const copies = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-testid="pages-tab"] div.group')].filter(
      (card) => card.querySelector('[aria-label^="Select screen Marketing Home (Copy"]')
    );
    return cards.map((card) => card.textContent ?? '');
  });
  const slugs = copies.map((card) => card.match(/\/(?:[a-z0-9-]+)/g)?.at(-1) ?? '');
  const rawExport = await downloadManifestJson(page, 'duplicate-screen-export.tess.json');
  const exportedValidation = ProjectManifestSchema.safeParse(rawExport);
  const exported = rawExport as ProjectManifest;
  const duplicateScreens = exported.screens.filter((screen) => screen.name.startsWith('Marketing Home (Copy'));
  const nodeIds = exported.screens.flatMap((screen) => {
    const nodeIds: string[] = [];
    const visit = (node: ProjectManifest['screens'][number]['rootNode']) => {
      nodeIds.push(node.id);
      for (const child of node.children) visit(child);
    };
    visit(screen.rootNode);
    return nodeIds;
  });
  const repeated = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);
  const duplicateIds = {
    screenIds: repeated(exported.screens.map((screen) => screen.id)),
    nodeIds: repeated(nodeIds),
    duplicateRoutes: repeated(exported.screens.map((screen) => screen.slug.toLowerCase())),
  };
  runtime.checks = { duplicateScreenCards: copies, duplicateSlugs: slugs, duplicateIds, exportedSchemaValid: exportedValidation.success };
  const capturePhase = process.env.STEP19_CAPTURE_BASELINE === '1' ? 'before' : 'after';
  await saveEvidence(page, runtime, capturePhase, 'duplicate-screen-collision');
  expect(exportedValidation.success).toBe(true);
  expect(copies).toHaveLength(2);
  expect(new Set(slugs).size).toBe(2);
  expect(duplicateScreens).toHaveLength(2);
  expect(duplicateIds.screenIds).toEqual([]);
  expect(duplicateIds.nodeIds).toEqual([]);
  expect(duplicateIds.duplicateRoutes).toEqual([]);
  runtime.checks = { duplicateScreenCards: copies, duplicateSlugs: slugs, duplicateIds, exportedSchemaValid: exportedValidation.success };
  await saveEvidence(page, runtime, 'after', 'duplicate-screen-collision');
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('adding a screen rejects a route already used by another screen', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openPlayfulHrWorkbench(page);
  await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  const screenButtons = page.locator('[data-testid="pages-tab"] button[aria-label^="Select screen "]');
  const initialCount = await screenButtons.count();

  await page.getByRole('button', { name: 'Add Page', exact: true }).click();
  await page.getByRole('textbox', { name: 'Page title' }).fill('Route collision check');
  await page.getByRole('textbox', { name: 'Route slug' }).fill('/people');
  await page.getByRole('button', { name: 'Add Screen', exact: true }).click();
  const capturePhase = process.env.STEP19_CAPTURE_BASELINE === '1' ? 'before' : 'after';
  runtime.checks = { routeSubmitted: '/people', screenCountBefore: initialCount, screenCountAfterSubmit: await screenButtons.count() };
  await saveEvidence(page, runtime, capturePhase, 'add-screen-route-collision');
  await expect(page.getByRole('alert')).toContainText('already used by another screen');
  expect(await screenButtons.count()).toBe(initialCount);
  runtime.checks = { routeCollisionRejected: '/people', screenCountBefore: initialCount, screenCountAfterRejectedAdd: await screenButtons.count() };
  await page.getByRole('textbox', { name: 'Route slug' }).fill('/people-route-check');
  await page.getByRole('button', { name: 'Add Screen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select screen Route collision check', exact: true })).toBeVisible();
  await expect(page.getByText('/people-route-check', { exact: true })).toBeVisible();
  expect(await screenButtons.count()).toBe(initialCount + 1);

  runtime.checks = { ...runtime.checks, validRouteAdded: '/people-route-check', screenCountAfterValidAdd: await screenButtons.count() };
  await saveEvidence(page, runtime, 'after', 'add-screen-valid-route');
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('layer duplicate, move, delete and history operate on the visible semantic tree', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openPlayfulHrWorkbench(page);
  await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();

  const treeItems = page.locator('[data-testid^="layer-node-"]');
  const originalIds = await visibleLayerIds(page);
  expect(originalIds.length).toBeGreaterThan(2);

  await treeItems.first().click();
  const capturePhase = process.env.STEP19_CAPTURE_BASELINE === '1' ? 'before' : 'after';
  runtime.checks = { originalLayerCount: originalIds.length, selectedLayerId: originalIds[0], selectedScope: 'screen root' };
  await saveEvidence(page, runtime, capturePhase, 'layer-actions-root');
  await expect(page.getByRole('button', { name: 'Duplicate', exact: true })).toBeDisabled();
  await expect(page.getByRole('status').filter({ hasText: 'Duplicate the screen from Pages' })).toBeVisible();

  const selectedTreeItem = treeItems.nth(1);
  const selectedTestId = await selectedTreeItem.getAttribute('data-testid');
  expect(selectedTestId).toBeTruthy();
  const nodeId = selectedTestId!.replace('layer-node-', '');
  await selectedTreeItem.focus();
  await page.keyboard.press('Enter');
  await expect(selectedTreeItem).toHaveAttribute('aria-selected', 'true');
  await selectedTreeItem.getByRole('button', { name: 'Lock navigation' }).click();
  await expect(page.getByRole('button', { name: 'Duplicate', exact: true })).toBeDisabled();
  await expect(page.getByRole('status').filter({ hasText: 'locked against structural changes' })).toBeVisible();
  await selectedTreeItem.getByRole('button', { name: 'Unlock navigation' }).click();
  await expect(page.getByRole('button', { name: 'Duplicate', exact: true })).toBeEnabled();
  const actionAxe = await new AxeBuilder({ page })
    .include('[aria-label="Selected layer actions"]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(actionAxe.violations).toEqual([]);
  const selectedLabel = await page.getByRole('region', { name: 'Selected layer actions' }).innerText();
  runtime.checks = { originalLayerCount: originalIds.length, selectedLayerId: nodeId, selectedLayerActions: selectedLabel, keyboardSelected: true, lockAndUnlockPassed: true, axeViolations: actionAxe.violations };
  await saveEvidence(page, runtime, 'after', 'layer-actions-enabled');

  await page.getByRole('button', { name: 'Duplicate', exact: true }).click();
  const duplicatedIds = await visibleLayerIds(page);
  expect(duplicatedIds.length).toBeGreaterThan(originalIds.length);
  expect(new Set(duplicatedIds).size).toBe(duplicatedIds.length);
  await expect(page.getByRole('button', { name: 'Undo' })).toBeEnabled();
  const duplicateRootId = duplicatedIds.find((id) => !originalIds.includes(id));
  expect(duplicateRootId).toBeTruthy();
  const duplicatedManifest = await exportManifest(page, 'duplicated-layer.tess.json');
  const activeRootId = originalIds[0]!.replace('layer-node-', '');
  const duplicatedScreen = duplicatedManifest.screens.find((screen) => screen.rootNode.id === activeRootId);
  expect(duplicatedScreen).toBeDefined();
  const findExportedNode = (node: ProjectManifest['screens'][number]['rootNode'], id: string): boolean =>
    node.id === id || node.children.some((child) => findExportedNode(child, id));
  expect(duplicatedManifest.screens.some((screen) => findExportedNode(screen.rootNode, duplicateRootId!.replace('layer-node-', '')))).toBe(true);
  await page.getByRole('button', { name: 'Undo' }).click();
  expect(await visibleLayerIds(page)).toEqual(originalIds);
  await page.getByRole('button', { name: 'Redo' }).click();
  expect(await visibleLayerIds(page)).toEqual(duplicatedIds);
  await page.getByTestId(duplicateRootId!).click();

  const beforeMove = await visibleLayerIds(page);
  await page.getByRole('button', { name: 'Move selected layer down' }).click();
  const afterMove = await visibleLayerIds(page);
  expect(afterMove).not.toEqual(beforeMove);
  await page.getByRole('button', { name: 'Undo' }).click();
  expect(await visibleLayerIds(page)).toEqual(beforeMove);
  await page.getByRole('button', { name: 'Redo' }).click();
  expect(await visibleLayerIds(page)).toEqual(afterMove);

  await page.getByTestId('delete-layer').click();
  await expect(page.getByRole('group', { name: /Confirm deleting/ })).toBeVisible();
  await page.getByTestId('confirm-delete-layer').click();
  const afterDelete = await visibleLayerIds(page);
  expect(afterDelete.length).toBeLessThan(afterMove.length);
  await page.getByRole('button', { name: 'Undo' }).click();
  expect(await visibleLayerIds(page)).toEqual(afterMove);
  await page.getByRole('button', { name: 'Redo' }).click();
  expect(await visibleLayerIds(page)).toEqual(afterDelete);

  const exported = await exportManifest(page, 'layer-mutations.tess.json');
  const rootId = afterDelete[0]?.replace('layer-node-', '');
  const exportedScreen = exported.screens.find((screen) => screen.rootNode.id === rootId);
  expect(exportedScreen).toBeDefined();
  const exportedLayerIds: string[] = [];
  const visit = (node: ProjectManifest['screens'][number]['rootNode']) => {
    exportedLayerIds.push(`layer-node-${node.id}`);
    for (const child of node.children) visit(child);
  };
  visit(exportedScreen!.rootNode);
  expect(exportedLayerIds).toEqual(afterDelete);

  runtime.checks = {
    ...runtime.checks,
    originalLayerCount: originalIds.length,
    afterDuplicateCount: duplicatedIds.length,
    afterMoveIds: afterMove,
    afterDeleteCount: afterDelete.length,
  };
  await saveEvidence(page, runtime, 'after', 'layer-mutations');
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('mobile layer actions remain reachable and fit the viewport', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openPlayfulHrWorkbench(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: 'Pages', exact: true }).click();

  const items = page.locator('[data-testid^="layer-node-"]');
  const before = await visibleLayerIds(page);
  await items.nth(1).click();
  const actions = page.getByRole('region', { name: 'Selected layer actions' });
  await expect(actions).toBeVisible();
  await actions.scrollIntoViewIfNeeded();
  const bounds = await actions.boundingBox();
  const navBounds = await page.getByRole('navigation', { name: 'Mobile Workbench' }).boundingBox();
  expect(bounds).not.toBeNull();
  expect(navBounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(navBounds!.y);

  await page.getByRole('button', { name: 'Duplicate', exact: true }).click();
  expect((await visibleLayerIds(page)).length).toBeGreaterThan(before.length);
  await actions.scrollIntoViewIfNeeded();
  const resultBounds = await actions.boundingBox();
  const resultNavBounds = await page.getByRole('navigation', { name: 'Mobile Workbench' }).boundingBox();
  expect(resultBounds).not.toBeNull();
  expect(resultNavBounds).not.toBeNull();
  expect(resultBounds!.y + resultBounds!.height).toBeLessThanOrEqual(resultNavBounds!.y);
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(horizontalOverflow).toBe(false);
  runtime.checks = { viewport: '390x844', beforeLayerCount: before.length, afterDuplicateCount: (await visibleLayerIds(page)).length, actionsBounds: resultBounds, horizontalOverflow };
  await saveEvidence(page, runtime, 'after', 'mobile-layer-mutations-390x844');
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('Gold resource replacement applies through the UI and undo/redo restores its exact resource', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openPlayfulHrWorkbench(page);
  await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();

  const layerItems = page.locator('[data-testid^="layer-node-"]');
  let selectedItem = '';
  for (let index = 1; index < await layerItems.count(); index += 1) {
    const item = layerItems.nth(index);
    const testId = await item.getAttribute('data-testid');
    await item.click();
    await page.getByTestId('right-inspector').getByRole('button', { name: 'Resource', exact: true }).click();
    const replaceButton = page.getByTestId('open-replace-drawer-btn');
    if (await replaceButton.isVisible() && await replaceButton.isEnabled()) {
      selectedItem = testId ?? '';
      break;
    }
  }
  expect(selectedItem).not.toBe('');

  const resourceTab = page.getByTestId('resource-tab');
  const originalResource = await resourceTab.innerText();
  const originalResourceMetadata = await resourceTab.locator('p.font-mono').innerText();
  await page.getByTestId('open-replace-drawer-btn').click();
  const drawer = page.getByRole('dialog', { name: 'Replace Resource' });
  await expect(drawer).toBeVisible();
  const candidateButton = drawer.getByTestId('apply-replacement-btn').first();
  const candidateSlug = await candidateButton.getAttribute('data-resource-slug');
  const candidateCard = await candidateButton.locator('xpath=..').innerText();
  expect(candidateSlug).toBeTruthy();
  expect(candidateCard).toContain('Gold');
  runtime.checks = { selectedItem, originalResource, candidateSlug, candidateCard };
  await saveEvidence(page, runtime, 'before', 'replace-gold-resource');

  await candidateButton.click();
  const replacedResource = await resourceTab.innerText();
  const replacedResourceMetadata = await resourceTab.locator('p.font-mono').innerText();
  expect(replacedResource).toContain(candidateSlug!);
  expect(replacedResource).not.toEqual(originalResource);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(resourceTab.locator('p.font-mono')).toHaveText(originalResourceMetadata);
  await page.getByRole('button', { name: 'Redo' }).click();
  await expect(resourceTab.locator('p.font-mono')).toHaveText(replacedResourceMetadata);
  const exported = await exportManifest(page, 'replaced-resource.tess.json');
  const selectedNodeId = selectedItem.replace('layer-node-', '');
  const exportedNode = exported.screens.flatMap((screen) => {
    const nodes: ProjectManifest['screens'][number]['rootNode'][] = [];
    const visit = (node: ProjectManifest['screens'][number]['rootNode']) => {
      nodes.push(node);
      for (const child of node.children) visit(child);
    };
    visit(screen.rootNode);
    return nodes;
  }).find((node) => node.id === selectedNodeId);
  expect(exportedNode?.resourceRef?.slug).toBe(candidateSlug);
  expect(exportedNode?.variant).toBe('quiet');

  runtime.checks = { ...runtime.checks, replacedResource, originalResourceMetadata, replacedResourceMetadata, undoRestored: originalResourceMetadata, redoRestored: replacedResourceMetadata, exportedResource: exportedNode?.resourceRef?.slug, exportedVariant: exportedNode?.variant };
  await saveEvidence(page, runtime, 'after', 'replace-gold-resource');
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('audit Beta accessibility and performance fixes apply through the visible UI', async ({ page }) => {
  const runtime = captureRuntime(page);
  const manifest = ProjectManifestSchema.parse(
    JSON.parse(
      await readFile(
        path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json'),
        'utf8'
      )
    )
  );
  manifest.id = 'audit-beta-fix-browser-fixture';
  manifest.constraints.accessibilityFloor = 'AAA';
  manifest.constraints.performanceCeiling = 'lightweight';
  manifest.designDNA.contrast = 60;
  manifest.designDNA.threeDIntensity = 50;
  manifest.designDNA.videoIntensity = 25;

  // Seed only a valid test project. The fixes themselves are performed through
  // the same visible Workbench controls a user would activate.
  await page.addInitScript((fixture) => {
    localStorage.setItem('tessellate_active_project', JSON.stringify(fixture));
  }, manifest);
  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  if ((page.viewportSize()?.width ?? 1440) < 1024) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Audit', exact: true })
      .click();
  } else {
    await page.getByRole('button', { name: 'audit', exact: true }).click();
  }
  await expect(page.getByRole('heading', { name: 'Deterministic Quality Audit' })).toBeVisible();

  const evidenceViewport = (page.viewportSize()?.width ?? 1440) < 1024 ? 'mobile-390' : 'desktop-1440';
  await saveEvidence(page, runtime, 'before', `audit-beta-fixes-${evidenceViewport}`);

  const accessibilityFilter = page.getByRole('button', { name: /Accessibility/ }).first();
  await accessibilityFilter.click();
  const accessibilityIssue = page.getByText(/fails project WCAG AAA floor requirement/);
  await expect(accessibilityIssue).toBeVisible();
  const accessibilityFix = accessibilityIssue
    .locator('xpath=ancestor::div[contains(@class,"p-4") and contains(@class,"rounded-xl")][1]')
    .getByRole('button', { name: 'Fix Beta', exact: true });
  await expect(accessibilityFix).toBeVisible();
  await expect(accessibilityFix.getByTestId('audit-fix-beta-badge')).toHaveAttribute(
    'title',
    /review the suggested manifest change/
  );
  await accessibilityFix.click();
  await expect(accessibilityIssue).toHaveCount(0);

  const performanceFilter = page.getByRole('button', { name: /Performance/ }).first();
  await performanceFilter.click();
  const performanceIssue = page.getByText(/intensity enabled while project performance ceiling is set to lightweight/);
  await expect(performanceIssue).toBeVisible();
  const performanceFix = performanceIssue
    .locator('xpath=ancestor::div[contains(@class,"p-4") and contains(@class,"rounded-xl")][1]')
    .getByRole('button', { name: 'Fix Beta', exact: true });
  await expect(performanceFix).toBeVisible();
  await performanceFix.click();
  await expect(performanceIssue).toHaveCount(0);

  const exported = await exportManifest(page, 'audit-beta-fixes.tess.json');
  expect(exported.designDNA.contrast).toBe(85);
  expect(exported.designDNA.threeDIntensity).toBe(0);
  expect(exported.designDNA.videoIntensity).toBe(0);
  expect(ProjectManifestSchema.safeParse(exported).success).toBe(true);

  runtime.checks = {
    accessibilityIssueResolvedInUi: true,
    performanceIssueResolvedInUi: true,
    exportedContrast: exported.designDNA.contrast,
    exportedThreeDIntensity: exported.designDNA.threeDIntensity,
    exportedVideoIntensity: exported.designDNA.videoIntensity,
    exportedSchemaValid: true,
  };
  await saveEvidence(page, runtime, 'after', `audit-beta-fixes-${evidenceViewport}`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
