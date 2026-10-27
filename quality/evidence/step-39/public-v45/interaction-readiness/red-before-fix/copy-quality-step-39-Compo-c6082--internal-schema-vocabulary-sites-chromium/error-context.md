# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: copy-quality-step-39.spec.ts >> Compose explains the product plan without internal schema vocabulary
- Location: tests\e2e\copy-quality-step-39.spec.ts:14:1

# Error details

```
Error: expect(received).not.toMatch(expected)

Expected pattern: not /\b(ProductModel|ScreenGraph|LLM)\b|archetype priors|deterministically interpret/i
Received string:      "Product Composer

Describe product intent to deterministically interpret entities, derive Design DNA, and generate a multi-screen plan.

Local product composer
Describe the product. Get the interface.

Tessellate understands product architecture without requiring an LLM. Enter your product brief below to generate a validated ProductModel, ScreenGraph, and three design directions.

Load Golden Specification Briefs:
Financial Intelligence Terminal
Playful HR Platform
Luxury Travel Marketplace
Developer Observability Platform
Minimalist Personal Finance Tool
Scientific Research Environment
Product Description & Objectives
Archetype Priority (Optional Override)
Auto-Detect from Brief
B2B SaaS
AI Product
Developer Tools
Fintech
Ecommerce
Marketplace
Analytics Platform
Research & Intelligence Platform
CRM & Pipeline
ERP & Operations
Consumer Productivity
Education Product
Creator Platform
Media & Publishing
Travel & Hospitality
Real Estate
Recruitment & People Operations
Consumer Applications
Desired Feel / Adjectives
Primary Front-End Stack
React 19 + Tailwind CSS 4 (V1 Standard)
Visual Ambition
REFINED (40)
Essential
Refined
Striking
Stunning
Experimental
Structural Creativity
MODERN (35)
Familiar
Modern
Inventive
Radical
Experimental
Advanced Constraints & Devices
Loading interface intelligence…
Compose Interface System"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - link "Tessellate Mark Tessellate" [ref=e7] [cursor=pointer]:
            - /url: /
            - img "Tessellate Mark" [ref=e8]
            - generic [ref=e13]: Tessellate
          - navigation "Primary" [ref=e14]:
            - link "Explore" [ref=e15] [cursor=pointer]:
              - /url: /explore
            - link "Compose" [ref=e16] [cursor=pointer]:
              - /url: /compose
            - link "Workbench" [ref=e17] [cursor=pointer]:
              - /url: /workbench
            - link "Tools" [ref=e18] [cursor=pointer]:
              - /url: /tools
            - link "Agents" [ref=e19] [cursor=pointer]:
              - /url: /agents
            - link "Creators" [ref=e20] [cursor=pointer]:
              - /url: /creators
            - link "Docs" [ref=e21] [cursor=pointer]:
              - /url: /docs
        - generic [ref=e22]:
          - button "Search... ⌘K" [ref=e23] [cursor=pointer]:
            - generic [ref=e27]: Search...
            - generic [ref=e28]: ⌘K
          - link "GitHub Repository" [ref=e29] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - button "Local projects" [ref=e32] [cursor=pointer]
          - link "Start building" [ref=e33] [cursor=pointer]:
            - /url: /compose
  - main [ref=e34]:
    - generic [ref=e35]:
      - heading "Product Composer" [level=1] [ref=e36]
      - paragraph [ref=e37]: Describe product intent to deterministically interpret entities, derive Design DNA, and generate a multi-screen plan.
    - generic [ref=e39]:
      - generic [ref=e40]:
        - generic [ref=e41]: Local product composer
        - heading "Describe the product. Get the interface." [level=1] [ref=e45]
        - paragraph [ref=e46]: Tessellate understands product architecture without requiring an LLM. Enter your product brief below to generate a validated ProductModel, ScreenGraph, and three design directions.
        - generic [ref=e47]:
          - generic [ref=e48]: "Load Golden Specification Briefs:"
          - generic [ref=e49]:
            - button "Financial Intelligence Terminal" [ref=e50]
            - button "Playful HR Platform" [ref=e51]
            - button "Luxury Travel Marketplace" [ref=e52]
            - button "Developer Observability Platform" [ref=e53]
            - button "Minimalist Personal Finance Tool" [ref=e54]
            - button "Scientific Research Environment" [ref=e55]
      - generic [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]: Product Description & Objectives
          - textbox "Product Description & Objectives" [ref=e59]:
            - /placeholder: Describe what your product does, who it is for, and key operational capabilities...
            - text: An employee experience platform with a warm marketing site, a refined team dashboard, playful onboarding and conservative settings.
        - generic [ref=e60]:
          - generic [ref=e61]:
            - generic [ref=e62]: Archetype Priority (Optional Override)
            - combobox "Archetype Priority (Optional Override)" [ref=e63]:
              - option "Auto-Detect from Brief" [selected]
              - option "B2B SaaS"
              - option "AI Product"
              - option "Developer Tools"
              - option "Fintech"
              - option "Ecommerce"
              - option "Marketplace"
              - option "Analytics Platform"
              - option "Research & Intelligence Platform"
              - option "CRM & Pipeline"
              - option "ERP & Operations"
              - option "Consumer Productivity"
              - option "Education Product"
              - option "Creator Platform"
              - option "Media & Publishing"
              - option "Travel & Hospitality"
              - option "Real Estate"
              - option "Recruitment & People Operations"
              - option "Consumer Applications"
          - generic [ref=e64]:
            - generic [ref=e65]: Desired Feel / Adjectives
            - textbox "Desired Feel / Adjectives" [ref=e66]:
              - /placeholder: e.g. professional but playful, dense and fast
              - text: professional but playful
          - generic [ref=e67]:
            - generic [ref=e68]: Primary Front-End Stack
            - generic [ref=e69]: React 19 + Tailwind CSS 4 (V1 Standard)
        - generic [ref=e70]:
          - generic [ref=e71]:
            - generic [ref=e72]:
              - generic [ref=e73]: Visual Ambition
              - generic [ref=e74]: refined (40)
            - group "Visual Ambition" [ref=e75]:
              - button "Essential" [ref=e76]
              - button "Refined" [pressed] [ref=e77]
              - button "Striking" [ref=e78]
              - button "Stunning" [ref=e79]
              - button "Experimental" [ref=e80]
          - generic [ref=e81]:
            - generic [ref=e82]:
              - generic [ref=e83]: Structural Creativity
              - generic [ref=e84]: modern (35)
            - group "Structural Creativity" [ref=e85]:
              - button "Familiar" [ref=e86]
              - button "Modern" [pressed] [ref=e87]
              - button "Inventive" [ref=e88]
              - button "Radical" [ref=e89]
              - button "Experimental" [ref=e90]
        - button "Advanced Constraints & Devices" [ref=e92]
        - generic [ref=e95]:
          - generic [ref=e96]: Loading interface intelligence…
          - button "Compose Interface System" [disabled] [ref=e109]
  - contentinfo [ref=e112]: Tessellate Interface Intelligence Layer — Deterministic screen planning and multi-entity UI synthesis.
```

