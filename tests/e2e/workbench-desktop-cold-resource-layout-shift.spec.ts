import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Shift = { value: number; startTime: number; sources: Array<Record<string, unknown>> };

function maxLayoutShiftSession(shifts: Shift[]): number {
  let sessionStart = 0;
  let previousShift = 0;
  let sessionValue = 0;
  let maximum = 0;

  for (const shift of shifts.filter((item) => item.value > 0).sort((a, b) => a.startTime - b.startTime)) {
    if (sessionValue === 0 || shift.startTime - previousShift > 1_000 || shift.startTime - sessionStart > 5_000) {
      sessionStart = shift.startTime;
      sessionValue = shift.value;
    } else {
      sessionValue += shift.value;
    }
    previousShift = shift.startTime;
    maximum = Math.max(maximum, sessionValue);
  }

  return maximum;
}

test('a clean desktop Workbench first visit stays within the CLS 0.05 budget', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'This regression targets the production-like desktop Sites Workbench.');
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });

  const consoleErrors: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText ?? null,
  }));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });
  await page.addInitScript(() => {
    const target = window as Window & { __tessellateWorkbenchShifts?: Shift[] };
    target.__tessellateWorkbenchShifts = [];
    new PerformanceObserver((list) => {
      for (const raw of list.getEntries()) {
        const entry = raw as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
          sources?: Array<{ node?: Element; previousRect?: DOMRectReadOnly; currentRect?: DOMRectReadOnly }>;
        };
        if (entry.hadRecentInput || typeof entry.value !== 'number') continue;
        target.__tessellateWorkbenchShifts?.push({
          value: entry.value,
          startTime: entry.startTime,
          sources: (entry.sources ?? []).map((source) => ({
            tag: source.node?.tagName ?? null,
            className: typeof source.node?.className === 'string' ? source.node.className : null,
            text: source.node?.textContent?.trim().slice(0, 100) ?? null,
            previousRect: source.previousRect ?? null,
            currentRect: source.currentRect ?? null,
          })),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
  });

  const response = await page.goto('/workbench', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('workbench-startup-shell')).toBeVisible();
  await expect(page.getByTestId('workbench-shell')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('heading', { name: /Workbench: Example employee workspace|Workbench: Master-Detail Explorer/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.getByTestId('resource-load-failure')).toHaveCount(0);
  await page.waitForTimeout(300);

  const shifts = await page.evaluate(() => (window as Window & {
    __tessellateWorkbenchShifts?: Shift[];
  }).__tessellateWorkbenchShifts ?? []);
  const cls = maxLayoutShiftSession(shifts);
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    projectName: await page.getByRole('heading', { name: /^Workbench:/ }).innerText(),
    cls,
    shifts,
    consoleErrors,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
  };
  console.log(`Clean first-visit Workbench layout evidence: ${JSON.stringify(evidence)}`);
  const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-47/AUD-512/local-after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: testInfo.outputPath('workbench-desktop-first-visit.png') });
  await page.screenshot({ path: path.join(evidenceDirectory, 'workbench-desktop-first-visit-1440x900.png') });
  await writeFile(
    path.join(evidenceDirectory, 'workbench-desktop-first-visit-1440x900.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  await testInfo.attach('desktop-workbench-first-visit-layout-shifts.json', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
  expect(cls, JSON.stringify(evidence)).toBeLessThan(0.05);
});

test('desktop Workbench keeps its initial screen within the CLS 0.1 budget while Gold resources load', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'This regression targets the production-like desktop Sites Workbench.');
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });

  const delayedResources: string[] = [];
  const consoleErrors: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) => failedRequests.push({
    url: request.url(),
    error: request.failure()?.errorText ?? null,
  }));
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.route(/\/_astro\/(minimal-top-nav|editorial-hero|feature-bento|cta-minimal|footer-product)\.[^/]+\.js(?:\?.*)?$/, async (route) => {
    delayedResources.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => setTimeout(resolve, 1_800));
    await route.continue();
  });

  await page.addInitScript(() => {
    const target = window as Window & { __tessellateWorkbenchShifts?: Shift[] };
    target.__tessellateWorkbenchShifts = [];
    new PerformanceObserver((list) => {
      for (const raw of list.getEntries()) {
        const entry = raw as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
          sources?: Array<{ node?: Element; previousRect?: DOMRectReadOnly; currentRect?: DOMRectReadOnly }>;
        };
        if (entry.hadRecentInput || typeof entry.value !== 'number') continue;
        target.__tessellateWorkbenchShifts?.push({
          value: entry.value,
          startTime: entry.startTime,
          sources: (entry.sources ?? []).map((source) => ({
            tag: source.node?.tagName ?? null,
            className: typeof source.node?.className === 'string' ? source.node.className : null,
            text: source.node?.textContent?.trim().slice(0, 100) ?? null,
            previousRect: source.previousRect ?? null,
            currentRect: source.currentRect ?? null,
          })),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
  });

  const response = await page.goto('/workbench#screen-marketing-home', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId('workbench-shell')).toBeVisible();
  await expect.poll(() => delayedResources.length, { message: 'the employee screen Gold resource chunks should be delayed' }).toBeGreaterThan(0);
  await expect(page.getByTestId('workbench-resource-preload-status')).toBeVisible();
  const evidenceDirectory = path.resolve(process.cwd(), 'audit/evidence/step-47/AUD-512/local-after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: testInfo.outputPath('workbench-desktop-cold-load-before.png') });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'workbench-desktop-delayed-resources-before-1440x900.png'),
  });

  await expect(page.getByRole('heading', { name: 'A better workday starts with people.' })).toBeVisible();
  await expect(page.getByTestId('resource-load-failure')).toHaveCount(0);
  await expect(page.getByTestId('resource-loading')).toHaveCount(0);
  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('workbench-desktop-cold-load-after.png') });
  await page.screenshot({
    path: path.join(evidenceDirectory, 'workbench-desktop-delayed-resources-after-1440x900.png'),
  });

  const shifts = await page.evaluate(() => (window as Window & {
    __tessellateWorkbenchShifts?: Shift[];
  }).__tessellateWorkbenchShifts ?? []);
  const cls = maxLayoutShiftSession(shifts);
  const evidence = {
    route: page.url(),
    viewport: page.viewportSize(),
    delayedResources,
    cls,
    shifts,
    consoleErrors,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
  };
  await writeFile(
    path.join(evidenceDirectory, 'workbench-desktop-delayed-resources-1440x900.json'),
    `${JSON.stringify(evidence, null, 2)}\n`,
  );
  await testInfo.attach('desktop-workbench-cold-resource-layout-shifts.json', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
  expect(cls, JSON.stringify(evidence)).toBeLessThan(0.1);
});
