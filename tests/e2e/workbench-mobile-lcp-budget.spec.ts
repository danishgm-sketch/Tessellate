import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    __workbenchLcpSamples?: Array<{ startTime: number; size: number; tag: string | null; text: string }>;
  }
}

test('a first mobile Workbench visit reaches rendered employee-product content within its startup budget', async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(browserName !== 'chromium', 'The mobile network and CPU profile uses Chrome DevTools Protocol.');
  test.skip(testInfo.project.name !== 'mobile-chrome', 'This budget covers the mobile first-visit profile.');
  test.setTimeout(90_000);
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
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

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: 1_600_000 / 8,
    uploadThroughput: 750_000 / 8,
    connectionType: 'cellular3g',
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.__workbenchLcpSamples = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lcp = entry as LargestContentfulPaint;
        window.__workbenchLcpSamples?.push({
          startTime: lcp.startTime,
          size: lcp.size,
          tag: lcp.element?.tagName ?? null,
          text: lcp.element?.textContent?.slice(0, 80) ?? '',
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  const navigationStartedAt = Date.now();
  await page.goto('/workbench', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(page.getByTestId('workbench-startup-shell')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('workbench-startup-status')).toContainText(
    'Loading the example project and verified resource catalogue.',
  );
  const startupShellReadyAt = Date.now();
  // The mobile Workbench has a separate shell and intentionally does not render
  // the desktop-only workbench-shell test id. Wait for actual starter content,
  // not the retired server-rendered preview selector.
  await expect(page.getByTestId('mobile-workbench')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible({ timeout: 60_000 });
  await expect(
    page.getByTestId('mobile-workbench').getByText('A better workday starts with people.', { exact: true }),
  ).toBeVisible({ timeout: 60_000 });
  const employeeContentReadyAt = Date.now();
  await expect(page.getByRole('navigation', { name: 'Mobile Workbench' })).toBeVisible();
  const editorReadyAt = Date.now();
  const projectContentReadyAt = employeeContentReadyAt;
  await expect(page.getByTestId('resource-load-failure')).toHaveCount(0);
  await page.waitForTimeout(100);

  const pageMetrics = await page.evaluate((startedAt) => ({
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight },
    projectContentReadyMs: Date.now() - startedAt,
    lcpSamples: window.__workbenchLcpSamples ?? [],
    deferredResources: [...document.querySelectorAll<HTMLElement>('[data-testid="resource-deferred"]')]
      .map((element) => element.dataset.resourceSlug ?? ''),
    starterRequests: performance.getEntriesByType('resource')
      .filter((entry) => entry.name.includes('/data/workbench-starter.json'))
      .map((entry) => ({
        startTimeMs: Math.round(entry.startTime),
        durationMs: Math.round(entry.duration),
        transferBytes: (entry as PerformanceResourceTiming).transferSize,
      })),
    scripts: performance.getEntriesByType('resource')
      .filter((entry) => entry.name.endsWith('.js'))
      .map((entry) => {
        const script = entry as PerformanceResourceTiming;
        return {
          asset: script.name.split('/').pop(),
          transferBytes: script.transferSize,
          decodedBytes: script.decodedBodySize,
          durationMs: Math.round(script.duration),
          startTimeMs: Math.round(script.startTime),
        };
      })
      .sort((left, right) => right.transferBytes - left.transferBytes),
  }), navigationStartedAt);
  const metrics = {
    ...pageMetrics,
    startupShellReadyMs: startupShellReadyAt - navigationStartedAt,
    projectContentReadyMs: projectContentReadyAt - navigationStartedAt,
    editorReadyMs: editorReadyAt - navigationStartedAt,
    editorAfterContentMs: editorReadyAt - employeeContentReadyAt,
  };
  const lcp = metrics.lcpSamples.at(-1)?.startTime ?? null;
  const starterRequestStartedAt = metrics.starterRequests[0]?.startTimeMs ?? null;
  const evidence = { ...metrics, runtime };
  const evidenceJson = JSON.stringify(evidence, null, 2);
  await testInfo.attach('workbench-first-visit-metrics.json', {
    body: Buffer.from(evidenceJson),
    contentType: 'application/json',
  });
  const evidenceDir = process.env.TESSELLATE_EVIDENCE_DIR;
  if (evidenceDir) {
    await mkdir(evidenceDir, { recursive: true });
    await writeFile(path.join(evidenceDir, 'workbench-first-visit-mobile-390.json'), evidenceJson);
    await page.screenshot({ path: path.join(evidenceDir, 'workbench-first-visit-mobile-390.png') });
  }
  expect(lcp, 'The browser should record a largest-contentful-paint candidate for the Workbench.').not.toBeNull();
  expect(
    starterRequestStartedAt,
    'The static starter manifest should start before React island startup on a first visit.',
  ).not.toBeNull();
  expect(starterRequestStartedAt!).toBeLessThan(2_000);
  expect(
    metrics.projectContentReadyMs,
    `Project content took ${metrics.projectContentReadyMs}ms; editor controls were ready after ${metrics.editorReadyMs}ms (${metrics.editorAfterContentMs}ms after the read-only preview); LCP candidates: ${JSON.stringify(metrics.lcpSamples)}; starter requests: ${JSON.stringify(metrics.starterRequests)}; deferred: ${JSON.stringify(metrics.deferredResources)}; scripts: ${JSON.stringify(metrics.scripts)}`,
  ).toBeLessThan(5_000);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