# Test source

```ts
  1   | import AxeBuilder from '@axe-core/playwright';
  2   | import { expect, test, type Page } from '@playwright/test';
  3   | import { mkdir, writeFile } from 'node:fs/promises';
  4   | import path from 'node:path';
  5   | 
  6   | type RuntimeEvidence = {
  7   |   consoleErrors: string[];
  8   |   consoleWarnings: string[];
  9   |   uncaughtExceptions: string[];
  10  |   failedRequests: Array<{ url: string; error: string | null }>;
  11  |   httpErrors: Array<{ url: string; status: number }>;
  12  | };
  13  | 
  14  | test('Compose explains the product plan without internal schema vocabulary', async ({ page }) => {
  15  |   await page.goto('/compose');
  16  |   const main = page.locator('main');
  17  |   const visibleCopy = await main.innerText();
  18  | 
> 19  |   expect(visibleCopy).not.toMatch(/\b(ProductModel|ScreenGraph|LLM)\b|archetype priors|deterministically interpret/i);
      |                           ^ Error: expect(received).not.toMatch(expected)
  20  |   await expect(main.getByText(/Describe what your product needs/i)).toBeVisible();
  21  |   await expect(main.getByText(/Start with a short brief/i)).toBeVisible();
  22  | });
  23  | 
  24  | function watchRuntime(page: Page): RuntimeEvidence {
  25  |   const runtime: RuntimeEvidence = {
  26  |     consoleErrors: [],
  27  |     consoleWarnings: [],
  28  |     uncaughtExceptions: [],
  29  |     failedRequests: [],
  30  |     httpErrors: [],
  31  |   };
  32  |   page.on('console', (message) => {
  33  |     if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  34  |     if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  35  |   });
  36  |   page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  37  |   page.on('requestfailed', (request) =>
  38  |     runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  39  |   );
  40  |   page.on('response', (response) => {
  41  |     if (response.status() >= 400)
  42  |       runtime.httpErrors.push({ url: response.url(), status: response.status() });
  43  |   });
  44  |   return runtime;
  45  | }
  46  | 
  47  | async function captureToolEvidence(
  48  |   page: Page,
  49  |   testInfo: { project: { name: string } },
  50  |   slug: string,
  51  |   responseStatus: number | null,
  52  |   runtime: RuntimeEvidence
  53  | ) {
  54  |   const viewport = testInfo.project.name.includes('mobile') ? 'mobile' : 'desktop';
  55  |   const evidenceDirectory = path.resolve(
  56  |     process.cwd(),
  57  |     `quality/evidence/step-39/after/${viewport}`
  58  |   );
  59  |   await mkdir(evidenceDirectory, { recursive: true });
  60  |   const screenshot = path.join(evidenceDirectory, `${slug}.png`);
  61  |   await page.screenshot({ path: screenshot, fullPage: viewport === 'desktop' });
  62  | 
  63  |   page.removeAllListeners('console');
  64  |   const accessibility = await new AxeBuilder({ page })
  65  |     .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  66  |     .analyze();
  67  |   const seriousAccessibilityViolations = accessibility.violations.filter((violation) =>
  68  |     ['serious', 'critical'].includes(violation.impact ?? '')
  69  |   );
  70  |   const layout = await page.evaluate(() => ({
  71  |     viewportWidth: document.documentElement.clientWidth,
  72  |     documentWidth: document.documentElement.scrollWidth,
  73  |     horizontalOverflow:
  74  |       document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  75  |   }));
  76  |   const evidence = {
  77  |     capturedAt: new Date().toISOString(),
  78  |     route: page.url(),
  79  |     viewport: page.viewportSize(),
  80  |     status: responseStatus,
  81  |     layout,
  82  |     visibleText: await page.locator('main').innerText(),
  83  |     accessibility: {
  84  |       totalViolations: accessibility.violations.length,
  85  |       seriousOrCritical: seriousAccessibilityViolations.map(({ id, impact, description }) => ({
  86  |         id,
  87  |         impact,
  88  |         description,
  89  |       })),
  90  |     },
  91  |     runtime,
  92  |     screenshot,
  93  |   };
  94  |   await writeFile(
  95  |     path.join(evidenceDirectory, `${slug}.json`),
  96  |     `${JSON.stringify(evidence, null, 2)}\n`,
  97  |     'utf8'
  98  |   );
  99  |   expect(seriousAccessibilityViolations).toEqual([]);
  100 |   expect(layout.horizontalOverflow).toBe(false);
  101 |   expect(runtime.consoleErrors).toEqual([]);
  102 |   expect(runtime.uncaughtExceptions).toEqual([]);
  103 |   expect(runtime.failedRequests).toEqual([]);
  104 |   expect(runtime.httpErrors).toEqual([]);
  105 |   return evidence;
  106 | }
  107 | 
  108 | async function waitForHydration(page: Page) {
  109 |   await page.locator('astro-island[client="load"]').evaluateAll(async (islands) => {
  110 |     await Promise.all(
  111 |       islands.map((island) => {
  112 |         if (!island.hasAttribute('ssr')) return Promise.resolve();
  113 |         return new Promise<void>((resolve) =>
  114 |           island.addEventListener('astro:hydrate', resolve, { once: true })
  115 |         );
  116 |       })
  117 |     );
  118 |   });
  119 | }
```