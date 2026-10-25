import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type RuntimeSamples = {
  lcp: number | null;
  cls: number;
  longTaskMs: number;
  longTaskCount: number;
};

test('Workbench shows a useful server-rendered status before its client bundle is ready', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );

  await page.route('**/_astro/index.*.js', async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 1600));
    await route.fulfill({ response });
  });

  const startedAt = Date.now();
  await page.goto('/workbench', { waitUntil: 'commit' });
  const startupHeading = page.getByRole('heading', { name: 'Preparing your local workspace' });
  await expect(startupHeading).toBeVisible({ timeout: 1000 });
  const fallbackVisibleAtMs = Date.now() - startedAt;
  await page.screenshot({
    path: path.resolve(process.cwd(), `quality/evidence/step-38/after/workbench-startup-fallback-${testInfo.project.name}.png`),
  });
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  await expect(page.getByRole('button', { name: 'Pages' }).first()).toBeVisible({ timeout: 15000 });
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    delayedClientBundleMs: 1600,
    fallbackVisibleAtMs,
    axeViolations: accessibility.violations.map(({ id, impact, description }) => ({ id, impact, description })),
    consoleErrors,
    consoleWarnings,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
  };
  const outputPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-38/after/workbench-startup-fallback-${testInfo.project.name}.json`
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Workbench startup fallback evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });
  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
  expect(accessibility.violations, JSON.stringify(accessibility.violations)).toEqual([]);
});

test('Explore initial catalogue render stays within the CLS budget', async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'This layout-shift regression is measured against the production-like Sites Worker.'
  );

  await page.addInitScript(() => {
    type LayoutShiftEntry = PerformanceEntry & {
      value?: number;
      hadRecentInput?: boolean;
      sources?: Array<{ node?: Node | null }>;
    };
    const target = window as Window & {
      __exploreLayoutShiftSupported?: boolean;
      __exploreLayoutShifts?: Array<{
        startTime: number;
        value: number;
        hadRecentInput: boolean;
        sources: Array<{ tag: string; id: string; className: string }>;
      }>;
    };
    target.__exploreLayoutShiftSupported = false;
    target.__exploreLayoutShifts = [];
    try {
      new PerformanceObserver((list) => {
        for (const rawEntry of list.getEntries()) {
          const entry = rawEntry as LayoutShiftEntry;
          target.__exploreLayoutShifts?.push({
            startTime: entry.startTime,
            value: entry.value ?? 0,
            hadRecentInput: entry.hadRecentInput ?? false,
            sources: (entry.sources ?? []).flatMap(({ node }) =>
              node instanceof Element
                ? [{
                    tag: node.tagName,
                    id: node.id,
                    className: typeof node.className === 'string' ? node.className : '',
                  }]
                : []
            ),
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
      target.__exploreLayoutShiftSupported = true;
    } catch {
      // The assertion below reports the missing browser API as an unavailable sample.
    }
  });

  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  // Allow the post-hydration layout and any delayed font/preview work to settle.
  await page.waitForTimeout(1800);
  const evidence = await page.evaluate(() => {
    const target = window as Window & {
      __exploreLayoutShiftSupported?: boolean;
      __exploreLayoutShifts?: Array<{
        startTime: number;
        value: number;
        hadRecentInput: boolean;
        sources: Array<{ tag: string; id: string; className: string }>;
      }>;
    };
    const shifts = (target.__exploreLayoutShifts ?? []).filter((entry) => !entry.hadRecentInput);
    let sessionStart = 0;
    let previousStart = 0;
    let sessionTotal = 0;
    let cls = 0;
    for (const entry of shifts) {
      if (sessionTotal === 0 || entry.startTime - previousStart >= 1000 || entry.startTime - sessionStart >= 5000) {
        sessionStart = entry.startTime;
        sessionTotal = entry.value;
      } else {
        sessionTotal += entry.value;
      }
      previousStart = entry.startTime;
      cls = Math.max(cls, sessionTotal);
    }
    return {
      route: location.pathname,
      viewport: `${innerWidth}x${innerHeight}`,
      supported: target.__exploreLayoutShiftSupported ?? false,
      cls,
      shifts,
    };
  });
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-38/after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, `explore-cls-${testInfo.project.name}.png`) });
  const outputPath = path.join(evidenceDirectory, `explore-cls-${testInfo.project.name}.json`);
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Explore layout-shift evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(evidence.supported, 'The browser must support layout-shift measurement').toBe(true);
  expect(evidence.cls, JSON.stringify(evidence.shifts)).toBeLessThanOrEqual(0.1);
});

test('Explore keeps the first search transition stable in a narrow desktop window', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'The narrow desktop layout-shift regression runs in the production-like desktop Chromium project.'
  );

  await page.setViewportSize({ width: 500, height: 844 });
  await page.addInitScript(() => {
    type LayoutShiftEntry = PerformanceEntry & {
      value?: number;
      hadRecentInput?: boolean;
      sources?: Array<{ node?: Node | null }>;
    };
    const target = window as Window & {
      __narrowExploreShifts?: Array<{ startTime: number; value: number; sources: string[] }>;
    };
    target.__narrowExploreShifts = [];
    try {
      new PerformanceObserver((list) => {
        for (const rawEntry of list.getEntries()) {
          const entry = rawEntry as LayoutShiftEntry;
          if (entry.hadRecentInput) continue;
          target.__narrowExploreShifts?.push({
            startTime: entry.startTime,
            value: entry.value ?? 0,
            sources: (entry.sources ?? []).flatMap(({ node }) =>
              node instanceof Element
                ? [`${node.tagName.toLowerCase()}${node.id ? `#${node.id}` : ''}`]
                : []
            ),
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // The assertion below reports the missing browser API as an unavailable sample.
    }
  });

  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await page.waitForTimeout(400);
  const evidence = await page.evaluate(() => {
    const target = window as Window & {
      __narrowExploreShifts?: Array<{ startTime: number; value: number; sources: string[] }>;
    };
    const shifts = target.__narrowExploreShifts ?? [];
    let sessionStart = 0;
    let previousStart = 0;
    let sessionTotal = 0;
    let cls = 0;
    for (const entry of shifts) {
      if (sessionTotal === 0 || entry.startTime - previousStart >= 1000 || entry.startTime - sessionStart >= 5000) {
        sessionStart = entry.startTime;
        sessionTotal = entry.value;
      } else {
        sessionTotal += entry.value;
      }
      previousStart = entry.startTime;
      cls = Math.max(cls, sessionTotal);
    }
    return {
      route: location.pathname,
      viewport: `${innerWidth}x${innerHeight}`,
      cls,
      shifts,
      emptyStateVisible: document.body.innerText.includes('No matching resources found'),
    };
  });
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-38/after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, `explore-narrow-window-${testInfo.project.name}.png`) });
  const outputPath = path.join(evidenceDirectory, `explore-narrow-window-${testInfo.project.name}.json`);
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Explore narrow-window layout-shift evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(evidence.viewport).toBe('500x844');
  expect(evidence.emptyStateVisible, JSON.stringify(evidence)).toBe(false);
  expect(evidence.cls, JSON.stringify(evidence.shifts)).toBeLessThanOrEqual(0.1);
});

test('Explore replaces an empty search state cleanly when the query changes', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-chromium',
    'The narrow desktop search-transition regression runs in the production-like desktop Chromium project.'
  );

  await page.clock.install();
  await page.setViewportSize({ width: 500, height: 844 });
  await page.goto('/explore');
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Search catalogue' });
  await search.fill('no-resource-should-match-this-query');
  await expect(page.getByText('No matching resources found')).toBeVisible();

  // Freeze the debounce so this check observes the pending UI even when the
  // surrounding browser suite is under load.
  await page.clock.pauseAt(new Date(Date.now() + 60_000));
  await search.fill('onboarding');
  const searchingIndicator = page.getByText('Searching catalogue...', { exact: true });
  await expect(searchingIndicator).toBeVisible();
  await expect(page.getByText('No matching resources found')).toHaveCount(0);
  const pending = {
    status: await page.locator('[aria-live="polite"]').textContent(),
    emptyStateVisible: await page.getByText('No matching resources found').count() > 0,
    resultCountVisible: await page.getByText(/Showing \d+ of \d+ resources/).isVisible().catch(() => false),
  };
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-38/after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, `explore-query-transition-pending-${testInfo.project.name}.png`),
  });

  await page.clock.fastForward(250);
  await expect(page.getByText(/Showing 15 of 15 resources/)).toBeVisible();
  await expect(page.getByText(/Showing \d+ of \d+ resources/)).toBeVisible();
  const completed = {
    status: await page.locator('[aria-live="polite"]').textContent(),
    emptyStateVisible: await page.getByText('No matching resources found').count() > 0,
    resultCountVisible: await page.getByText(/Showing \d+ of \d+ resources/).isVisible(),
  };
  const transition = {
    viewport: '500x844',
    pending,
    completed,
    searchingIndicatorVisible: pending.status?.trim() === 'Searching catalogue...',
    transientEmptyState: pending.emptyStateVisible || pending.status?.includes('Showing 0 of 0'),
  };
  const outputPath = path.join(evidenceDirectory, `explore-query-transition-${testInfo.project.name}.json`);
  await page.screenshot({
    path: path.join(evidenceDirectory, `explore-query-transition-${testInfo.project.name}.png`),
  });
  await writeFile(outputPath, `${JSON.stringify(transition, null, 2)}\n`, 'utf8');
  await testInfo.attach('Explore query-transition evidence', {
    body: Buffer.from(JSON.stringify(transition, null, 2)),
    contentType: 'application/json',
  });

  expect(transition.viewport).toBe('500x844');
  expect(transition.searchingIndicatorVisible, JSON.stringify(transition)).toBe(true);
  expect(transition.transientEmptyState, JSON.stringify(transition)).toBe(false);
  expect(pending.resultCountVisible, JSON.stringify(transition)).toBe(false);
  expect(completed.emptyStateVisible, JSON.stringify(transition)).toBe(false);
  expect(completed.resultCountVisible, JSON.stringify(transition)).toBe(true);
});

test('Explore reserves the catalogue area before asynchronous search completes', async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'This layout-reservation regression is measured against the production-like Sites Worker.'
  );

  let releaseCatalogue!: () => void;
  const catalogueGate = new Promise<void>((resolve) => {
    releaseCatalogue = resolve;
  });
  await page.route('**/data/catalog.json', async (route) => {
    await catalogueGate;
    await route.continue();
  });

  const navigation = page.goto('/explore');
  await expect(page.getByText('Loading catalogue...', { exact: true })).toBeVisible();
  const before = await page.evaluate(() => {
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    if (!main || !footer) throw new Error('Explore shell is missing its main or footer landmark.');
    return {
      mainHeight: Math.round(main.getBoundingClientRect().height),
      footerTop: Math.round(footer.getBoundingClientRect().top),
      documentHeight: document.documentElement.scrollHeight,
    };
  });
  await page.screenshot({
    path: path.resolve(process.cwd(), `quality/evidence/step-38/after/explore-loading-${testInfo.project.name}.png`),
  });

  releaseCatalogue();
  await navigation;
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => {
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    if (!main || !footer) throw new Error('Explore shell is missing its main or footer landmark.');
    return {
      mainHeight: Math.round(main.getBoundingClientRect().height),
      footerTop: Math.round(footer.getBoundingClientRect().top),
      documentHeight: document.documentElement.scrollHeight,
    };
  });
  await page.screenshot({
    path: path.resolve(process.cwd(), `quality/evidence/step-38/after/explore-loaded-${testInfo.project.name}.png`),
  });
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    delayedRequest: '/data/catalog.json',
    before,
    after,
    documentHeightDelta: after.documentHeight - before.documentHeight,
    mainHeightDelta: after.mainHeight - before.mainHeight,
    footerTopDelta: after.footerTop - before.footerTop,
  };
  const outputPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-38/after/explore-layout-reservation-${testInfo.project.name}.json`
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Explore loading layout evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(Math.abs(evidence.documentHeightDelta), JSON.stringify(evidence)).toBeLessThanOrEqual(200);
  expect(Math.abs(evidence.footerTopDelta), JSON.stringify(evidence)).toBeLessThanOrEqual(200);
});

