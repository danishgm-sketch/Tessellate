# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: header-accessible-name.spec.ts >> search trigger includes its visible label in its accessible name on /compose
- Location: tests\e2e\header-accessible-name.spec.ts:6:3

# Error details

```
Error: expect(locator).toHaveAccessibleName(expected) failed

Locator: getByRole('banner').getByRole('button', { name: /search/i }).first()
Expected pattern: /Search.*⌘K/
Received string:  "Search resources (Press Command-K)"
Timeout: 5000ms

Call log:
  - Expect "toHaveAccessibleName" getByRole('banner').getByRole('button', { name: /search/i }).first() with timeout 5000ms
  - waiting for getByRole('banner').getByRole('button', { name: /search/i }).first()
    14 × locator resolved to <button type="button" aria-label="Search resources (Press Command-K)" class="flex items-center gap-2 min-h-[32px] rounded-lg border border-[#D9D6CF] bg-[#FFFFFF] px-3 py-1.5 text-xs text-[#62666F] hover:border-[#C7C3BA] hover:text-[#111217] dark:border-[#272C34] dark:bg-[#111419] dark:text-[#A8AFBA] dark:hover:border-[#353C46] cursor-pointer">…</button>
       - unexpected value "Search resources (Press Command-K)"

```

```yaml
- button "Search resources (Press Command-K)":
  - img
  - text: Search... ⌘K
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | const routes = ['/', '/explore', '/compose', '/r/advanced-data-table'];
  4  |
  5  | for (const route of routes) {
  6  |   test(`search trigger includes its visible label in its accessible name on ${route}`, async ({
  7  |     page,
  8  |   }) => {
  9  |     await page.goto(route);
  10 |     const search = page.getByRole('banner').getByRole('button', { name: /search/i }).first();
  11 |     await expect(search).toBeVisible();
> 12 |     await expect(search).toHaveAccessibleName(/Search.*⌘K/);
     |                          ^ Error: expect(locator).toHaveAccessibleName(expected) failed
  13 |   });
  14 | }
  15 |
```