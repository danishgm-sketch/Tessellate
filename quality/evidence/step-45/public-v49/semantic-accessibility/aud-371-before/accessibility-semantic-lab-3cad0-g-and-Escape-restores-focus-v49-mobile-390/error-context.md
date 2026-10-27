# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility-semantic-labels-step45.spec.ts >> mobile Explore filter button controls the opened dialog and Escape restores focus
- Location: tests\e2e\accessibility-semantic-labels-step45.spec.ts:20:1

# Error details

```
Error: expect(locator).not.toHaveAttribute() failed

Locator:  getByRole('button', { name: 'Filters', exact: true })
Expected: not have attribute
Received: have attribute
Timeout:  5000ms

Call log:
  - Expect "not toHaveAttribute" getByRole('button', { name: 'Filters', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Filters', exact: true })
    14 × locator resolved to <button type="button" aria-expanded="false" aria-haspopup="dialog" aria-controls="explore-mobile-filter-dialog" class="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--tess-hairline,#D9D6CF)] bg-white text-xs font-medium text-[var(--tess-ink,#111217)] shadow-2xs disabled:cursor-wait disabled:border-dashed disabled:bg-[var(--tess-canvas,#F4F2ED)] disabled:text-[var(--tess-ink-secondary,#62666F)] disabled:shadow-none disabled:opacity-100">…</button>
       - unexpected value "attribute present"

```

```yaml
- button "Filters":
  - img
  - text: Filters
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('homepage exposes its preset briefs as a named group', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   const presets = page.getByRole('group', { name: 'Preset briefs' });
  6  |   await expect(presets).toBeVisible();
  7  |   await expect(presets.getByRole('button')).toHaveCount(5);
  8  | });
  9  | 
  10 | test('homepage exposes the manifest example through its visible label', async ({ page }) => {
  11 |   await page.goto('/');
  12 |   const exampleLabel = page.getByText('ProjectManifest excerpt', { exact: true });
  13 |   await exampleLabel.scrollIntoViewIfNeeded();
  14 |   const example = page.getByRole('group', { name: 'ProjectManifest excerpt' });
  15 |   await expect(example).toBeVisible();
  16 |   await expect(example).toHaveAttribute('role', 'group');
  17 |   expect(await example.evaluate((element) => element.tagName)).toBe('PRE');
  18 | });
  19 | 
  20 | test('mobile Explore filter button controls the opened dialog and Escape restores focus', async ({ page }) => {
  21 |   await page.setViewportSize({ width: 390, height: 844 });
  22 |   await page.goto('/explore');
  23 |   const filters = page.getByRole('button', { name: 'Filters', exact: true });
  24 |   await expect(filters).toBeEnabled();
> 25 |   await expect(filters).not.toHaveAttribute('aria-controls');
     |                             ^ Error: expect(locator).not.toHaveAttribute() failed
  26 |   await filters.click();
  27 |   await expect(filters).toHaveAttribute('aria-expanded', 'true');
  28 |   const dialogId = await filters.getAttribute('aria-controls');
  29 |   expect(dialogId).toBe('explore-mobile-filter-dialog');
  30 |   const dialog = page.locator(`[id="${dialogId}"]`);
  31 |   await expect(dialog).toHaveRole('dialog');
  32 |   await expect(dialog).toBeVisible();
  33 |   await page.keyboard.press('Escape');
  34 |   await expect(dialog).toHaveCount(0);
  35 |   await expect(filters).toBeFocused();
  36 |   await expect(filters).not.toHaveAttribute('aria-controls');
  37 | });
  38 | 
```