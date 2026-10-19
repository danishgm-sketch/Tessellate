import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { ProjectManifestSchema, ResourceManifestSchema, type ProjectManifest, type ProjectNode } from '../../packages/schemas/src/index.js';

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

async function saveEvidence(
  page: Page,
  runtime: ReturnType<typeof captureRuntime>,
  phase: 'before' | 'after',
  name: string
) {
  const directory = path.resolve(process.cwd(), `quality/evidence/step-20/${phase}`);
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

function allNodes(manifest: ProjectManifest) {
  const result: ProjectNode[] = [];
  const visit = (node: ProjectNode) => {
    result.push(node);
    for (const child of node.children) visit(child);
  };
  for (const screen of manifest.screens) visit(screen.rootNode);
  return result;
}

function findNode(manifest: ProjectManifest, id: string) {
  return allNodes(manifest).find((node) => node.id === id);
}

function subtreeHash(node: ProjectNode) {
  const canonicalize = (value: unknown): unknown => {
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(canonicalize);
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)])
    );
  };
  return createHash('sha256').update(JSON.stringify(canonicalize(node))).digest('hex');
}

async function openEmployeeOverview(page: Page) {
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  await page.goto('/showcase/showcase-playful-hr');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  if (viewport.width < 1024) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Pages', exact: true })
      .click();
  } else {
    await expect(page.getByTestId('workbench-shell')).toBeVisible();
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
  }

  await page.getByRole('button', { name: 'Select screen Team Overview', exact: true }).click();
  if (viewport.width >= 1024) {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Layers', exact: true }).click();
  }
  await expect(page.getByTestId('layers-tab')).toBeVisible();
  await expect(page.getByTestId('layer-node-node-screen-overview-metric-cards-3')).toBeVisible();
}

