import { expect, test, type Page } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';

const SCREEN_COUNTS = [3, 10, 30, 50] as const;
const EVIDENCE = path.resolve(process.cwd(), 'quality/evidence/step-43');

async function createScaleManifest(screenCount: number): Promise<ProjectManifest> {
  const showcasePath = path.resolve(
    process.cwd(),
    'apps/site/public/data/showcases/showcase-playful-hr.json'
  );
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(showcasePath, 'utf8')));
  const graphTemplate = manifest.screenGraph.groups.find((group) => group.screens.length > 0)!
    .screens[0]!;
  const screenTemplate = manifest.screens[0]!;
  const graphScreens = [];
  const screens = [];

  for (let screenNumber = 1; screenNumber <= screenCount; screenNumber += 1) {
    const screenId = `step43-scale-screen-${screenNumber}`;
    const graphScreenId = `step43-scale-graph-screen-${screenNumber}`;
    const sections: ProjectNode[] = Array.from({ length: 12 }, (_, sectionIndex) => ({
      id: `${screenId}-section-${sectionIndex + 1}`,
      nodeType: 'section',
      semanticRole: 'content-section',
      slots: { heading: `Team workspace ${sectionIndex + 1}` },
      props: {},
      children: Array.from({ length: 4 }, (_, itemIndex) => ({
        id: `${screenId}-section-${sectionIndex + 1}-item-${itemIndex + 1}`,
        nodeType: 'component',
        semanticRole: 'summary-item',
        slots: {},
        props: {
          children: `Employee experience workflow ${screenNumber}-${sectionIndex + 1}-${itemIndex + 1}`,
        },
        children: [],
      })),
    }));
    const rootNode: ProjectNode = {
      id: `${screenId}-root`,
      nodeType: 'layout',
      semanticRole: 'app-shell',
      props: { className: 'min-h-screen w-full space-y-4 p-8' },
      slots: {},
      children: sections,
    };

    graphScreens.push({
      ...structuredClone(graphTemplate),
      id: graphScreenId,
      name: `People Workspace ${screenNumber}`,
      slug: `/people/workspace-${screenNumber}`,
      purpose: 'Review team capacity, onboarding progress, and people operations.',
      requiredRoles: ['app-shell', 'content-section'],
    });
    screens.push({
      ...structuredClone(screenTemplate),
      id: screenId,
      screenNodeId: graphScreenId,
      name: `People Workspace ${screenNumber}`,
      slug: `/people/workspace-${screenNumber}`,
      rootNode,
    });
  }

  manifest.id = `step43-scale-${screenCount}-screens`;
  manifest.name = `Scale fixture — ${screenCount} employee experience screens`;
  manifest.description = `A browser scale fixture with ${screenCount} screens and ${screenCount * 61} nodes.`;
  manifest.updatedAt = new Date().toISOString();
  manifest.screenGraph = {
    ...manifest.screenGraph,
    groups: manifest.screenGraph.groups.map((group, index) =>
      index === 0 ? { ...group, screens: graphScreens } : { ...group, screens: [] }
    ),
    edges: [],
  };
  manifest.screens = screens;
  manifest.navigation = {
    ...manifest.navigation,
    primaryItems: screens.map((screen) => ({ label: screen.name, targetScreenId: screen.id })),
    secondaryItems: [],
  };
  manifest.locks = [];

  return ProjectManifestSchema.parse(manifest);
}

function countNodes(manifest: ProjectManifest) {
  let count = 0;
  const visit = (node: ProjectNode) => {
    count += 1;
    node.children.forEach(visit);
  };
  manifest.screens.forEach((screen) => visit(screen.rootNode));
  return count;
}

async function heapBytes(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    const memory = (
      performance as Performance & { memory?: { usedJSHeapSize?: number } }
    ).memory;
    return typeof memory?.usedJSHeapSize === 'number' ? memory.usedJSHeapSize : null;
  });
}

