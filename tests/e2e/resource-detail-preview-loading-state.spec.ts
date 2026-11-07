import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('resource detail keeps a visible loading state until its isolated resource is ready', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('sites-'), 'Opaque preview readiness is verified in the Sites Worker profile.');

  let releasePreview!: () => void;
  let previewRequestStarted!: () => void;
  const previewGate = new Promise<void>((resolve) => { releasePreview = resolve; });
  const previewRequest = new Promise<void>((resolve) => { previewRequestStarted = resolve; });
  await page.route('**/preview-content/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('resource') === 'app-sidebar-expanded') {
      previewRequestStarted();
      await previewGate;
    }
    await route.continue();
  });

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-45/resource-detail-preview-loading');
  mkdirSync(evidenceDir, { recursive: true });
  try {
    await page.goto('/r/app-sidebar-expanded/', { waitUntil: 'domcontentloaded' });
    const iframe = page.locator('iframe[title="App Sidebar Expanded live preview"]');
    await expect(iframe).toBeVisible();
    await previewRequest;

    const previewSurface = iframe.locator('xpath=..');
    await expect(previewSurface).toHaveAttribute('aria-busy', 'true');
    await expect(previewSurface.getByRole('status')).toHaveText('Loading isolated preview…');
    await page.screenshot({ path: path.join(evidenceDir, `loading-${testInfo.project.name}.png`) });

    releasePreview();
    await expect(page.frameLocator('iframe[title="App Sidebar Expanded live preview"]').locator('.tess-screen'))
      .toHaveCount(1, { timeout: 20_000 });
    await expect(previewSurface).toHaveAttribute('aria-busy', 'false');
    await expect(previewSurface.getByRole('status')).toHaveCount(0);
    await page.screenshot({ path: path.join(evidenceDir, `loaded-${testInfo.project.name}.png`) });

    writeFileSync(path.join(evidenceDir, `${testInfo.project.name}.json`), JSON.stringify({
      route: '/r/app-sidebar-expanded/',
      project: testInfo.project.name,
      result: 'passed',
      delayedRequest: '/preview-content/?resource=app-sidebar-expanded',
      loadingState: 'aria-busy=true with visible Loading isolated preview status until the selected resource renders',
      screenshots: [
        `quality/evidence/step-45/resource-detail-preview-loading/loading-${testInfo.project.name}.png`,
        `quality/evidence/step-45/resource-detail-preview-loading/loaded-${testInfo.project.name}.png`,
      ],
    }, null, 2));
  } finally {
    releasePreview();
  }
});

test('resource detail replaces loading with the isolated renderer error when a resource chunk fails', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('sites-'), 'Opaque preview failure recovery is verified in the Sites Worker profile.');

  await page.route('**/_astro/app-sidebar-expanded*.js', (route) => route.abort());
  await page.goto('/r/app-sidebar-expanded/', { waitUntil: 'domcontentloaded' });

  const preview = page.frameLocator('iframe[title="App Sidebar Expanded live preview"]');
  const previewSurface = page.locator('iframe[title="App Sidebar Expanded live preview"]').locator('xpath=..');
  await expect(preview.getByRole('alert')).toContainText('Preview failed:', { timeout: 20_000 });
  await expect(previewSurface).toHaveAttribute('aria-busy', 'false');
  await expect(previewSurface.getByRole('status')).toHaveCount(0);

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-45/resource-detail-preview-loading');
  mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({ path: path.join(evidenceDir, `error-${testInfo.project.name}.png`) });
});
