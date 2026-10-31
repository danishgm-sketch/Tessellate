# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: live-mobile-filter-hydration-v25.spec.ts >> v25 mobile Explore keeps Filters unavailable until its handlers are ready
- Location: audit\evidence\v25\live-mobile-filter-hydration-v25.spec.ts:5:1

# Error details

```
Error: Filters must be disabled until the client handlers are ready.

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "Tessellate" [ref=e7] [cursor=pointer]:
          - /url: /
        - generic [ref=e14]:
          - button "Search resources (Press Command-K)" [disabled] [ref=e15]
          - link "Start building" [ref=e19] [cursor=pointer]:
            - /url: /workbench
            - generic [ref=e20]: Build
          - button "Toggle menu" [disabled] [ref=e23]
  - main [ref=e25]:
    - generic [ref=e26]:
      - heading "Explore Resource Library" [level=1] [ref=e27]
      - paragraph [ref=e28]: Discover vetted UI primitives, blocks, and design systems composed for modern products.
    - generic [ref=e30]:
      - generic [ref=e31]:
        - textbox "Search catalogue" [disabled] [ref=e35]:
          - /placeholder: Search by component, outcome, style or vibe…
        - status [ref=e36]: Preparing search…
        - button "Filters" [ref=e37]
      - generic [ref=e40]:
        - generic [ref=e41]: "Try:"
        - button "Bloomberg-style analytics" [ref=e45]
        - button "cinematic product hero" [ref=e46]
        - button "AI research sidebar" [ref=e47]
        - button "mobile navigation" [ref=e48]
        - button "onboarding" [ref=e49]
        - button "billing overview" [ref=e50]
        - button "data table" [ref=e51]
        - button "empty state" [ref=e52]
      - generic [ref=e54]:
        - generic [ref=e55]: Loading catalogue...
        - heading "Catalogue results" [level=2] [ref=e57]
        - status "Loading catalogue resources" [ref=e58]
  - contentinfo [ref=e609]: Tessellate Interface Intelligence Layer — Free, open resource vocabulary under permissive licenses.
```

# Test source

```ts
  1  | import { mkdir, writeFile } from 'node:fs/promises';
  2  | import path from 'node:path';
  3  | import { expect, test } from '@playwright/test';
  4  | 
  5  | test('v25 mobile Explore keeps Filters unavailable until its handlers are ready', async ({ page }) => {
  6  |   await page.route('**/_astro/ExploreView.*.js', (route) => route.abort('blockedbyclient'));
  7  | 
  8  |   const consoleErrors: string[] = [];
  9  |   const failedRequests: string[] = [];
  10 |   page.on('console', (message) => {
  11 |     if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT')) {
  12 |       consoleErrors.push(message.text());
  13 |     }
  14 |   });
  15 |   page.on('requestfailed', (request) => {
  16 |     if (!request.url().includes('/_astro/ExploreView.')) failedRequests.push(request.url());
  17 |   });
  18 | 
  19 |   const response = await page.goto('/explore/', { waitUntil: 'domcontentloaded' });
  20 |   expect(response?.status()).toBe(200);
  21 |   const filterButton = page.getByRole('button', { name: 'Filters', exact: true });
  22 |   await expect(filterButton).toBeVisible();
  23 |   await expect(page.getByTestId('explore-search-hydration-status')).toContainText('Preparing search');
  24 | 
  25 |   const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/v25/mobile-filter-hydration');
  26 |   await mkdir(evidenceDir, { recursive: true });
  27 |   const screenshot = path.join(evidenceDir, 'filters-enabled-before-hydration-390x844.png');
  28 |   await page.screenshot({ path: screenshot, animations: 'disabled' });
  29 |   const buttonState = await filterButton.evaluate((button) => ({
  30 |     disabled: (button as HTMLButtonElement).disabled,
  31 |     ariaDescribedBy: button.getAttribute('aria-describedby'),
  32 |     expanded: button.getAttribute('aria-expanded'),
  33 |     text: button.textContent?.trim(),
  34 |   }));
  35 |   const report = {
  36 |     site: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site',
  37 |     version: '25',
  38 |     route: '/explore/',
  39 |     viewport: page.viewportSize(),
  40 |     status: response?.status(),
  41 |     buttonState,
  42 |     blockedHydrationRequest: 'The Explore React island was intentionally blocked to inspect pre-hydration controls.',
  43 |     consoleErrors,
  44 |     failedRequests,
  45 |     screenshot,
  46 |   };
  47 |   await writeFile(path.join(evidenceDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  48 | 
> 49 |   expect(buttonState.disabled, 'Filters must be disabled until the client handlers are ready.').toBe(true);
     |                                                                                                 ^ Error: Filters must be disabled until the client handlers are ready.
  50 |   expect(buttonState.ariaDescribedBy).toBe('explore-search-hydration-status');
  51 |   expect(failedRequests).toEqual([]);
  52 | });
  53 | 
```