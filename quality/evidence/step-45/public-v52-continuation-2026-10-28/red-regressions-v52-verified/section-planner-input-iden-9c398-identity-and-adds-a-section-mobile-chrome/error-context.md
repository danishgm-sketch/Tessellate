# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: section-planner-input-identity.spec.ts >> custom section title has a stable field identity and adds a section
- Location: tests\e2e\section-planner-input-identity.spec.ts:3:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('textbox', { name: 'Custom section title' })
Expected: "custom-section-title"
Received: ""
Timeout:  5000ms

Call log:
  - Expect "toHaveAttribute" getByRole('textbox', { name: 'Custom section title' }) with timeout 5000ms
  - waiting for getByRole('textbox', { name: 'Custom section title' })
    5 × locator resolved to <input disabled value="" type="text" aria-label="Custom section title" placeholder="Add custom section title (e.g. Migration Guide)..." class="flex-1 text-xs px-3 py-2 rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] focus:bg-white outline-none"/>
      - unexpected value "null"
    9 × locator resolved to <input value="" type="text" aria-label="Custom section title" placeholder="Add custom section title (e.g. Migration Guide)..." class="flex-1 text-xs px-3 py-2 rounded-xl border border-[#D9D6CF] bg-[#FAF9F6] focus:bg-white outline-none"/>
      - unexpected value "null"

```

```yaml
- textbox "Custom section title":
  - /placeholder: Add custom section title (e.g. Migration Guide)...
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('custom section title has a stable field identity and adds a section', async ({ page }) => {
  4  |   await page.goto('/tools/section-planner/');
  5  | 
  6  |   const title = page.getByRole('textbox', { name: 'Custom section title' });
> 7  |   await expect(title).toHaveAttribute('id', 'custom-section-title');
     |                       ^ Error: expect(locator).toHaveAttribute(expected) failed
  8  |   await expect(title).toHaveAttribute('name', 'customSectionTitle');
  9  |   await title.fill('Employee timeline');
  10 |   await page.getByRole('button', { name: 'Add', exact: true }).click();
  11 | 
  12 |   await expect(page.getByRole('heading', { name: 'Page Sections (9 active)' })).toBeVisible();
  13 |   await expect(page.getByText('Employee timeline', { exact: true })).toBeVisible();
  14 | });
  15 | 
```