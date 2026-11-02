import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type LayoutShiftRecord = {
  value: number;
  startTime: number;
  sources: Array<{
    tag: string | null;
    className: string | null;
    text: string | null;
    previousRect: DOMRectReadOnly | null;
    currentRect: DOMRectReadOnly | null;
  }>;
};

function calculateCumulativeLayoutShift(entries: LayoutShiftRecord[]): number {
  const shifts = entries
    .filter((entry) => Number.isFinite(entry.value) && entry.value > 0)
    .sort((left, right) => left.startTime - right.startTime);

  let sessionStart = 0;
  let previousShift = 0;
  let sessionValue = 0;
  let maxSessionValue = 0;

  for (const shift of shifts) {
    if (sessionValue === 0 || shift.startTime - previousShift > 1_000 || shift.startTime - sessionStart > 5_000) {
      sessionStart = shift.startTime;
      sessionValue = shift.value;
    } else {
      sessionValue += shift.value;
    }
    previousShift = shift.startTime;
    maxSessionValue = Math.max(maxSessionValue, sessionValue);
  }

  return maxSessionValue;
}

test('mobile Workbench keeps CLS below 0.1 while employee screen resources load on a cold device', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-mobile-chromium', 'This regression targets the production-like mobile Workbench.');

  await page.setViewportSize({ width: 412, height: 823 });
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
  page.on('requestfailed', (request) => failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText ?? null,
  }));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  const delayedResources: string[] = [];
  let injectGoldResourceFailure = false;
  let failedGoldResource: string | null = null;
  await page.route(/\/_astro\/(minimal-top-nav|editorial-hero|split-product-hero|feature-bento|cta-minimal|footer-product)\.[^/]+\.js(?:\?.*)?$/, async (route) => {
    const resourcePath = new URL(route.request().url()).pathname;
    if (injectGoldResourceFailure && resourcePath.includes('/editorial-hero.')) {
      failedGoldResource = resourcePath;
      await route.abort();
      return;
    }
    delayedResources.push(resourcePath);
    await new Promise((resolve) => setTimeout(resolve, 1_800));
    await route.continue();
  });

  await page.addInitScript(() => {
    const observedWindow = window as typeof window & { __tessellateColdLoadShifts?: LayoutShiftRecord[] };
    observedWindow.__tessellateColdLoadShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
        sources?: Array<{
          node?: Element;
          previousRect?: DOMRectReadOnly;
          currentRect?: DOMRectReadOnly;
        }>;
      }>) {
        if (entry.hadRecentInput || typeof entry.value !== 'number') continue;
        observedWindow.__tessellateColdLoadShifts?.push({
          value: entry.value,
          startTime: entry.startTime,
          sources: (entry.sources ?? []).map((source) => ({
            tag: source.node?.tagName ?? null,
            className: typeof source.node?.className === 'string' ? source.node.className : null,
            text: source.node?.textContent?.trim().slice(0, 120) ?? null,
            previousRect: source.previousRect ?? null,
            currentRect: source.currentRect ?? null,
          })),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
  });

  const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-48/aud452-mobile-cold-resource-load');
  await mkdir(evidenceDirectory, { recursive: true });

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  await expect.poll(() => delayedResources.length, { message: 'the employee screen Gold resource chunks should be delayed' }).toBeGreaterThan(0);
  await expect.poll(async () => (
    await page.getByTestId('workbench-mobile-resource-preload-status').count()
    + await page.getByTestId('resource-loading').count()
  ), { message: 'the Workbench should show an honest loading state while resources are delayed' }).toBeGreaterThan(0);
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-cold-load-before.png`), fullPage: true });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.getByTestId('resource-loading')).toHaveCount(0);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-cold-load-after.png`), fullPage: true });

  const firstLoad = await page.evaluate(() => (window as typeof window & {
    __tessellateColdLoadShifts?: LayoutShiftRecord[];
  }).__tessellateColdLoadShifts ?? []);
  const firstLoadCls = calculateCumulativeLayoutShift(firstLoad);

  const firstLoadDelayedResources = [...delayedResources];
  delayedResources.length = 0;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  await expect.poll(() => delayedResources.length, { message: 'a reload should resolve the screen resources from a fresh module graph' }).toBeGreaterThan(0);
  await expect.poll(async () => (
    await page.getByTestId('workbench-mobile-resource-preload-status').count()
    + await page.getByTestId('resource-loading').count()
  ), { message: 'a reload should keep the mobile loading state truthful' }).toBeGreaterThan(0);
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-reload-before.png`), fullPage: true });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.getByTestId('resource-loading')).toHaveCount(0);
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-reload-after.png`), fullPage: true });

  const reload = await page.evaluate(() => (window as typeof window & {
    __tessellateColdLoadShifts?: LayoutShiftRecord[];
  }).__tessellateColdLoadShifts ?? []);
  const reloadCls = calculateCumulativeLayoutShift(reload);
  const normalReloadDelayedResources = [...delayedResources];
  const normalRuntime = {
    consoleErrors: [...consoleErrors],
    consoleWarnings: [...consoleWarnings],
    uncaughtExceptions: [...uncaughtExceptions],
    failedRequests: [...failedRequests],
    httpErrors: [...httpErrors],
  };

  injectGoldResourceFailure = true;
  failedGoldResource = null;
  delayedResources.length = 0;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  await expect.poll(() => failedGoldResource, { message: 'the fault injection should fail the editorial hero chunk' }).toBeTruthy();
  await expect.poll(async () => (
    await page.getByTestId('workbench-mobile-resource-preload-status').count()
    + await page.getByTestId('resource-loading').count()
  ), { message: 'the Workbench should show a truthful state while other resources are still pending' }).toBeGreaterThan(0);
  await page.screenshot({ path: path.join(evidenceDirectory, testInfo.project.name + '-failure-before.png'), fullPage: true });
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('resource-load-failure')).toContainText('Could not load resource: editorial-hero');
  await expect(page.getByTestId('resource-loading')).toHaveCount(0);
  await page.waitForTimeout(250);
  const faultShifts = await page.evaluate(() => (window as typeof window & {
    __tessellateColdLoadShifts?: LayoutShiftRecord[];
  }).__tessellateColdLoadShifts ?? []);
  const faultCls = calculateCumulativeLayoutShift(faultShifts);
  await page.screenshot({ path: path.join(evidenceDirectory, testInfo.project.name + '-failure-after.png'), fullPage: true });
  const faultRuntime = {
    failedGoldResource,
    delayedResources: [...delayedResources],
    consoleErrors: consoleErrors.slice(normalRuntime.consoleErrors.length),
    consoleWarnings: consoleWarnings.slice(normalRuntime.consoleWarnings.length),
    uncaughtExceptions: uncaughtExceptions.slice(normalRuntime.uncaughtExceptions.length),
    failedRequests: failedRequests.slice(normalRuntime.failedRequests.length),
    httpErrors: httpErrors.slice(normalRuntime.httpErrors.length),
  };

  const result = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport: page.viewportSize(),
    cpuThrottlingRate: 4,
    projectHeading: await page.locator('[data-testid="mobile-workbench"] h1.sr-only').innerText(),
    delayedResources: { firstLoad: firstLoadDelayedResources, reload: normalReloadDelayedResources },
    firstLoad: { cls: firstLoadCls, shifts: firstLoad },
    reload: { cls: reloadCls, shifts: reload },
    normalRuntime,
    faultInjection: { cls: faultCls, shifts: faultShifts, ...faultRuntime },
  };
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}-cold-load.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    firstLoadCls,
    reloadCls,
    faultCls,
    delayedResources: { firstLoad: firstLoadDelayedResources, normalReload: normalReloadDelayedResources, faultReload: faultRuntime.delayedResources },
  }));
  await testInfo.attach(`cold-load-layout-shifts-${testInfo.project.name}.json`, {
    body: Buffer.from(JSON.stringify(result, null, 2)),
    contentType: 'application/json',
  });

  expect(normalRuntime.consoleErrors).toEqual([]);
  expect(normalRuntime.consoleWarnings).toEqual([]);
  expect(normalRuntime.uncaughtExceptions).toEqual([]);
  expect(normalRuntime.failedRequests).toEqual([]);
  expect(normalRuntime.httpErrors).toEqual([]);
  expect(firstLoadCls, 'first cold mobile Workbench load must meet the CLS 0.1 budget').toBeLessThan(0.1);
  expect(reloadCls, 'reloaded mobile Workbench must meet the CLS 0.1 budget').toBeLessThan(0.1);
  expect(faultCls, 'one failed and four delayed Gold chunks must not trigger a later layout shift').toBeLessThan(0.1);
  expect(faultRuntime.failedRequests).toHaveLength(1);
  expect(faultRuntime.uncaughtExceptions).toEqual([]);
});