test('Compose does not download Workbench editor code before project handoff', async ({ page }, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'This browser-load budget is measured against the local Sites Worker adapter.'
  );

  const consoleErrors: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400)
      httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.waitForTimeout(100);
  const assets = await page.evaluate(() =>
    (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
      .filter((entry) => /\.js(?:\?|$)/.test(entry.name))
      .map((entry) => ({
        url: new URL(entry.name).pathname,
        transferBytes: entry.transferSize,
        decodedBytes: entry.decodedBodySize,
      }))
  );
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    javascriptTransferBytes: assets.reduce((total, asset) => total + asset.transferBytes, 0),
    javascriptDecodedBytes: assets.reduce((total, asset) => total + asset.decodedBytes, 0),
    assets,
    consoleErrors,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
    screenshot: `quality/evidence/step-38/after/compose-workbench-bundle-isolation-${testInfo.project.name}.png`,
  };
  const outputPath = path.resolve(
    process.cwd(),
    `quality/evidence/step-38/after/compose-workbench-bundle-isolation-${testInfo.project.name}.json`
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await page.screenshot({ path: path.resolve(process.cwd(), evidence.screenshot) });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Compose cold JavaScript transfer', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
  expect(evidence.javascriptTransferBytes).toBeLessThan(450_000);
});

