import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const EVIDENCE = path.resolve(process.cwd(), 'quality/evidence/step-43/long-session');
const MUTATIONS = Number(process.env.TESS_STEP43_MUTATIONS ?? 240);
const IDLE_BETWEEN_MUTATIONS_MS = Number(process.env.TESS_STEP43_IDLE_MS ?? 15_000);
const MIN_DURATION_MS = Number(process.env.TESS_STEP43_MIN_DURATION_MS ?? 60 * 60_000);

async function openIntent(page: Page) {
  await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });
  const inspector = page.getByTestId('right-inspector');
  await expect(inspector).toBeVisible();
  await inspector.getByRole('button', { name: 'Intent', exact: true }).click();
  const slider = page.getByRole('slider', { name: 'Visual Ambition' });
  await expect(slider).toBeVisible();
  return { inspector, slider };
}

async function writeProgress(progress: Record<string, unknown>) {
  await mkdir(EVIDENCE, { recursive: true });
  const destination = path.join(EVIDENCE, 'progress.json');
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, `${JSON.stringify(progress, null, 2)}\n`, 'utf8');
  const { rename } = await import('node:fs/promises');
  await rename(temporary, destination);
}

test('Workbench stays stable through a one-hour, 240-mutation editing session', async ({ page }, testInfo) => {
  test.setTimeout(Number(process.env.TESS_STEP43_TIMEOUT_MS ?? 67 * 60_000));
  expect(testInfo.project.name).toBe('sites-chromium');

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
    if (response.status() >= 400)
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });

  await mkdir(EVIDENCE, { recursive: true });
  await page.goto('/showcase/showcase-playful-hr');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  let { inspector, slider } = await openIntent(page);
  const projectUrl = page.url();
  const startedAt = new Date().toISOString();
  const initialValue = Number(await slider.inputValue());
  const checkpoints: Array<Record<string, unknown>> = [];
  let modeSwitches = 0;
  const reloadedAt: number[] = [];

  await page.screenshot({ path: path.join(EVIDENCE, 'session-start.png'), fullPage: false });
  await writeProgress({
    status: 'running',
    startedAt,
    projectUrl,
    viewport: page.viewportSize(),
    plannedMutations: MUTATIONS,
    idleBetweenMutationsMs: IDLE_BETWEEN_MUTATIONS_MS,
    completedMutations: 0,
    initialVisualAmbition: initialValue,
    checkpoints,
    modeSwitches,
    reloads: reloadedAt,
    runtime,
  });

  for (let mutation = 1; mutation <= MUTATIONS; mutation += 1) {
    const currentValue = Number(await slider.inputValue());
    const mutationStartedAt = Date.now();
    const nextValue = currentValue >= 90 ? 0 : currentValue + 1;
    await slider.press(currentValue >= 90 ? 'Home' : 'ArrowRight');
    await expect(slider).toHaveValue(String(nextValue));

    if (mutation % 40 === 0) {
      const toolbar = page.getByTestId('top-toolbar');
      for (const mode of ['style', 'motion', 'content', 'audit']) {
        const modeButton = toolbar.getByRole('button', { name: mode, exact: true });
        await modeButton.click();
        await expect(modeButton).toHaveAttribute('aria-pressed', 'true');
        modeSwitches += 1;
      }
      const structureButton = toolbar.getByRole('button', { name: 'structure', exact: true });
      await structureButton.click();
      await expect(structureButton).toHaveAttribute('aria-pressed', 'true');
      inspector = page.getByTestId('right-inspector');
      await expect(inspector.getByRole('button', { name: 'Intent', exact: true })).toBeVisible();
      slider = page.getByRole('slider', { name: 'Visual Ambition' });
      await expect(slider).toHaveValue(String(nextValue));
    }

    if (mutation % 80 === 0) {
      await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved', {
        timeout: 20_000,
      });
      await page.reload();
      await expect(page.getByTestId('top-toolbar')).toBeVisible({ timeout: 30_000 });
      ({ inspector, slider } = await openIntent(page));
      await expect(slider).toHaveValue(String(nextValue));
      reloadedAt.push(mutation);
    }

    const mutationMs = Date.now() - mutationStartedAt;
    if (mutation % 10 === 0) {
      await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved', {
        timeout: 20_000,
      });
      const memory = await page.evaluate(() => {
        const value = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory
          ?.usedJSHeapSize;
        return typeof value === 'number' ? value : null;
      });
      const checkpoint = {
        mutation,
        visualAmbition: Number(await slider.inputValue()),
        mutationMs,
        usedHeapBytes: memory,
        saved: true,
        timestamp: new Date().toISOString(),
      };
      checkpoints.push(checkpoint);
      if (mutation % 40 === 0) {
        await page.screenshot({
          path: path.join(EVIDENCE, `session-${String(mutation).padStart(3, '0')}.png`),
          fullPage: false,
        });
      }
      await writeProgress({
        status: 'running',
        startedAt,
        projectUrl,
        viewport: page.viewportSize(),
        plannedMutations: MUTATIONS,
        idleBetweenMutationsMs: IDLE_BETWEEN_MUTATIONS_MS,
        completedMutations: mutation,
        initialVisualAmbition: initialValue,
        checkpoints,
        modeSwitches,
        reloads: reloadedAt,
        runtime,
      });
    }

    await page.waitForTimeout(IDLE_BETWEEN_MUTATIONS_MS);
  }

  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved', {
    timeout: 20_000,
  });
  const endedAt = new Date().toISOString();
  const elapsedMs = Date.parse(endedAt) - Date.parse(startedAt);
  const finalValue = Number(await slider.inputValue());
  const finalHeapBytes = await page.evaluate(() => {
    const value = (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory
      ?.usedJSHeapSize;
    return typeof value === 'number' ? value : null;
  });
  await page.screenshot({ path: path.join(EVIDENCE, 'session-final.png'), fullPage: false });
  await writeProgress({
    status: 'passed',
    startedAt,
    endedAt,
    elapsedMs,
    projectUrl,
    viewport: page.viewportSize(),
    plannedMutations: MUTATIONS,
    completedMutations: MUTATIONS,
    idleBetweenMutationsMs: IDLE_BETWEEN_MUTATIONS_MS,
    initialVisualAmbition: initialValue,
    finalVisualAmbition: finalValue,
    checkpoints,
    modeSwitches,
    reloads: reloadedAt,
    finalHeapBytes,
    runtime,
  });

  expect(elapsedMs).toBeGreaterThanOrEqual(MIN_DURATION_MS);
  expect(checkpoints).toHaveLength(Math.floor(MUTATIONS / 10));
  expect(modeSwitches).toBe(Math.floor(MUTATIONS / 40) * 4);
  expect(reloadedAt).toEqual(
    Array.from({ length: Math.floor(MUTATIONS / 80) }, (_, index) => (index + 1) * 80)
  );
  expect(finalValue).toBeGreaterThanOrEqual(0);
  expect(finalValue).toBeLessThanOrEqual(100);
  if (finalHeapBytes !== null) expect(finalHeapBytes).toBeLessThan(512 * 1024 * 1024);
  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
