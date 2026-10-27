import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

async function createLargeWorkbenchManifest(): Promise<ProjectManifest> {
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

  for (let screenNumber = 1; screenNumber <= 30; screenNumber += 1) {
    const screenId = `performance-screen-${screenNumber}`;
    const graphScreenId = `performance-graph-screen-${screenNumber}`;
    const graphScreen = {
      ...structuredClone(graphTemplate),
      id: graphScreenId,
      name: `People Workspace ${screenNumber}`,
      slug: `/people/workspace-${screenNumber}`,
      purpose: 'Review team capacity, onboarding progress, and people operations.',
      requiredRoles: ['app-shell', 'content-section'],
    };
    const contentSections: ProjectNode[] = Array.from({ length: 12 }, (_, sectionIndex) => ({
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
      children: contentSections,
    };

    graphScreens.push(graphScreen);
    screens.push({
      ...structuredClone(screenTemplate),
      id: screenId,
      screenNodeId: graphScreenId,
      name: `People Workspace ${screenNumber}`,
      slug: `/people/workspace-${screenNumber}`,
      rootNode,
    });
  }

  manifest.id = 'performance-large-30-screens';
  manifest.name = 'Performance fixture — 30 employee experience screens';
  manifest.description = 'A local performance fixture with 30 screens and 1,830 manifest nodes.';
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

function firstResourceNode(node: ProjectNode): ProjectNode | null {
  if (node.resourceRef) return node;
  for (const child of node.children) {
    const found = firstResourceNode(child);
    if (found) return found;
  }
  return null;
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

async function addPerformanceObserver(page: Page) {
  await page.addInitScript(() => {
    const samples = { lcp: null as number | null, cls: 0, longTaskMs: 0, longTaskCount: 0 };
    (window as Window & { __step38Samples?: typeof samples }).__step38Samples = samples;
    try {
      new PerformanceObserver((list) => {
        const latest = list.getEntries().at(-1);
        if (latest) samples.lcp = latest.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      // Keep unsupported browser metrics null rather than estimating them.
    }
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        >) {
          if (!entry.hadRecentInput) samples.cls += entry.value ?? 0;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // Keep unsupported browser metrics at their initialized neutral value.
    }
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        samples.longTaskCount += entries.length;
        samples.longTaskMs += entries.reduce((sum, entry) => sum + entry.duration, 0);
      }).observe({ type: 'longtask', buffered: true });
    } catch {
      // Long Tasks is supplemental and not implemented in every browser.
    }
  });
}

test('Explore remains usable on constrained 4G and 4x CPU', async ({ browser }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'CDP network and CPU emulation are Chromium-only; the mobile and cross-browser dimensions are measured separately.'
  );

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    browserCancellations: [] as Array<{
      url: string;
      error: string | null;
      frameUrl: string | null;
      phase: string;
    }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  let phase = 'initial-render';
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? null;
    if (/^(?:net::ERR_ABORTED|Load request cancelled)$/i.test(failure ?? '')) {
      let frameUrl: string | null = null;
      try {
        frameUrl = request.frame().url();
      } catch {
        // A detached preview frame still records as a cancellation with a null URL.
      }
      runtime.browserCancellations.push({ url: request.url(), error: failure, frameUrl, phase });
    } else {
      runtime.failedRequests.push({ url: request.url(), error: failure });
    }
  });
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  await addPerformanceObserver(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1_600_000 / 8,
    uploadThroughput: 750_000 / 8,
    connectionType: 'cellular3g',
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const startedAt = Date.now();
  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible({
    timeout: 30_000,
  });
  const routeReadyMs = Date.now() - startedAt;
  const searchStartedAt = Date.now();
  phase = 'user-filtered-catalogue';
  await page.getByLabel('Search catalogue').fill('onboarding');
  await expect(page.getByRole('link', { name: 'Onboarding Role Select', exact: true })).toBeVisible(
    { timeout: 15_000 }
  );
  await expect(
    page
      .frameLocator('iframe[title="Onboarding Role Select actual preview"]')
      .locator('.tess-screen')
  ).toBeVisible({ timeout: 20_000 });
  const firstPreviewReadyMs = Date.now() - searchStartedAt;

  const browserMetrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const metrics = (
      window as Window & {
        __step38Samples?: {
          lcp: number | null;
          cls: number;
          longTaskMs: number;
          longTaskCount: number;
        };
      }
    ).__step38Samples;
    return {
      lcpMs: metrics?.lcp ?? null,
      cls: metrics?.cls ?? null,
      longTaskMs: metrics?.longTaskMs ?? null,
      longTaskCount: metrics?.longTaskCount ?? null,
      catalogueTransferBytes: resources
        .filter((entry) => entry.name.endsWith('/data/catalog.json'))
        .reduce((sum, entry) => sum + entry.transferSize, 0),
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  const screenshot = path.resolve(
    process.cwd(),
    'quality/evidence/step-38/after/constrained-and-large/explore-slow-4g-cpu4.png'
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: false });
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    throttle: {
      latencyMs: 150,
      downloadBitsPerSecond: 1_600_000,
      uploadBitsPerSecond: 750_000,
      cpuSlowdownFactor: 4,
    },
    routeReadyMs,
    firstPreviewReadyMs,
    browserMetrics,
    runtime,
    cancellationDisposition:
      'Preview module requests aborted when nonmatching preview iframes unmount after the user filters the catalogue; recorded separately from failed network requests.',
    screenshot: path.relative(process.cwd(), screenshot),
  };
  const output = path.resolve(
    process.cwd(),
    'quality/evidence/step-38/after/constrained-and-large/constrained-4g.json'
  );
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('constrained network and CPU measurements', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(routeReadyMs).toBeLessThan(10_000);
  expect(firstPreviewReadyMs).toBeLessThan(8_000);
  expect(browserMetrics.documentWidth).toBeLessThanOrEqual(browserMetrics.viewportWidth);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
  const unexpectedCancellations = runtime.browserCancellations.filter(({ url, frameUrl, phase: cancelPhase }) => {
    if (cancelPhase !== 'user-filtered-catalogue') return true;
    try {
      const requestPath = new URL(url).pathname;
      const ownerFramePath = frameUrl ? new URL(frameUrl).pathname : null;
      return requestPath !== '/preview-content/' && ownerFramePath !== '/preview-content/';
    } catch {
      return true;
    }
  });
  expect(unexpectedCancellations, 'only removed sandbox preview frames may cancel requests during catalogue filtering').toEqual([]);
  await cdp.detach();
  await context.close();
});