async function lockOverviewKpis(page: Page) {
  const kpi = page.getByTestId('layer-node-node-screen-overview-metric-cards-3');
  await kpi.click();
  const lock = kpi.getByRole('button', { name: 'Lock Your organisation at a glance', exact: true });
  await lock.click();
  await expect(kpi.getByRole('button', { name: 'Unlock Your organisation at a glance', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
}

async function exportManifest(page: Page, filename: string, phase: 'before' | 'after' = 'after'): Promise<ProjectManifest> {
  await page.getByTestId('export-button').click();
  const pending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await pending;
  const destination = path.resolve(process.cwd(), `quality/evidence/step-20/${phase}/${filename}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await download.saveAs(destination);
  return ProjectManifestSchema.parse(JSON.parse(await readFile(destination, 'utf8')));
}

async function assertAllResourcesResolve(page: Page, manifest: ProjectManifest) {
  const cataloguePayload = await page.evaluate(async () => {
    const response = await fetch('/data/catalog.json');
    if (!response.ok) throw new Error(`Catalogue HTTP ${response.status}`);
    return response.json();
  });
  const resources = ResourceManifestSchema.array().parse(cataloguePayload.resources);
  const available = new Set(resources.map((resource) => `${resource.id}:${resource.slug}`));
  const unresolved = allNodes(manifest)
    .filter((node) => node.resourceRef)
    .filter((node) => !available.has(`${node.resourceRef!.id}:${node.resourceRef!.slug}`))
    .map((node) => ({ nodeId: node.id, resourceRef: node.resourceRef }));
  expect(unresolved).toEqual([]);
  return resources.length;
}

test('radical Recompose changes the employee overview while preserving the locked KPI subtree', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openEmployeeOverview(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  await saveEvidence(page, runtime, 'before', `radical-recompose-${suffix}`);

  await lockOverviewKpis(page);
  const lockedBefore = await exportManifest(page, 'locked-kpi-before-recompose.tess.json');
  const lockedKpiBefore = findNode(lockedBefore, 'node-screen-overview-metric-cards-3');
  expect(lockedKpiBefore?.locks?.node).toBe(true);
  expect(lockedKpiBefore?.resourceRef?.slug).toBe('dashboard-kpi-grid');
  const lockedHash = subtreeHash(lockedKpiBefore!);
  const originalIds = allNodes(lockedBefore).map((node) => node.id);
  const originalResourceRefs = allNodes(lockedBefore)
    .filter((node) => node.resourceRef)
    .map((node) => `${node.resourceRef!.id}:${node.resourceRef!.slug}`)
    .sort();
  const rootBefore = lockedBefore.screens.find((screen) => screen.name === 'Team Overview')!.rootNode;

  await saveEvidence(page, runtime, 'before', `radical-recompose-locked-${suffix}`);
  await page.getByTestId('recompose-button').click();
  const recomposeStatus = page.getByRole('status').filter({ hasText: 'Recomposed Team Overview' });
  if (viewport.width < 1024) {
    const observed = await exportManifest(page, 'mobile-recompose-feedback-visible.tess.json', 'after');
    runtime.checks = {
      mutationApplied: allNodes(observed).some((node) => node.semanticRole === 'compound-workspace-pane'),
      feedbackVisible: (await recomposeStatus.count()) > 0,
    };
    await saveEvidence(page, runtime, 'after', 'recompose-feedback-visible-mobile-390');
  }
  if (viewport.width < 1024) {
    const mobileFeedback = page.getByTestId('mobile-action-feedback');
    await expect(mobileFeedback).toBeVisible();
    await expect(mobileFeedback).toContainText('Recomposed Team Overview');
    const bounds = await mobileFeedback.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
  }
  await expect(recomposeStatus).toBeVisible();

  const recomposed = await exportManifest(page, `radical-recompose-${suffix}.tess.json`);
  const screen = recomposed.screens.find((item) => item.name === 'Team Overview')!;
  const lockedKpiAfter = findNode(recomposed, 'node-screen-overview-metric-cards-3');
  const nodesAfter = allNodes(recomposed);
  const idsAfter = nodesAfter.map((node) => node.id);
  const resourceRefsAfter = nodesAfter
    .filter((node) => node.resourceRef)
    .map((node) => `${node.resourceRef!.id}:${node.resourceRef!.slug}`)
    .sort();
  const duplicateIds = idsAfter.filter((id, index) => idsAfter.indexOf(id) !== index);
  const unresolvedCount = await assertAllResourcesResolve(page, recomposed);

  expect(lockedKpiAfter).toBeDefined();
  expect(subtreeHash(lockedKpiAfter!)).toBe(lockedHash);
  expect(nodesAfter.some((node) => node.semanticRole === 'compound-workspace-pane')).toBe(true);
  expect(screen.rootNode).not.toEqual(rootBefore);
  expect(originalIds.every((id) => idsAfter.includes(id))).toBe(true);
  expect(duplicateIds).toEqual([]);
  expect(resourceRefsAfter).toEqual(originalResourceRefs);

  const recomposedRoot = screen.rootNode;
  await page.getByRole('button', { name: 'Undo' }).click();
  const undone = await exportManifest(page, `radical-recompose-undo-${suffix}.tess.json`);
  expect(undone.screens.find((item) => item.name === 'Team Overview')!.rootNode).toEqual(rootBefore);
  await page.getByRole('button', { name: 'Redo' }).click();
  const redone = await exportManifest(page, `radical-recompose-redo-${suffix}.tess.json`);
  expect(redone.screens.find((item) => item.name === 'Team Overview')!.rootNode).toEqual(recomposedRoot);

  runtime.checks = {
    lockedNode: {
      id: lockedKpiBefore!.id,
      subtreeHash: lockedHash,
      resourceRef: lockedKpiBefore!.resourceRef,
      variant: lockedKpiBefore!.variant,
      props: lockedKpiBefore!.props,
      dnaOverrides: lockedKpiBefore!.dnaOverrides ?? null,
    },
    divergenceLevel: 95,
    rootRoleAfter: screen.rootNode.semanticRole,
    compoundWorkspacePaneCount: nodesAfter.filter((node) => node.semanticRole === 'compound-workspace-pane').length,
    originalNodeIdsPreserved: originalIds.length,
    duplicateNodeIds: duplicateIds,
    resourceRefCount: resourceRefsAfter.length,
    resolvedCatalogueResources: unresolvedCount,
    undoRestoredRoot: true,
    redoRestoredRoot: true,
    mobileFeedbackVisible: viewport.width < 1024,
  };
  await saveEvidence(page, runtime, 'after', `radical-recompose-${suffix}`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('Surprise Me produces the changes it explains and keeps locked content through undo and redo', async ({ page }) => {
  const runtime = captureRuntime(page);
  await openEmployeeOverview(page);
  const viewport = page.viewportSize() ?? { width: 1440, height: 900 };
  const suffix = viewport.width < 1024 ? 'mobile-390' : 'desktop-1440';
  await lockOverviewKpis(page);
  const lockedBefore = await exportManifest(page, 'locked-kpi-before-surprise.tess.json');
  const lockedKpiBefore = findNode(lockedBefore, 'node-screen-overview-metric-cards-3')!;
  const lockedHash = subtreeHash(lockedKpiBefore);
  const idsBefore = allNodes(lockedBefore).map((node) => node.id);
  const refsBefore = allNodes(lockedBefore)
    .filter((node) => node.resourceRef)
    .map((node) => `${node.resourceRef!.id}:${node.resourceRef!.slug}`)
    .sort();
  await saveEvidence(page, runtime, 'before', `surprise-me-${suffix}`);

  await page.getByTestId('surprise-me-button').click();
  const explanation = page.getByRole('status').filter({ hasText: 'Surprise Me (divergence: 60%)' });
  if (viewport.width < 1024) {
    const observed = await exportManifest(page, 'mobile-surprise-feedback-visible.tess.json', 'after');
    runtime.checks = {
      mutationApplied: observed.designDNA.structuralCreativity > lockedBefore.designDNA.structuralCreativity,
      feedbackVisible: (await explanation.count()) > 0,
    };
    await saveEvidence(page, runtime, 'after', 'surprise-feedback-visible-mobile-390');
  }
  if (viewport.width < 1024) {
    const mobileFeedback = page.getByTestId('mobile-action-feedback');
    await expect(mobileFeedback).toBeVisible();
    await expect(mobileFeedback).toContainText('Surprise Me (divergence: 60%)');
    const bounds = await mobileFeedback.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
  }
  await expect(explanation).toBeVisible();
  await expect(explanation).toContainText('Preserved 1 locked node(s)');

  const surprised = await exportManifest(page, `surprise-me-${suffix}.tess.json`);
  const screenAfter = surprised.screens.find((screen) => screen.name === 'Team Overview')!;
  const lockedKpiAfter = findNode(surprised, lockedKpiBefore.id)!;
  const nodesAfter = allNodes(surprised);
  const idsAfter = nodesAfter.map((node) => node.id);
  const refsAfter = nodesAfter
    .filter((node) => node.resourceRef)
    .map((node) => `${node.resourceRef!.id}:${node.resourceRef!.slug}`)
    .sort();
  const unresolvedCount = await assertAllResourcesResolve(page, surprised);
  const duplicateIds = idsAfter.filter((id, index) => idsAfter.indexOf(id) !== index);
  const expectedAmbition = Math.min(95, lockedBefore.designDNA.visualAmbition + 21);
  const expectedCreativity = Math.min(95, lockedBefore.designDNA.structuralCreativity + 18);

  expect(subtreeHash(lockedKpiAfter)).toBe(lockedHash);
  expect(surprised.designDNA.visualAmbition).toBe(expectedAmbition);
  expect(surprised.designDNA.structuralCreativity).toBe(expectedCreativity);
  expect(surprised.navigation.model).not.toBe(lockedBefore.navigation.model);
  expect(surprised.designDNA.navigationModel).toBe(surprised.navigation.model);
  expect(nodesAfter.some((node) => node.semanticRole === 'grid-dashboard-container')).toBe(true);
  expect(idsBefore.every((id) => idsAfter.includes(id))).toBe(true);
  expect(duplicateIds).toEqual([]);
  expect(refsAfter).toEqual(refsBefore);
  await expect(explanation).toContainText(`visual ambition: ${surprised.designDNA.visualAmbition}`);
  await expect(explanation).toContainText(`structural creativity: ${surprised.designDNA.structuralCreativity}`);
  await expect(explanation).toContainText(`Switched navigation model to "${surprised.navigation.model}"`);
  await expect(explanation).toContainText('Recomposed layout and hierarchy of screen "Team Overview" (divergence: 60%)');

  const surprisedRoot = screenAfter.rootNode;
  const surprisedDNA = surprised.designDNA;
  const surprisedNavigation = surprised.navigation;
  await page.getByRole('button', { name: 'Undo' }).click();
  const undone = await exportManifest(page, `surprise-me-undo-${suffix}.tess.json`);
  expect(undone).toEqual(lockedBefore);
  await page.getByRole('button', { name: 'Redo' }).click();
  const redone = await exportManifest(page, `surprise-me-redo-${suffix}.tess.json`);
  expect(redone.designDNA).toEqual(surprisedDNA);
  expect(redone.navigation).toEqual(surprisedNavigation);
  expect(redone.screens.find((screen) => screen.name === 'Team Overview')!.rootNode).toEqual(surprisedRoot);
  expect(subtreeHash(findNode(redone, lockedKpiBefore.id)!)).toBe(lockedHash);

  runtime.checks = {
    divergenceLevel: 60,
    explanationMatchesManifest: true,
    lockedNode: { id: lockedKpiBefore.id, subtreeHash: lockedHash, resourceRef: lockedKpiBefore.resourceRef, variant: lockedKpiBefore.variant },
    visualAmbition: { before: lockedBefore.designDNA.visualAmbition, after: surprised.designDNA.visualAmbition },
    structuralCreativity: { before: lockedBefore.designDNA.structuralCreativity, after: surprised.designDNA.structuralCreativity },
    navigation: { before: lockedBefore.navigation.model, after: surprised.navigation.model },
    newLayoutGrammar: 'grid-dashboard-container',
    originalNodeIdsPreserved: idsBefore.length,
    duplicateNodeIds: duplicateIds,
    resourceRefCount: refsAfter.length,
    resolvedCatalogueResources: unresolvedCount,
    undoRestoredManifest: true,
    redoRestoredManifest: true,
    mobileFeedbackVisible: viewport.width < 1024,
  };
  await saveEvidence(page, runtime, 'after', `surprise-me-${suffix}`);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
