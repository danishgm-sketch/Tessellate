# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-hardening-step-36.spec.ts >> major product surfaces fit and retain their primary content at every required width
- Location: tests/e2e/responsive-hardening-step-36.spec.ts:53:1

# Error details

```
Error: [
  {
    "route": "/docs/cli/",
    "url": "http://127.0.0.1:4323/docs/cli/",
    "viewport": {
      "width": 360,
      "height": 800
    },
    "status": 200,
    "layout": {
      "viewportWidth": 360,
      "documentWidth": 389,
      "main": {
        "left": 0,
        "right": 360,
        "width": 360
      },
      "mainContentWidth": 360,
      "mainScrollWidth": 389,
      "header": {
        "left": 0,
        "right": 360,
        "width": 360
      },
      "horizontalScrollContainers": [
        {
          "tag": "pre",
          "label": null,
          "scrollWidth": 309,
          "clientWidth": 278
        }
      ]
    },
    "runtime": {
      "consoleErrors": [],
      "pageErrors": [],
      "failedRequests": [],
      "httpErrors": []
    },
    "screenshot": "360-docs-cli-.png"
  }
]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 43

- Array []
+ Array [
+   Object {
+     "layout": Object {
+       "documentWidth": 389,
+       "header": Object {
+         "left": 0,
+         "right": 360,
+         "width": 360,
+       },
+       "horizontalScrollContainers": Array [
+         Object {
+           "clientWidth": 278,
+           "label": null,
+           "scrollWidth": 309,
+           "tag": "pre",
+           "testId": undefined,
+         },
+       ],
+       "main": Object {
+         "left": 0,
+         "right": 360,
+         "width": 360,
+       },
+       "mainContentWidth": 360,
+       "mainScrollWidth": 389,
+       "viewportWidth": 360,
+     },
+     "route": "/docs/cli/",
+     "runtime": Object {
+       "consoleErrors": Array [],
+       "failedRequests": Array [],
+       "httpErrors": Array [],
+       "pageErrors": Array [],
+     },
+     "screenshot": "360-docs-cli-.png",
+     "status": 200,
+     "url": "http://127.0.0.1:4323/docs/cli/",
+     "viewport": Object {
+       "height": 800,
+       "width": 360,
+     },
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f156e1]:
  - generic [ref=f156e2]:
    - link "Skip to content" [ref=f156e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=f156e4]:
      - generic [ref=f156e5]:
        - generic [ref=f156e6]:
          - link "Tessellate" [ref=f156e7] [cursor=pointer]:
            - /url: /
          - navigation [ref=f156e14]:
            - link "Explore" [ref=f156e15] [cursor=pointer]:
              - /url: /explore
            - link "Showcases" [ref=f156e16] [cursor=pointer]:
              - /url: /showcases
            - link "Compose" [ref=f156e17] [cursor=pointer]:
              - /url: /compose
            - link "Workbench" [ref=f156e18] [cursor=pointer]:
              - /url: /workbench
            - link "Tools" [ref=f156e19] [cursor=pointer]:
              - /url: /tools
            - link "Agents" [ref=f156e20] [cursor=pointer]:
              - /url: /agents
            - link "Creators" [ref=f156e21] [cursor=pointer]:
              - /url: /creators
            - link "Docs" [ref=f156e22] [cursor=pointer]:
              - /url: /docs
        - generic [ref=f156e23]:
          - button "Search resources (Press Command-K)" [ref=f156e24]:
            - generic [ref=f156e28]: Search
            - generic [ref=f156e29]: ⌘K
          - link "GitHub Repository" [ref=f156e30] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - link "Local projects" [ref=f156e34] [cursor=pointer]:
            - /url: /workbench
          - link "Start building" [ref=f156e35] [cursor=pointer]:
            - /url: /workbench
  - main [ref=f156e39]:
    - generic [ref=f156e40]:
      - paragraph [ref=f156e41]: Open interface commons
      - heading "About Tessellate" [level=1] [ref=f156e42]
      - paragraph [ref=f156e43]: An open interface intelligence layer for people and agents.
    - generic [ref=f156e44]:
      - heading "A coherent product, not a pile of components" [level=2] [ref=f156e45]
      - paragraph [ref=f156e46]: Describe a product, inspect its inferred architecture, compare three directions and edit a validated manifest in Workbench. Composition, audit and export run without an LLM.
    - generic [ref=f156e47]:
      - heading "Open and portable" [level=2] [ref=f156e48]
      - paragraph [ref=f156e49]: The public resource source is free. Standalone exports contain React, TypeScript and Tailwind source without a Tessellate runtime dependency.
    - generic [ref=f156e50]:
      - heading "This review version" [level=2] [ref=f156e51]
      - paragraph [ref=f156e52]: Projects and collections are stored in your browser. Authentication, shared server persistence and community publishing require the canonical API deployment; this review does not pretend those services are connected.
    - paragraph [ref=f156e53]:
      - link "Repository and contributions" [ref=f156e54] [cursor=pointer]:
        - /url: https://github.com/danishgm-sketch/Tessellate
      - link "Documentation" [ref=f156e55] [cursor=pointer]:
        - /url: /docs
      - link "Inspect resource licences" [ref=f156e56] [cursor=pointer]:
        - /url: /explore
  - contentinfo [ref=f156e57]:
    - navigation "Footer" [ref=f156e58]:
      - link "About" [ref=f156e59] [cursor=pointer]:
        - /url: /about
      - link "Docs" [ref=f156e60] [cursor=pointer]:
        - /url: /docs
      - link "Licences" [ref=f156e61] [cursor=pointer]:
        - /url: /license
      - link "Privacy" [ref=f156e62] [cursor=pointer]:
        - /url: /privacy
      - link "Terms" [ref=f156e63] [cursor=pointer]:
        - /url: /terms
      - link "Support the commons" [ref=f156e64] [cursor=pointer]:
        - /url: /sponsor
      - link "Source on GitHub" [ref=f156e65] [cursor=pointer]:
        - /url: https://github.com/danishgm-sketch/Tessellate
```

