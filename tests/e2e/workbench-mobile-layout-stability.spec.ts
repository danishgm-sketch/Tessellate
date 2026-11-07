import { expect, test } from '@playwright/test';

test('Mobile Workbench avoids visible layout shifts while Gold resources load slowly', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const delayedChunks: string[] = [];
  await page.route(/\/_astro\/(minimal-top-nav|split-product-hero|feature-bento|cta-minimal|footer-product)\.[^/]+\.js(?:\?.*)?$/, async (route) => {
    delayedChunks.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.addInitScript(() => {
    const observedWindow = window as typeof window & {
      __tessellateLayoutShifts?: Array<{
        value: number;
        startTime: number;
        sources: Array<Record<string, unknown>>;
      }>;
    };
    observedWindow.__tessellateLayoutShifts = [];
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
        if (!entry.hadRecentInput && typeof entry.value === 'number') {
          observedWindow.__tessellateLayoutShifts?.push({
            value: entry.value,
            startTime: entry.startTime,
            sources: (entry.sources ?? []).map((source) => ({
              tag: source.node?.tagName ?? null,
              id: source.node?.id ?? null,
              className: typeof source.node?.className === 'string' ? source.node.className.slice(0, 160) : null,
              text: source.node?.textContent?.trim().slice(0, 100) ?? null,
              previousRect: source.previousRect,
              currentRect: source.currentRect,
            })),
          });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
  });

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  await expect.poll(async () => (
    await page.getByTestId('workbench-mobile-resource-preload-status').count()
    + await page.getByTestId('resource-loading').count()
  ), { message: 'the Workbench should show its stable screen-loading state while resources are delayed' }).toBeGreaterThan(0);
  expect(delayedChunks.length, 'the fixture should delay the Workbench screen resources').toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath('workbench-mobile-resource-loading-before.png') });
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.getByTestId('resource-loading')).toHaveCount(0);
  await page.waitForTimeout(250);

  const readLayoutShifts = () => page.evaluate(() => {
    const shifts = (window as typeof window & {
      __tessellateLayoutShifts?: Array<{ value: number; startTime: number; sources: Array<Record<string, unknown>> }>;
    }).__tessellateLayoutShifts ?? [];
    return shifts;
  });
  const firstLoadLayoutShifts = await readLayoutShifts();
  const firstLoadCumulativeLayoutShift = firstLoadLayoutShifts.reduce((total, entry) => total + entry.value, 0);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.getByTestId('resource-loading')).toHaveCount(0);
  await page.waitForTimeout(250);
  const reloadLayoutShifts = await readLayoutShifts();
  const reloadCumulativeLayoutShift = reloadLayoutShifts.reduce((total, entry) => total + entry.value, 0);
  console.log(JSON.stringify({
    project: testInfo.project.name,
    viewport: page.viewportSize(),
    userAgent: await page.evaluate(() => navigator.userAgent),
    firstLoadCumulativeLayoutShift,
    reloadCumulativeLayoutShift,
    delayedChunks,
  }));
  await testInfo.attach(`layout-stability-${testInfo.project.name}.json`, {
    body: Buffer.from(JSON.stringify({
      viewport: page.viewportSize(),
      userAgent: await page.evaluate(() => navigator.userAgent),
      firstLoadLayoutShifts,
      firstLoadCumulativeLayoutShift,
      reloadLayoutShifts,
      delayedChunks,
    }, null, 2)),
    contentType: 'application/json',
  });

  expect(firstLoadCumulativeLayoutShift, 'first-run mobile Workbench should stay within the CLS 0.1 quality threshold').toBeLessThan(0.1);
  expect(reloadCumulativeLayoutShift, 'reloading a saved mobile Workbench project should stay within the CLS 0.1 quality threshold').toBeLessThan(0.1);
});
