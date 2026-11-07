import { expect, test } from '@playwright/test';

test('homepage exposes its preset briefs as a named group', async ({ page }) => {
  await page.goto('/');
  const presets = page.getByRole('group', { name: 'Preset briefs' });
  await expect(presets).toBeVisible();
  await expect(presets.getByRole('button')).toHaveCount(5);
});

test('homepage exposes the manifest example through its visible label', async ({ page }) => {
  await page.goto('/');
  const exampleLabel = page.getByText('ProjectManifest excerpt', { exact: true });
  await exampleLabel.scrollIntoViewIfNeeded();
  const example = page.getByRole('group', { name: 'ProjectManifest excerpt' });
  await expect(example).toBeVisible();
  await expect(example).toHaveAttribute('role', 'group');
  expect(await example.evaluate((element) => element.tagName)).toBe('PRE');
});

test('mobile Explore filter button controls the opened dialog and Escape restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explore');
  const filters = page.getByRole('button', { name: 'Filters', exact: true });
  await expect(filters).toBeEnabled();
  await expect(filters).not.toHaveAttribute('aria-controls');
  await filters.click();
  await expect(filters).toHaveAttribute('aria-expanded', 'true');
  const dialogId = await filters.getAttribute('aria-controls');
  expect(dialogId).toBe('explore-mobile-filter-dialog');
  const dialog = page.locator(`[id="${dialogId}"]`);
  await expect(dialog).toHaveRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(filters).toBeFocused();
  await expect(filters).not.toHaveAttribute('aria-controls');
});