# Test source

```ts
  37  |     return;
  38  |   }
  39  |   if (route === '/compose/') {
  40  |     await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  41  |     await expect(page.getByTestId('compose-submit-btn')).toBeVisible();
  42  |     return;
  43  |   }
  44  |   if (route === '/workbench/') {
  45  |     await expect(page.getByRole('main', { name: 'Workbench editor' })).toBeVisible();
  46  |     return;
  47  |   }
  48  |   const main = page.locator('main').first();
  49  |   await expect(main).toBeVisible();
  50  |   await expect(main.locator('h1, h2').first()).toBeAttached();
  51  | }
  52  |
  53  | test('major product surfaces fit and retain their primary content at every required width', async ({ page }, testInfo) => {
  54  |   test.setTimeout(10 * 60 * 1000);
  55  |   const evidence: Array<Record<string, unknown>> = [];
  56  |   const evidenceDir = path.resolve(process.cwd(), `quality/evidence/step-36/${testInfo.project.name}`);
  57  |   mkdirSync(evidenceDir, { recursive: true });
  58  |
  59  |   for (const viewport of viewports) {
  60  |     await page.setViewportSize(viewport);
  61  |     for (const route of surfaces) {
  62  |       const runtime = { consoleErrors: [] as string[], pageErrors: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
  63  |       const onConsole = (message: import('@playwright/test').ConsoleMessage) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); };
  64  |       const onPageError = (error: Error) => runtime.pageErrors.push(error.message);
  65  |       const onRequestFailed = (request: import('@playwright/test').Request) => runtime.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`);
  66  |       const onResponse = (response: import('@playwright/test').Response) => { if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`); };
  67  |       page.on('console', onConsole);
  68  |       page.on('pageerror', onPageError);
  69  |       page.on('requestfailed', onRequestFailed);
  70  |       page.on('response', onResponse);
  71  |
  72  |       const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  73  |       await waitForSurface(page, route);
  74  |       const layout = await page.evaluate(() => {
  75  |         const root = document.documentElement;
  76  |         const main = document.querySelector('main');
  77  |         const header = document.querySelector('header');
  78  |         const rect = (element: Element | null) => {
  79  |           if (!element) return null;
  80  |           const box = element.getBoundingClientRect();
  81  |           return { left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width) };
  82  |         };
  83  |         return {
  84  |           viewportWidth: root.clientWidth,
  85  |           documentWidth: root.scrollWidth,
  86  |           main: rect(main),
  87  |           mainContentWidth: main?.clientWidth ?? null,
  88  |           mainScrollWidth: main?.scrollWidth ?? null,
  89  |           header: rect(header),
  90  |           horizontalScrollContainers: Array.from(document.querySelectorAll<HTMLElement>('*'))
  91  |             .filter((element) => {
  92  |               const style = getComputedStyle(element);
  93  |               return ['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
  94  |             })
  95  |             .slice(0, 12)
  96  |             .map((element) => ({
  97  |               tag: element.tagName.toLowerCase(),
  98  |               label: element.getAttribute('aria-label'),
  99  |               testId: element.dataset.testid,
  100 |               scrollWidth: element.scrollWidth,
  101 |               clientWidth: element.clientWidth,
  102 |             })),
  103 |         };
  104 |       });
  105 |       const screenshot = `${viewport.width}-${route.replace(/^\//, '').replace(/\//g, '-') || 'home'}.png`;
  106 |       await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
  107 |       evidence.push({
  108 |         route,
  109 |         url: page.url(),
  110 |         viewport,
  111 |         status: response?.status() ?? null,
  112 |         layout,
  113 |         runtime,
  114 |         screenshot,
  115 |       });
  116 |
  117 |       page.off('console', onConsole);
  118 |       page.off('pageerror', onPageError);
  119 |       page.off('requestfailed', onRequestFailed);
  120 |       page.off('response', onResponse);
  121 |     }
  122 |   }
  123 |
  124 |   writeFileSync(path.join(evidenceDir, 'responsive-route-matrix.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  125 |   const failures = evidence.filter((item) => {
  126 |     const layout = item.layout as { viewportWidth: number; documentWidth: number; main: { left: number; right: number } | null; header: { left: number; right: number } | null };
  127 |     const runtime = item.runtime as { consoleErrors: string[]; pageErrors: string[]; failedRequests: string[]; httpErrors: string[] };
  128 |     return item.status !== 200
  129 |       || layout.documentWidth > layout.viewportWidth + 2
  130 |       || Boolean(layout.main && (layout.main.left < -1 || layout.main.right > layout.viewportWidth + 1))
  131 |       || Boolean(layout.header && (layout.header.left < -1 || layout.header.right > layout.viewportWidth + 1))
  132 |       || runtime.consoleErrors.length > 0
  133 |       || runtime.pageErrors.length > 0
  134 |       || runtime.failedRequests.length > 0
  135 |       || runtime.httpErrors.length > 0;
  136 |   });
> 137 |   expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
      |                                                       ^ Error: [
  138 | });
  139 |
  140 | test('responsive navigation, filters and Workbench controls switch at their real breakpoints', async ({ page }) => {
  141 |   const evidence: Array<Record<string, unknown>> = [];
  142 |   const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/interactions');
  143 |   mkdirSync(evidenceDir, { recursive: true });
  144 |
  145 |   for (const width of [360, 768, 1024, 1279, 1280, 1536]) {
  146 |     await page.setViewportSize({ width, height: 900 });
  147 |     await page.goto('/');
  148 |     if (width < 1280) {
  149 |       const menu = page.getByRole('button', { name: 'Toggle menu' });
  150 |       await expect(menu).toBeVisible();
  151 |       await menu.click();
  152 |       const dialog = page.getByRole('dialog', { name: 'Main navigation' });
  153 |       await expect(dialog).toBeVisible();
  154 |       const bounds = await dialog.evaluate((element) => {
  155 |         const rect = element.getBoundingClientRect();
  156 |         return { left: rect.left, right: rect.right, width: rect.width, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
  157 |       });
  158 |       expect(bounds.left).toBeGreaterThanOrEqual(-1);
  159 |       expect(bounds.right).toBeLessThanOrEqual(width + 1);
  160 |       expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 2);
  161 |       if ([360, 768, 1279].includes(width)) {
  162 |         const screenshot = `navigation-menu-${width}.png`;
  163 |         await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
  164 |         evidence.push({ surface: 'public navigation drawer', viewport: width, bounds, screenshot });
  165 |       }
  166 |       await page.getByRole('button', { name: 'Close navigation' }).click();
  167 |       await expect(dialog).toHaveCount(0);
  168 |     } else {
  169 |       await expect(page.getByRole('navigation').first()).toBeVisible();
  170 |       await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeHidden();
  171 |     }
  172 |   }
  173 |
  174 |   for (const width of [360, 390, 430, 768, 1023, 1024, 1280, 1536]) {
  175 |     await page.setViewportSize({ width, height: 900 });
  176 |     await page.goto('/explore/');
  177 |     await expect(page.getByRole('textbox', { name: 'Search catalogue' })).toBeVisible();
  178 |     await expect(page.getByText(/Showing 50 of 324 resources/)).toBeVisible();
  179 |     if (width < 1024) {
  180 |       const toggle = page.getByRole('button', { name: 'Filters', exact: true });
  181 |       await expect(toggle).toBeVisible();
  182 |       await toggle.click();
  183 |       await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  184 |       const dialog = page.getByRole('dialog', { name: 'Explore filters' });
  185 |       await expect(dialog).toBeVisible();
  186 |       const bounds = await dialog.evaluate((element) => {
  187 |         const rect = element.getBoundingClientRect();
  188 |         return { left: rect.left, right: rect.right, width: rect.width };
  189 |       });
  190 |       expect(bounds.left).toBeGreaterThanOrEqual(-1);
  191 |       expect(bounds.right).toBeLessThanOrEqual(width + 1);
  192 |       if ([360, 768, 1023].includes(width)) {
  193 |         const screenshot = `explore-filter-drawer-${width}.png`;
  194 |         await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
  195 |         evidence.push({ surface: 'Explore filter drawer', viewport: width, bounds, screenshot });
  196 |       }
  197 |       await page.getByRole('button', { name: 'Close filters' }).click();
  198 |       await expect(dialog).toHaveCount(0);
  199 |     } else {
  200 |       await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeHidden();
  201 |       await expect(page.locator('main aside').getByText('Filters', { exact: true })).toBeVisible();
  202 |     }
  203 |   }
  204 |
  205 |   await page.goto('/workbench/');
  206 |   for (const width of [360, 390, 430, 768, 1023, 1024, 1280, 1536]) {
  207 |     await page.setViewportSize({ width, height: 900 });
  208 |     if (width < 1024) {
  209 |       const mobileNav = page.getByRole('navigation', { name: 'Mobile Workbench' });
  210 |       await expect(mobileNav).toBeVisible();
  211 |       await mobileNav.getByRole('button', { name: 'Pages', exact: true }).click();
  212 |       await expect(page.getByText(/Screens & Navigation/)).toBeVisible();
  213 |       const screenshot = `workbench-pages-${width}.png`;
  214 |       await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
  215 |       evidence.push({ surface: 'mobile Workbench Pages tab', viewport: width, screenshot });
  216 |     } else {
  217 |       await expect(page.getByTestId('workbench-shell')).toBeVisible();
  218 |       await page.getByRole('button', { name: 'style', exact: true }).click();
  219 |       await expect(page.getByRole('button', { name: 'style', exact: true })).toHaveAttribute('aria-pressed', 'true');
  220 |       const screenshot = `workbench-style-${width}.png`;
  221 |       await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
  222 |       evidence.push({ surface: 'desktop Workbench Style mode', viewport: width, screenshot });
  223 |     }
  224 |   }
  225 |
  226 |   writeFileSync(path.join(evidenceDir, 'breakpoint-interactions.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  227 | });
  228 |
  229 | test('phone header keeps its primary action on one line', async ({ page }) => {
  230 |   const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/interactions');
  231 |   mkdirSync(evidenceDir, { recursive: true });
  232 |   const evidence: Array<Record<string, unknown>> = [];
  233 |   for (const width of [360, 390, 430]) {
  234 |     await page.setViewportSize({ width, height: 844 });
  235 |     await page.goto('/');
  236 |     const action = page.getByRole('link', { name: 'Start building' });
  237 |     await expect(action).toBeVisible();
```