test('large Workbench project loads, navigates, and exports within local budgets', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'The 30-screen large-project baseline is run once on desktop; other viewport behavior is covered by the responsive matrix.'
  );

  const manifest = await createLargeWorkbenchManifest();
  const json = JSON.stringify(manifest);
  const expectedNodes = countNodes(manifest);
  expect(manifest.screens).toHaveLength(30);
  expect(expectedNodes).toBe(1_830);
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as string[],
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  await addPerformanceObserver(page);
  await page.addInitScript((savedManifest: ProjectManifest) => {
    const serialized = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, serialized);
    localStorage.setItem('tessellate_active_project', serialized);
  }, manifest);

  const workbenchStartedAt = Date.now();
  await page.goto(`/workbench?project=${manifest.id}`);
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved', {
    timeout: 20_000,
  });
  const workbenchReadyMs = Date.now() - workbenchStartedAt;
  const leftPanel = page.getByTestId('left-panel');
  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  const pageButtons = page.getByTestId('pages-tab').locator('button[aria-label^="Select screen "]');
  await expect(page.getByText('Screens & Navigation (30)', { exact: true })).toBeVisible();
  await expect(pageButtons).toHaveCount(30);
  const switchStartedAt = Date.now();
  await pageButtons.last().click();
  const canvas = page.getByTestId('workbench-canvas');
  await expect(canvas.locator('[data-screen-id="performance-screen-30"]')).toBeVisible();
  await expect(canvas).toContainText('Employee experience workflow 30-12-4');
  const screenSwitchMs = Date.now() - switchStartedAt;
  const screenshot = path.resolve(
    process.cwd(),
    'quality/evidence/step-38/after/constrained-and-large/workbench-30-screens.png'
  );
  await mkdir(path.dirname(screenshot), { recursive: true });
  await page.screenshot({ path: screenshot, fullPage: false });

  const manifestExportStartedAt = Date.now();
  await page.getByTestId('export-button').click();
  const manifestDownloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const manifestDownload = await manifestDownloadPromise;
  const manifestExportPath = testInfo.outputPath('large-project.tess.json');
  await manifestDownload.saveAs(manifestExportPath);
  const manifestExportMs = Date.now() - manifestExportStartedAt;
  const exportedManifest = ProjectManifestSchema.parse(
    JSON.parse(await readFile(manifestExportPath, 'utf8'))
  );
  expect(exportedManifest.id).toBe(manifest.id);
  expect(exportedManifest.screens).toHaveLength(30);
  expect(countNodes(exportedManifest)).toBe(expectedNodes);

  const zipExportStartedAt = Date.now();
  await page.getByTestId('export-button').click();
  const zipDownloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-zip-btn').click();
  const zipDownload = await zipDownloadPromise;
  const zipPath = await zipDownload.path();
  if (!zipPath) throw new Error('Large-project standalone ZIP did not produce a local file.');
  const zipExportMs = Date.now() - zipExportStartedAt;
  const zipBytes = (await stat(zipPath)).size;
  const browserMetrics = await page.evaluate(() => {
    const metrics = (
      window as Window & {
        __step38Samples?: {
          lcp: number | null;
          cls: number;
          longTaskMs: number;
          longTaskCount: number;
        };
      }
    ).__step38Samples;
    return {
      lcpMs: metrics?.lcp ?? null,
      cls: metrics?.cls ?? null,
      longTaskMs: metrics?.longTaskMs ?? null,
      longTaskCount: metrics?.longTaskCount ?? null,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  const evidence = {
    capturedAt: new Date().toISOString(),
    source:
      'Derived from the current employee-experience showcase manifest, expanded to 30 screens and 1,830 nodes, then loaded from browser storage; interaction and export steps use the visible Workbench UI.',
    project: {
      id: manifest.id,
      screens: manifest.screens.length,
      nodes: expectedNodes,
      jsonBytes: Buffer.byteLength(json),
    },
    timingsMs: {
      workbenchReady: workbenchReadyMs,
      switchToFinalScreen: screenSwitchMs,
      manifestExport: manifestExportMs,
      standaloneZipExport: zipExportMs,
    },
    artifactSizes: {
      manifestBytes: (await stat(manifestExportPath)).size,
      standaloneZipBytes: zipBytes,
    },
    browserMetrics,
    runtime,
    screenshot: path.relative(process.cwd(), screenshot),
  };
  const output = path.resolve(
    process.cwd(),
    'quality/evidence/step-38/after/constrained-and-large/workbench-large-project.json'
  );
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('large Workbench project measurements', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(workbenchReadyMs).toBeLessThan(20_000);
  expect(screenSwitchMs).toBeLessThan(3_000);
  expect(manifestExportMs).toBeLessThan(5_000);
  expect(zipExportMs).toBeLessThan(15_000);
  expect(browserMetrics.documentWidth).toBeLessThanOrEqual(browserMetrics.viewportWidth);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a saved Workbench project opens before catalogue resources are requested', async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'This startup regression is measured against the production-like Sites Worker.'
  );

  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = `catalogue-loading-${testInfo.project.name}`;
  manifest.name = 'Saved employee workspace';

  const runtime = { consoleErrors: [] as string[], uncaughtExceptions: [] as string[], failedRequests: [] as string[], httpErrors: [] as Array<{ url: string; status: number }> };
  const requestStartedAt = new WeakMap<object, number>();
  const networkResponses: Array<{
    method: string;
    path: string;
    resourceType: string;
    status: number;
    durationMs: number | null;
  }> = [];
  page.on('console', (message) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => runtime.failedRequests.push(`${request.url()} (${request.failure()?.errorText ?? 'unknown'})`));
  page.on('request', (request) => requestStartedAt.set(request, Date.now()));
  page.on('response', (response) => {
    const request = response.request();
    const startedAtMs = requestStartedAt.get(request);
    const parsedUrl = new URL(response.url());
    const path = parsedUrl.pathname.startsWith('/cdn-cgi/challenge-platform/')
      ? '/cdn-cgi/challenge-platform/[redacted]'
      : parsedUrl.pathname;
    networkResponses.push({
      method: request.method(),
      path,
      resourceType: request.resourceType(),
      status: response.status(),
      durationMs: startedAtMs !== undefined
        ? Date.now() - startedAtMs
        : null,
    });
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.addInitScript((savedManifest) => {
    const serialized = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, serialized);
    localStorage.setItem('tessellate_active_project', serialized);
  }, manifest);

  let releaseCatalogue!: () => void;
  let catalogueRequests = 0;
  const catalogueGate = new Promise<void>((resolve) => {
    releaseCatalogue = resolve;
  });
  await page.route('**/data/catalog.json', async (route) => {
    catalogueRequests += 1;
    await catalogueGate;
    await route.continue();
  });

  const startedAt = Date.now();
  // Measure when the saved project is actually usable, not when every lazy or
  // offscreen resource has finished and the document's `load` event fires.
  await page.goto(`/workbench?project=${manifest.id}`, { waitUntil: 'commit' });
  const shell = testInfo.project.name.includes('mobile')
    ? page.getByTestId('mobile-workbench')
    : page.getByTestId('workbench-shell');
  await expect(shell).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole('heading', { name: `Workbench: ${manifest.name}` })).toBeAttached();
  const visibleProjectHeading = page
    .getByRole('main', { name: 'Workbench editor' })
    .getByRole('heading', { name: 'A better workday starts with people.', exact: true })
    .first();
  await expect(visibleProjectHeading).toBeVisible({ timeout: 5_000 });
  const projectVisibleMs = Date.now() - startedAt;
  const navigationTiming = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return navigation
      ? {
          readyState: document.readyState,
          domContentLoadedMs: navigation.domContentLoadedEventEnd || null,
        domInteractiveMs: navigation.domInteractive || null,
          loadEventMs: navigation.loadEventEnd || null,
        responseStartMs: navigation.responseStart || null,
        responseEndMs: navigation.responseEnd || null,
        }
      : null;
  });
  const initialCatalogRequests = catalogueRequests;

  expect(initialCatalogRequests, 'Opening a saved local project should not fetch the full catalogue.').toBe(0);
  const startupEvidenceDirectory = path.resolve(
    process.cwd(),
    'quality/evidence/step-45/public-v49/aud-365-reaudit'
  );
  await mkdir(startupEvidenceDirectory, { recursive: true });
  const startupScreenshot = path.join(startupEvidenceDirectory, `workbench-${testInfo.project.name}.png`);
  await page.screenshot({ path: startupScreenshot });
  const axe = await new AxeBuilder({ page }).analyze();
  const axeViolations = axe.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  }));
  const startupEvidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    project: { id: manifest.id, name: manifest.name },
    timingsMs: { savedProjectVisible: projectVisibleMs, ...navigationTiming },
    initialCatalogRequests,
    networkResponses,
    axeViolations,
    runtime,
    screenshot: path.relative(process.cwd(), startupScreenshot),
  };
  const startupEvidencePath = path.join(startupEvidenceDirectory, `workbench-${testInfo.project.name}.json`);
  await writeFile(startupEvidencePath, `${JSON.stringify(startupEvidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Workbench startup accessibility evidence', {
    body: Buffer.from(JSON.stringify(startupEvidence, null, 2)),
    contentType: 'application/json',
  });
  expect(axeViolations, JSON.stringify(axeViolations, null, 2)).toEqual([]);

  if (!testInfo.project.name.includes('mobile')) {
    await page.getByTestId('left-panel').getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByTestId('library-tab').getByRole('status')).toContainText(/catalogue/i);
    await expect.poll(() => catalogueRequests).toBe(1);
    const resourceNode = firstResourceNode(manifest.screens[0]!.rootNode);
    expect(resourceNode, 'The saved showcase fixture should include a rendered Gold resource.').not.toBeNull();
    await page.locator(`[data-node-id="${resourceNode!.id}"]`).click();
    await page.keyboard.press('r');
    const replacement = page.getByRole('dialog', { name: 'Replace Resource' });
    await expect(replacement).toBeVisible();
    await expect(replacement.getByRole('status')).toContainText(/loading compatible candidates/i);
    await page.screenshot({
      path: path.resolve(process.cwd(), 'quality/evidence/step-38/after/catalogue-lazy-load/replacement-loading.png'),
    });
    releaseCatalogue();
    await expect(replacement.getByText(/Loading compatible candidates/i)).toHaveCount(0);
    await expect(replacement.getByText(/No compatible candidate resources found|Apply Replacement/).first()).toBeVisible({ timeout: 15_000 });
    await replacement.getByRole('button', { name: 'Close Replace Drawer' }).click();
    await expect(page.getByTestId('library-tab').getByText(/Gold runtime/i).first()).toBeVisible({ timeout: 15_000 });
  }

  releaseCatalogue();
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    project: { id: manifest.id, name: manifest.name },
    timingsMs: { savedProjectVisible: projectVisibleMs, ...navigationTiming },
    initialCatalogRequests,
    catalogRequestsAfterLibraryOpen: catalogueRequests,
    axeViolations: axe.violations.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
    runtime,
    screenshot: `quality/evidence/step-38/after/catalogue-lazy-load/workbench-${testInfo.project.name}.png`,
  };
  const evidencePath = path.resolve(process.cwd(), `quality/evidence/step-38/after/catalogue-lazy-load/workbench-${testInfo.project.name}.json`);
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Workbench catalogue startup evidence', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
  expect(projectVisibleMs).toBeLessThan(5_000);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});

test('a catalogue failure leaves a saved project intact and Library can retry', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'The failure and retry controls are exercised in the desktop editor; mobile startup is covered separately.'
  );

  const fixturePath = path.resolve(process.cwd(), 'apps/site/public/data/showcases/showcase-playful-hr.json');
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(fixturePath, 'utf8')));
  manifest.id = 'catalogue-loading-retry';
  manifest.name = 'Saved project during catalogue failure';
  await page.addInitScript((savedManifest) => {
    const serialized = JSON.stringify(savedManifest);
    localStorage.setItem(`tessellate_project_${savedManifest.id}`, serialized);
    localStorage.setItem('tessellate_active_project', serialized);
  }, manifest);

  let catalogueRequests = 0;
  await page.route('**/data/catalog.json', async (route) => {
    catalogueRequests += 1;
    if (catalogueRequests === 1) await route.fulfill({ status: 503, body: 'temporarily unavailable' });
    else await route.continue();
  });
  await page.goto(`/workbench?project=${manifest.id}`);
  await expect(page.getByTestId('workbench-shell')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole('heading', { name: `Workbench: ${manifest.name}` })).toBeAttached();
  await page.getByTestId('left-panel').getByRole('button', { name: 'Library', exact: true }).click();
  const library = page.getByTestId('library-tab');
  await expect(library.getByRole('alert')).toContainText('The catalogue could not be loaded');
  await expect(page.getByRole('heading', { name: `Workbench: ${manifest.name}` })).toBeAttached();
  await page.screenshot({ path: path.resolve(process.cwd(), 'quality/evidence/step-38/after/catalogue-lazy-load/catalogue-error-retry.png') });

  await library.getByRole('button', { name: 'Retry catalogue' }).click();
  await expect(library.getByText(/Gold runtime/i).first()).toBeVisible({ timeout: 15_000 });
  expect(catalogueRequests).toBe(2);
  await expect(page.getByRole('heading', { name: `Workbench: ${manifest.name}` })).toBeAttached();

  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    projectPreservedAcrossFailureAndRetry: manifest.id,
    catalogueRequests,
    firstFailure: { expected: 'HTTP 503', actual: 'Library shows a retryable catalogue-unavailable message' },
    retry: { expected: 'HTTP 200', actual: 'Gold runtime resources are visible' },
  };
  const evidencePath = path.resolve(process.cwd(), 'quality/evidence/step-38/after/catalogue-lazy-load/catalogue-error-retry.json');
  await mkdir(path.dirname(evidencePath), { recursive: true });
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Workbench catalogue failure and retry evidence', { body: Buffer.from(JSON.stringify(evidence, null, 2)), contentType: 'application/json' });
});