for (const screenCount of SCREEN_COUNTS) {
  test(`Workbench persists, navigates and exports a ${screenCount}-screen project`, async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'sites-chromium',
      'This scale benchmark runs once in desktop Chromium; the separate responsive matrix covers mobile/tablet usability.'
    );
    test.setTimeout(180_000);

    const manifest = await createScaleManifest(screenCount);
    const expectedNodeCount = countNodes(manifest);
    expect(expectedNodeCount).toBe(screenCount * 61);

    const runtime = {
      consoleErrors: [] as string[],
      uncaughtExceptions: [] as string[],
      failedRequests: [] as Array<{ url: string; error: string | null }>,
      httpErrors: [] as Array<{ url: string; status: number }>,
    };
    page.on('console', (message) => {
      if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) =>
      runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        runtime.httpErrors.push({ url: response.url(), status: response.status() });
    });

    await page.goto('/');
    await page.evaluate((savedManifest: ProjectManifest) => {
      const serialized = JSON.stringify(savedManifest);
      localStorage.setItem(`tessellate_project_${savedManifest.id}`, serialized);
      localStorage.setItem('tessellate_active_project', serialized);
    }, manifest);

    const startedAt = Date.now();
    await page.goto(`/workbench?project=${manifest.id}`);
    await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved', {
      timeout: 30_000,
    });
    const readyMs = Date.now() - startedAt;

    const pagesPanel = page.getByTestId('left-panel');
    await pagesPanel.getByRole('button', { name: 'Pages', exact: true }).click();
    await expect(page.getByText(`Screens & Navigation (${screenCount})`, { exact: true })).toBeVisible();
    const screenButtons = page.getByTestId('pages-tab').locator('button[aria-label^="Select screen "]');
    await expect(screenButtons).toHaveCount(screenCount);

    const visited: number[] = [];
    const navigationTimings: number[] = [];
    for (const index of [...new Set([0, Math.floor((screenCount - 1) / 2), screenCount - 1])]) {
      const startedSwitchAt = Date.now();
      await screenButtons.nth(index).click();
      await expect(page.getByTestId('workbench-canvas').locator(
        `[data-screen-id="step43-scale-screen-${index + 1}"]`
      )).toBeVisible();
      await expect(page.getByTestId('workbench-canvas')).toContainText(
        `Employee experience workflow ${index + 1}-12-4`
      );
      navigationTimings.push(Date.now() - startedSwitchAt);
      visited.push(index + 1);
    }

    const heapBeforeReload = await heapBytes(page);
    const screenshot = path.join(EVIDENCE, `workbench-scale-${screenCount}-screens-sites-chromium.png`);
    await mkdir(path.dirname(screenshot), { recursive: true });
    await page.screenshot({ path: screenshot, fullPage: false });

    await page.reload();
    await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved', {
      timeout: 30_000,
    });
    await page.getByTestId('left-panel').getByRole('button', { name: 'Pages', exact: true }).click();
    await expect(page.getByText(`Screens & Navigation (${screenCount})`, { exact: true })).toBeVisible();

    const exportStartedAt = Date.now();
    await page.getByTestId('export-button').click();
    const pendingDownload = page.waitForEvent('download');
    await page.getByTestId('export-manifest-btn').click();
    const download = await pendingDownload;
    const exportPath = testInfo.outputPath(`scale-${screenCount}.tess.json`);
    await download.saveAs(exportPath);
    const exported = ProjectManifestSchema.parse(JSON.parse(await readFile(exportPath, 'utf8')));
    const exportMs = Date.now() - exportStartedAt;

    expect(exported.id).toBe(manifest.id);
    expect(exported.screens).toHaveLength(screenCount);
    expect(countNodes(exported)).toBe(expectedNodeCount);
    expect(exported.screens.at(-1)?.rootNode.children[11]?.children[3]?.props.children).toBe(
      `Employee experience workflow ${screenCount}-12-4`
    );

    const browserMetrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      heapBytes: (
        performance as Performance & { memory?: { usedJSHeapSize?: number } }
      ).memory?.usedJSHeapSize ?? null,
    }));
    const evidence = {
      capturedAt: new Date().toISOString(),
      runtime: 'ChatGPT Sites Worker local preview',
      browser: testInfo.project.name,
      viewport: page.viewportSize(),
      project: { id: manifest.id, screens: screenCount, nodes: expectedNodeCount },
      checks: {
        loaded: true,
        visibleScreenCount: screenCount,
        visitedScreens: visited,
        reloaded: true,
        manifestIdentityPreserved: exported.id === manifest.id,
        exportNodeCountPreserved: countNodes(exported) === expectedNodeCount,
      },
      timingsMs: { workbenchReady: readyMs, screenSwitches: navigationTimings, manifestExport: exportMs },
      memory: { usedHeapBeforeReload: heapBeforeReload, usedHeapAfterReload: browserMetrics.heapBytes },
      layout: browserMetrics,
      runtimeErrors: runtime,
      screenshot: path.relative(process.cwd(), screenshot),
    };
    await writeFile(
      path.join(EVIDENCE, `workbench-scale-${screenCount}-screens-sites-chromium.json`),
      `${JSON.stringify(evidence, null, 2)}\n`,
      'utf8'
    );

    expect(readyMs).toBeLessThan(screenCount >= 30 ? 30_000 : 15_000);
    expect(Math.max(...navigationTimings)).toBeLessThan(5_000);
    expect(exportMs).toBeLessThan(10_000);
    expect(browserMetrics.documentWidth).toBeLessThanOrEqual(browserMetrics.viewportWidth);
    expect(runtime.consoleErrors).toEqual([]);
    expect(runtime.uncaughtExceptions).toEqual([]);
    expect(runtime.failedRequests).toEqual([]);
    expect(runtime.httpErrors).toEqual([]);
  });
}
