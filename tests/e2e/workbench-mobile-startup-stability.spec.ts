import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

test('mobile Workbench preserves its full-height startup shell while slow project data loads', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'sites-mobile-chromium',
    'This regression verifies the deployed mobile startup handoff in the Sites Chromium profile.'
  );

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const uncaughtExceptions: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  const delayedStartupChunks: string[] = [];
  const delayedStarterRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  await page.route('**/_astro/WorkbenchShell.*.js', async (route) => {
    const response = await route.fetch();
    delayedStartupChunks.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.fulfill({ response });
  });
  await page.route('**/data/workbench-starter.json', async (route) => {
    const response = await route.fetch();
    delayedStarterRequests.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    await route.fulfill({ response });
  });

  await page.addInitScript(() => {
    type ShiftEntry = PerformanceEntry & { value?: number; hadRecentInput?: boolean };
    const target = window as Window & { __workbenchStartupShifts?: Array<{ startTime: number; value: number }> };
    target.__workbenchStartupShifts = [];
    try {
      new PerformanceObserver((list) => {
        for (const raw of list.getEntries()) {
          const entry = raw as ShiftEntry;
          if (!entry.hadRecentInput) {
            target.__workbenchStartupShifts?.push({ startTime: entry.startTime, value: entry.value ?? 0 });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {
      // The final evidence reports zero if this browser does not expose LayoutShift entries.
    }
  });

  const startedAt = Date.now();
  await page.goto('/workbench', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Preparing your local workspace' })).toBeVisible();
  await expect(page.locator('[data-testid="workbench-startup-shell"][data-client-rendered="true"]')).toBeVisible();
  await expect(page.locator('main[aria-busy="true"]')).toBeVisible();
  await expect(page.getByTestId('workbench-startup-status')).toContainText('Loading the example project');

  const startupHeight = await page.locator('main[aria-busy="true"]').evaluate((element) => element.getBoundingClientRect().height);
  expect(startupHeight, 'the mobile startup shell should reserve the full viewport height').toBeGreaterThanOrEqual(viewport!.height - 2);
  const evidenceDirectory = process.env.TESS_AUDIT_EVIDENCE_DIR
    ? path.resolve(process.env.TESS_AUDIT_EVIDENCE_DIR)
    : path.resolve(process.cwd(), 'audit/evidence/step-48/deployed-v74');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-aud456-startup-before.png`), fullPage: true });

  await expect(page.getByTestId('mobile-workbench')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(500);
  const shifts = await page.evaluate(() => {
    const target = window as Window & { __workbenchStartupShifts?: Array<{ startTime: number; value: number }> };
    let sessionStart = 0;
    let previousStart = 0;
    let sessionTotal = 0;
    let cls = 0;
    for (const entry of target.__workbenchStartupShifts ?? []) {
      if (sessionTotal === 0 || entry.startTime - previousStart >= 1000 || entry.startTime - sessionStart >= 5000) {
        sessionStart = entry.startTime;
        sessionTotal = entry.value;
      } else {
        sessionTotal += entry.value;
      }
      previousStart = entry.startTime;
      cls = Math.max(cls, sessionTotal);
    }
    return { cls, shifts: target.__workbenchStartupShifts ?? [] };
  });
  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.screenshot({ path: path.join(evidenceDirectory, `${testInfo.project.name}-aud456-startup-after.png`), fullPage: true });

  const evidence = {
    capturedAt: new Date().toISOString(),
    route: page.url(),
    viewport,
    delayedStartupChunks,
    delayedStarterRequests,
    startupDelayMs: 700,
    starterDataDelayMs: 1800,
    startupHeight,
    mobileWorkbenchRenderedInMs: Date.now() - startedAt,
    documentWidth,
    ...shifts,
    consoleErrors,
    consoleWarnings,
    uncaughtExceptions,
    failedRequests,
    httpErrors,
    screenshots: [
      path.relative(process.cwd(), path.join(evidenceDirectory, `${testInfo.project.name}-aud456-startup-before.png`)).replaceAll('\\', '/'),
      path.relative(process.cwd(), path.join(evidenceDirectory, `${testInfo.project.name}-aud456-startup-after.png`)).replaceAll('\\', '/'),
    ],
  };
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}-aud456-startup.json`), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  await testInfo.attach('Mobile Workbench deployed startup evidence', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  expect(delayedStartupChunks, JSON.stringify(evidence)).toHaveLength(1);
  expect(delayedStarterRequests, JSON.stringify(evidence)).toHaveLength(1);
  expect(documentWidth).toBe(viewport!.width);
  expect(shifts.cls, JSON.stringify(shifts)).toBeLessThanOrEqual(0.1);
  expect(consoleErrors).toEqual([]);
  expect(uncaughtExceptions).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
});
