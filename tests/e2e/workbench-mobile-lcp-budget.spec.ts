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
  // The mobile Workbench has a separate shell and intentionally does not render
  // the desktop-only workbench-shell test id.
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.', exact: true }).first()).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(100);

  const metrics = await page.evaluate((startedAt) => ({
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight },
    projectContentReadyMs: Date.now() - startedAt,
    lcpSamples: window.__workbenchLcpSamples ?? [],
    scripts: performance.getEntriesByType('resource')
      .filter((entry) => entry.name.endsWith('.js'))
      .map((entry) => {
        const script = entry as PerformanceResourceTiming;
        return {
          asset: script.name.split('/').pop(),
          transferBytes: script.transferSize,
          decodedBytes: script.decodedBodySize,
          durationMs: Math.round(script.duration),
        };
      })
      .sort((left, right) => right.transferBytes - left.transferBytes),
  }), navigationStartedAt);
  const lcp = metrics.lcpSamples.at(-1)?.startTime ?? null;
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
    metrics.projectContentReadyMs,
    `Project content took ${metrics.projectContentReadyMs}ms; LCP candidates: ${JSON.stringify(metrics.lcpSamples)}; scripts: ${JSON.stringify(metrics.scripts)}`,
  ).toBeLessThan(5_000);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
