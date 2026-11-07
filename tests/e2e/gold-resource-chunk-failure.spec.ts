import { expect, test } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ProjectManifestSchema, type ProjectManifest, type ProjectNode } from '../../packages/schemas/src/index.js';

function flattenNodes(node: ProjectNode): ProjectNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

test('a Gold resource chunk failure stays local and preserves the Workbench project', async ({ page }, testInfo) => {
  test.setTimeout(30_000);
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  let interceptedChunks = 0;
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', (request) => failedRequests.push(`${request.url()} ${request.failure()?.errorText ?? ''}`));
  page.on('response', (response) => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
  await page.route('**/_astro/editorial-hero.*.js', async (route) => {
    interceptedChunks += 1;
    await route.fulfill({
      status: 503,
      contentType: 'text/javascript',
      body: 'throw new Error("injected resource chunk failure");',
    });
  });

  await page.goto('/workbench');
  await expect(page.getByRole('heading', { name: 'Workbench: Example employee workspace' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('resource-load-failure').filter({ hasText: 'editorial-hero' })).toBeVisible();
  await expect(page.getByText('The project reference is preserved. Reload the page to retry this resource.')).toBeVisible();
  if (testInfo.project.name.includes('mobile')) {
    const deferredFeature = page.locator('[data-testid="resource-deferred"][data-resource-slug="feature-bento"]');
    await expect(deferredFeature).toBeVisible();
    await deferredFeature.scrollIntoViewIfNeeded();
  }
  await expect(page.getByRole('heading', { name: 'Made for everyday employee experiences' })).toBeVisible();
  expect(interceptedChunks).toBe(1);

  await page.getByTestId('export-button').click();
  const pendingDownload = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await pendingDownload;
  const manifestPath = testInfo.outputPath('chunk-failure-project.tess.json');
  await download.saveAs(manifestPath);
  const manifest = ProjectManifestSchema.parse(JSON.parse(await readFile(manifestPath, 'utf8'))) as ProjectManifest;
  const heroNode = manifest.screens.flatMap((screen) => flattenNodes(screen.rootNode)).find((node) => node.resourceRef?.slug === 'editorial-hero');
  expect(heroNode?.resourceRef?.slug).toBe('editorial-hero');

  const expectedChunkError = httpErrors.filter((request) => request.status === 503 && request.url.includes('/_astro/editorial-hero.'));
  expect(expectedChunkError).toHaveLength(1);
  expect(httpErrors.filter((request) => !expectedChunkError.includes(request))).toEqual([]);
  expect(failedRequests.filter((request) => !request.includes('/_astro/editorial-hero.'))).toEqual([]);
  const unexpectedConsoleErrors = consoleErrors.filter(
    (message) =>
      !message.includes('503 (Service Unavailable)') &&
      !(message.includes('Failed to fetch dynamically imported module') && message.includes('/_astro/editorial-hero.')),
  );
  expect(unexpectedConsoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-39/resource-chunk-failure');
  await mkdir(evidenceDirectory, { recursive: true });
  const screenshot = `${testInfo.project.name}-after.png`;
  const evidence = {
    capturedAt: new Date().toISOString(),
    route: new URL(page.url()).pathname,
    viewport: page.viewportSize(),
    result: 'Workbench remains interactive; the expected console errors are limited to the injected resource failure, its local error boundary preserves the canonical reference, and no unexpected console, network, or page errors occur.',
    projectId: manifest.id,
    preservedResource: { nodeId: heroNode?.id, slug: heroNode?.resourceRef?.slug },
    injectedFailures: expectedChunkError,
    otherHttpErrors: httpErrors.filter((request) => !expectedChunkError.includes(request)),
    failedRequests,
    consoleErrors,
    unexpectedConsoleErrors,
    pageErrors,
    screenshot,
  };
  await page.screenshot({ path: path.join(evidenceDirectory, screenshot), fullPage: true });
  await writeFile(path.join(evidenceDirectory, `${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
});