async function waitForRoute(page: Page, route: string) {
  switch (route) {
    case '/':
      await expect(page.getByLabel('Product description and requirements')).toBeVisible();
      break;
    case '/explore':
      await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();
      break;
    case '/compose':
      await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
      break;
    case '/workbench':
      await expect(page.getByTestId('top-toolbar')).toBeVisible();
      break;
  }
}

test('public routes stay within browser-load, layout and runtime budgets', async ({
  browser,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith('sites-'),
    'Route measurements include opaque preview frames and require the ChatGPT Sites compatibility Worker.'
  );

  const isCrossBrowserRun =
    testInfo.project.name.includes('firefox') || testInfo.project.name.includes('webkit');
  const evidenceDirectory = path.resolve(
    process.cwd(),
    isCrossBrowserRun
      ? `quality/evidence/step-38/after/${testInfo.project.name}`
      : 'quality/evidence/step-38/after/sites-worker'
  );
  await mkdir(evidenceDirectory, { recursive: true });

  const routes = ['/', '/explore', '/compose', '/workbench'];
  const results: Array<Record<string, unknown>> = [];
  const consoleErrors: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const browserCancellations: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];

  for (const route of routes) {
    const projectUse = testInfo.project.use;
    const useViewport = projectUse.viewport as { width: number; height: number } | undefined;
    const context = await browser.newContext({
      viewport: useViewport ?? { width: 1440, height: 900 },
      isMobile: projectUse.isMobile === true,
      ...(typeof projectUse.deviceScaleFactor === 'number'
        ? { deviceScaleFactor: projectUse.deviceScaleFactor }
        : {}),
      ...(typeof projectUse.userAgent === 'string' ? { userAgent: projectUse.userAgent } : {}),
    });
    const page = await context.newPage();
    const routeScriptResponses: Array<{
      url: string;
      frameUrl: string | null;
      status: number;
      encodedResponseBodyBytes: number | null;
      contentEncoding: string | null;
    }> = [];
    const scriptResponseMeasurements: Promise<void>[] = [];
    let captureScriptResponses = true;
    let activeRoute = route;
    page.on('console', (message) => {
      if (message.type() === 'error') {
        const frames = page
          .frames()
          .map((frame) => frame.url())
          .join(', ');
        consoleErrors.push(
          `${message.text()} | route=${activeRoute} | source=${JSON.stringify(message.location())} | page=${page.url()} | frames=${frames}`
        );
      }
    });
    page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) => {
      const item = { url: request.url(), error: request.failure()?.errorText ?? null };
      if (/^(?:net::ERR_ABORTED|Load request cancelled)$/i.test(item.error ?? ''))
        browserCancellations.push(item);
      else failedRequests.push(item);
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        httpErrors.push({ url: response.url(), status: response.status() });
      if (captureScriptResponses && response.request().resourceType() === 'script') {
        scriptResponseMeasurements.push(
          (async () => {
            let frameUrl: string | null = null;
            try {
              frameUrl = response.request().frame().url();
            } catch {
              // A response can outlive its frame during navigation; keep the request evidence.
            }
            const sizes = await response.request().sizes();
            const headers = response.headers();
            routeScriptResponses.push({
              url: response.url(),
              frameUrl,
              status: response.status(),
              encodedResponseBodyBytes:
                sizes.responseBodySize > 0 ? sizes.responseBodySize : null,
              contentEncoding: headers['content-encoding'] ?? null,
            });
          })()
        );
      }
    });
    await page.addInitScript(() => {
      const samples: RuntimeSamples = { lcp: null, cls: 0, longTaskMs: 0, longTaskCount: 0 };
      Object.defineProperty(window, '__step38PerformanceSamples', {
        value: samples,
        configurable: true,
      });
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const latest = entries.at(-1);
          if (latest) samples.lcp = latest.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // The report keeps unsupported metrics null rather than inventing a value.
      }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<
            PerformanceEntry & { hadRecentInput?: boolean }
          >) {
            if (!entry.hadRecentInput)
              samples.cls += (entry as PerformanceEntry & { value?: number }).value ?? 0;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch {
        // The report keeps unsupported metrics at their neutral value.
      }
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          samples.longTaskCount += entries.length;
          samples.longTaskMs += entries.reduce((total, entry) => total + entry.duration, 0);
        }).observe({ type: 'longtask', buffered: true });
      } catch {
        // Long Tasks is supplemental and not implemented in every browser.
      }
    });
    const startedAt = Date.now();
    activeRoute = route;
    await page.goto(route);
    await waitForRoute(page, route);
    // Route readiness follows visible core content; below-the-fold preview frames may stay lazy or stream.
    await page.waitForTimeout(100);
    await Promise.all(scriptResponseMeasurements);
    captureScriptResponses = false;
    const sample = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as
        PerformanceNavigationTiming | undefined;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const windowWithSamples = window as Window & { __step38PerformanceSamples?: RuntimeSamples };
      const sample = windowWithSamples.__step38PerformanceSamples;
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null;
      const catalog = resources.filter((entry) => entry.name.endsWith('/data/catalog.json'));
      return {
        fcp,
        lcp: sample?.lcp ?? null,
        cls: sample?.cls ?? null,
        longTaskMs: sample?.longTaskMs ?? null,
        longTaskCount: sample?.longTaskCount ?? null,
        domContentLoaded: timing?.domContentLoadedEventEnd ?? null,
        load: timing?.loadEventEnd ?? null,
        resourceCount: resources.length,
        jsTransferBytes: resources
          .filter((entry) => /\.js(?:\?|$)/.test(entry.name))
          .reduce((total, entry) => total + entry.transferSize, 0),
        jsDecodedBytes: resources
          .filter((entry) => /\.js(?:\?|$)/.test(entry.name))
          .reduce((total, entry) => total + entry.decodedBodySize, 0),
        jsResourceCount: resources.filter((entry) => /\.js(?:\?|$)/.test(entry.name)).length,
        mainFrameScriptUrls: resources
          .filter((entry) => /\.js(?:\?|$)/.test(entry.name))
          .map((entry) => entry.name),
        previewFrameGeometry: Array.from(
          document.querySelectorAll<HTMLIFrameElement>('iframe[src*="/preview-content/"]'),
          (frame) => {
            const rect = frame.getBoundingClientRect();
            return {
              src: frame.src,
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              visible: rect.bottom > 0 && rect.top < window.innerHeight,
            };
          }
        ),
        viewportHeight: window.innerHeight,
        catalogRequests: catalog.map((entry) => ({
          url: entry.name,
          transferBytes: entry.transferSize,
          decodedBytes: entry.decodedBodySize,
        })),
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      };
    });
    const screenshot = path.join(
      evidenceDirectory,
      `${testInfo.project.name}-${route === '/' ? 'home' : route.slice(1)}.png`
    );
    await page.screenshot({ path: screenshot, fullPage: false });
    const readyMs = Date.now() - startedAt;
    expect(readyMs).toBeLessThan(10_000);
    let lazyPreviewScrollEvidence:
      | {
          resourceHref: string;
          scrollY: number;
          loadedPreviewVisible: boolean;
          renderedResourceScreenVisible: boolean;
          screenshot: string;
        }
      | undefined;
    if (route === '/explore') {
      expect(
        sample.previewFrameGeometry.filter((frame) => frame.top >= sample.viewportHeight),
        'Explore should defer sandboxed previews until they enter the viewport'
      ).toEqual([]);
      const nextLazyPreview = page.getByText('Preview loads when visible').first();
      await expect(nextLazyPreview).toBeVisible();
      const initialCard = nextLazyPreview.locator('xpath=../..');
      const resourceHref = await initialCard.locator('a[href^="/r/"]').first().getAttribute('href');
      expect(resourceHref).not.toBeNull();
      const stableCard = page.locator(`a[href="${resourceHref}"]`).locator('xpath=../../..');
      await page.mouse.move(sample.viewportWidth > 1000 ? sample.viewportWidth - 4 : 4, 800);
      await page.mouse.wheel(0, 1000);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      const loadedPreview = stableCard.locator('iframe[src*="/preview-content/"]');
      await expect(loadedPreview).toBeVisible();
      const renderedResourceScreen = stableCard.frameLocator('iframe').locator('.tess-screen');
      await expect(renderedResourceScreen).toBeVisible();
      const scrollScreenshot = path.join(
        evidenceDirectory,
        `${testInfo.project.name}-explore-scrolled-preview.png`
      );
      await page.screenshot({ path: scrollScreenshot, fullPage: false });
      lazyPreviewScrollEvidence = {
        resourceHref: resourceHref ?? '',
        scrollY: await page.evaluate(() => window.scrollY),
        loadedPreviewVisible: await loadedPreview.isVisible(),
        renderedResourceScreenVisible: await renderedResourceScreen.isVisible(),
        screenshot: path.relative(process.cwd(), scrollScreenshot),
      };
    }
    const uniqueScriptAssets = new Map<string, number>();
    const scriptUrls = new Set(routeScriptResponses.map((response) => response.url));
    for (const response of routeScriptResponses) {
      if (response.encodedResponseBodyBytes === null) continue;
      uniqueScriptAssets.set(
        response.url,
        Math.max(uniqueScriptAssets.get(response.url) ?? 0, response.encodedResponseBodyBytes)
      );
    }
    const mainFrameScriptUrls = new Set(sample.mainFrameScriptUrls as string[]);
    const previewOnlyScriptAssets = [...uniqueScriptAssets.entries()].filter(
      ([url]) => !mainFrameScriptUrls.has(url)
    );
    results.push({
      route,
      url: page.url(),
      viewport: page.viewportSize(),
      readyMs,
      ...sample,
      scriptResponses: routeScriptResponses,
      scriptResponseCount: routeScriptResponses.length,
      uniqueScriptAssetCount: uniqueScriptAssets.size,
      uniqueEncodedScriptBodyBytes: [...uniqueScriptAssets.values()].reduce(
        (total, bytes) => total + bytes,
        0
      ),
      uniquePreviewOnlyScriptAssetCount: previewOnlyScriptAssets.length,
      uniqueEncodedPreviewOnlyScriptBodyBytes: previewOnlyScriptAssets.reduce(
        (total, [, bytes]) => total + bytes,
        0
      ),
      scriptAssetsMissingEncodedSize: [...scriptUrls].filter(
        (url) => !uniqueScriptAssets.has(url)
      ),
      screenshot: path.relative(process.cwd(), screenshot),
      ...(lazyPreviewScrollEvidence ? { lazyPreviewScrollEvidence } : {}),
    });
    expect(sample.documentWidth).toBeLessThanOrEqual(sample.viewportWidth);
    await context.close();
  }

  const browserEngine = testInfo.project.name.includes('webkit')
    ? 'WebKit'
    : testInfo.project.name.includes('firefox')
      ? 'Firefox'
      : 'Chromium';

  const evidence = {
    capturedAt: new Date().toISOString(),
    method: `Local ChatGPT Sites compatibility Worker preview, Playwright ${browserEngine}, standard laptop CPU/network without throttling. LCP/CLS are lab PerformanceObserver samples; Long Tasks is supplemental. Not field Web Vitals or DevTools traces.`,
    browserProject: testInfo.project.name,
    results,
    runtime: {
      consoleErrors,
      uncaughtExceptions,
      failedRequests,
      browserCancellations,
      httpErrors,
    },
  };
  const output = path.join(evidenceDirectory, `${testInfo.project.name}-browser-metrics.json`);
  await writeFile(output, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('route performance and runtime samples', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  // Keep route metrics and all observed browser diagnostics even if a runtime
  // quality assertion fails below.
  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
