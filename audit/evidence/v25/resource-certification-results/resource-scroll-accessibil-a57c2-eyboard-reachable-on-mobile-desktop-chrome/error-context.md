# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: resource-scroll-accessibility.spec.ts >> scrollable Gold resource content is keyboard reachable on mobile
- Location: tests\e2e\resource-scroll-accessibility.spec.ts:10:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[aria-label="Error code sample"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('[aria-label="Error code sample"]') with timeout 5000ms
  - waiting for locator('[aria-label="Error code sample"]')

```

```yaml
- iframe
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { mkdirSync } from 'node:fs';
  3   | import path from 'node:path';
  4   | 
  5   | const accessibilityEvidenceDirectory = path.resolve(
  6   |   process.cwd(),
  7   |   'quality/evidence/step-14/accessibility',
  8   | );
  9   | 
  10  | test('scrollable Gold resource content is keyboard reachable on mobile', async ({ page }) => {
  11  |   await page.setViewportSize({ width: 390, height: 844 });
  12  | 
  13  |   const scrollableContent = [
  14  |     {
  15  |       slug: 'error-state',
  16  |       selector: '[aria-label="Error code sample"]',
  17  |     },
  18  |     {
  19  |       slug: 'feature-matrix',
  20  |       selector: '[aria-label="Example capability matrix comparison table"]',
  21  |     },
  22  |     {
  23  |       slug: 'three-pane-app-shell',
  24  |       selector: '[aria-label="Workspace canvas"]',
  25  |     },
  26  |   ];
  27  | 
  28  |   for (const { slug, selector } of scrollableContent) {
  29  |     await page.goto(`/preview-content/?resource=${slug}&variant=expressive&theme=dark`);
  30  |     const region = page.locator(selector);
  31  | 
> 32  |     await expect(region).toBeVisible();
      |                          ^ Error: expect(locator).toBeVisible() failed
  33  |     await expect(region).toHaveAttribute('tabindex', '0');
  34  |     await region.focus();
  35  |     await expect(region).toBeFocused();
  36  |   }
  37  | });
  38  | 
  39  | test('three-pane app shell exposes every pane without horizontal clipping on mobile', async ({ page }) => {
  40  |   await page.setViewportSize({ width: 390, height: 844 });
  41  |   await page.goto('/preview-content/?resource=three-pane-app-shell&variant=expressive&theme=dark');
  42  | 
  43  |   const canvas = page.getByRole('region', { name: 'Workspace canvas' });
  44  |   const shell = canvas.locator('..');
  45  |   const layout = await shell.evaluate((element) => {
  46  |     const bounds = element.getBoundingClientRect();
  47  | 
  48  |     return {
  49  |       direction: getComputedStyle(element).flexDirection,
  50  |       clientWidth: element.clientWidth,
  51  |       scrollWidth: element.scrollWidth,
  52  |       panes: Array.from(element.children).map((pane) => {
  53  |         const paneBounds = pane.getBoundingClientRect();
  54  |         return {
  55  |           left: paneBounds.left - bounds.left,
  56  |           right: paneBounds.right - bounds.left,
  57  |           width: paneBounds.width,
  58  |         };
  59  |       }),
  60  |     };
  61  |   });
  62  | 
  63  |   expect(layout.direction).toBe('column');
  64  |   expect(layout.panes).toHaveLength(3);
  65  |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  66  |   expect(layout.panes.every((pane) => pane.width > 0 && pane.left >= 0 && pane.right <= layout.clientWidth + 1)).toBe(
  67  |     true,
  68  |   );
  69  |   mkdirSync(accessibilityEvidenceDirectory, { recursive: true });
  70  |   await page.screenshot({
  71  |     path: path.join(accessibilityEvidenceDirectory, 'three-pane-shell-mobile-390-after.png'),
  72  |     fullPage: true,
  73  |   });
  74  | });
  75  | 
  76  | test('three-pane app shell retains its three-column workspace on desktop', async ({ page }) => {
  77  |   await page.setViewportSize({ width: 1440, height: 900 });
  78  |   await page.goto('/preview-content/?resource=three-pane-app-shell&variant=expressive&theme=dark');
  79  | 
  80  |   const canvas = page.getByRole('region', { name: 'Workspace canvas' });
  81  |   const shell = canvas.locator('..');
  82  |   const layout = await shell.evaluate((element) => ({
  83  |     direction: getComputedStyle(element).flexDirection,
  84  |     clientWidth: element.clientWidth,
  85  |     scrollWidth: element.scrollWidth,
  86  |     panes: Array.from(element.children).map((pane) => {
  87  |       const bounds = pane.getBoundingClientRect();
  88  |       return { width: bounds.width };
  89  |     }),
  90  |   }));
  91  | 
  92  |   expect(layout.direction).toBe('row');
  93  |   expect(layout.panes).toHaveLength(3);
  94  |   expect(layout.panes.every((pane) => pane.width > 0)).toBe(true);
  95  |   expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  96  |   mkdirSync(accessibilityEvidenceDirectory, { recursive: true });
  97  |   await page.screenshot({
  98  |     path: path.join(accessibilityEvidenceDirectory, 'three-pane-shell-desktop-1440-after.png'),
  99  |     fullPage: true,
  100 |   });
  101 | });
  102 | 
```