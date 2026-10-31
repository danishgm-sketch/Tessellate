import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('Inline AI Rewrite stays within its 360px Sites resource preview at every tone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'sites-chromium', 'The resource detail iframe layout is certified in the Sites Worker project.');

  await page.setViewportSize({ width: 360, height: 844 });
  const runtime = {
    consoleErrors: [] as string[],
    pageErrors: [] as string[],
    failedRequests: [] as Array<Record<string, string | boolean>>,
    httpErrors: [] as string[],
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    let frameUrl = '';
    let parentFrameIsMain = false;
    try {
      const frameHandle = request.frame();
      frameUrl = frameHandle.url();
      parentFrameIsMain = frameHandle.parentFrame() === page.mainFrame();
    } catch {
      // The browser can detach a frame before Playwright resolves its URL.
    }
    runtime.failedRequests.push({
      method: request.method(),
      url: request.url(),
      error: request.failure()?.errorText ?? 'unknown',
      resourceType: request.resourceType(),
      navigation: request.isNavigationRequest(),
      frameUrl,
      parentFrameIsMain,
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`);
  });

  const route = '/resources/inline-ai-rewrite/';
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  const preview = page.locator('iframe[title$=" live preview"]');
  await expect(preview).toHaveCount(1);
  const mobileViewport = page.getByRole('button', { name: 'Mobile (360px)' });
  await mobileViewport.click();

  const frame = page.frameLocator('iframe[title$=" live preview"]');
  await expect(frame.locator('body')).toContainText('Preview only. These fixed examples do not send an AI request');
  await expect(frame.getByText('Ctrl + Shift + R', { exact: true })).toHaveCount(0);
  const results: Array<{ tone: string; clientWidth: number; scrollWidth: number }> = [];
  const evidenceDirectory = path.resolve(process.env.INLINE_REWRITE_EVIDENCE_DIR ?? 'test-results/inline-ai-rewrite-responsive');
  await mkdir(evidenceDirectory, { recursive: true });

  for (const tone of ['concise', 'professional', 'energetic']) {
    const toneButton = frame.getByRole('button', { name: tone, exact: true });
    await toneButton.click();
    await expect(toneButton).toHaveAttribute('aria-pressed', 'true');
    const dimensions = await frame.locator('html').evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    results.push({ tone, ...dimensions });
    await preview.screenshot({ path: path.join(evidenceDirectory, `inline-ai-rewrite-360-${tone}.png`) });
  }

  await writeFile(path.join(evidenceDirectory, 'inline-ai-rewrite-360.json'), `${JSON.stringify({
    capturedAt: new Date().toISOString(),
    route: new URL(route, page.url()).toString(),
    viewport: '360x844',
    status: response?.status() ?? null,
    previewViewport: results[0]?.clientWidth ?? null,
    measurements: results,
    runtime,
  }, null, 2)}\n`, 'utf8');

  const overflows = results.filter((result) => result.scrollWidth > result.clientWidth + 1);
  expect(overflows, JSON.stringify({ results, runtime }, null, 2)).toEqual([]);
});
