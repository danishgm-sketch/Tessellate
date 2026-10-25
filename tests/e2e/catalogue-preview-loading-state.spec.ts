import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('Explore identifies a visible resource preview while its isolated frame loads', async (
  { page },
  testInfo
) => {
  await page.route('**/preview-content/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1800));
    await route.continue();
  });

  await page.goto('/explore/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();

  const firstPreview = page.locator('main iframe[title$="actual preview"]').first();
  await expect(firstPreview).toBeVisible();
  const previewSurface = firstPreview.locator('xpath=..');

  await expect(previewSurface).toHaveAttribute('aria-busy', 'true');
  await expect(previewSurface.getByRole('status')).toHaveText('Loading preview…');
  const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-38/after');
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDirectory, `explore-preview-loading-${testInfo.project.name}.png`),
  });
  await expect(previewSurface.getByRole('status')).toHaveCount(0, { timeout: 10_000 });
  await expect(previewSurface).toHaveAttribute('aria-busy', 'false');
  await page.screenshot({
    path: path.join(evidenceDirectory, `explore-preview-loaded-${testInfo.project.name}.png`),
  });
});

test('Explore explains a preview error and offers the resource page', async ({ page }) => {
  await page.clock.install();
  await page.route('**/preview-content/**', async (route) => route.abort());
  await page.goto('/explore/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Showing 50 of 324 resources', { exact: true })).toBeVisible();

  const firstPreview = page.locator('main iframe[title$="actual preview"]').first();
  await expect(firstPreview).toBeVisible();
  const previewSurface = firstPreview.locator('xpath=..');
  await expect(previewSurface).toHaveAttribute('aria-busy', 'true');
  await expect(previewSurface.getByRole('status')).toHaveText('Loading preview…');
  await page.clock.fastForward(15_000);
  await expect(previewSurface.getByRole('alert')).toContainText('Preview unavailable.');
  await expect(previewSurface.getByRole('link', { name: 'Open the resource page' })).toHaveAttribute(
    'href',
    /\/r\//
  );
  await expect(previewSurface).toHaveAttribute('aria-busy', 'false');
});
