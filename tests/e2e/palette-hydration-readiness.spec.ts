import { expect, test } from '@playwright/test';

test('Palette Studio exposes its controls only after the React island is interactive', async ({ page }) => {
  let releaseBundle!: () => void;
  let bundleRequested!: () => void;
  const holdBundle = new Promise<void>((resolve) => {
    releaseBundle = resolve;
  });
  const bundleRequestedPromise = new Promise<void>((resolve) => {
    bundleRequested = resolve;
  });

  await page.route(/\/_astro\/PaletteStudio\.[^/]+\.js$/, async (route) => {
    bundleRequested();
    await holdBundle;
    await route.continue();
  });

  await page.goto('/tools/palette', { waitUntil: 'commit' });
  await bundleRequestedPromise;

  const loading = page.getByRole('status').filter({ hasText: 'Loading Palette Studio controls' });
  const preset = page.getByRole('button', { name: 'Pure Monochrome' });

  await expect(loading).toBeVisible();
  await expect(preset).toHaveCount(0);

  releaseBundle();
  await expect(preset).toBeVisible();
  await preset.click();
  await expect(preset).toHaveAttribute('aria-pressed', 'true');
});
