# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: catalog-resource-render.spec.ts >> all catalogue resources render at every certified width in the Sites Worker
- Location: tests/e2e/catalog-resource-render.spec.ts:70:1

# Error details

```
Error: Catalogue browser smoke findings:
gauge: failed-request: GET http://127.0.0.1:4323/preview-content/?resource=gauge&variant=expressive&theme=light&device=desktop&reducedMotion=false: net::ERR_ABORTED
gauge: failed-request: GET http://127.0.0.1:4323/preview-content/?resource=gauge&variant=nocturne&theme=light&device=desktop&reducedMotion=false: net::ERR_ABORTED

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "gauge: failed-request: GET http://127.0.0.1:4323/preview-content/?resource=gauge&variant=expressive&theme=light&device=desktop&reducedMotion=false: net::ERR_ABORTED",
+   "gauge: failed-request: GET http://127.0.0.1:4323/preview-content/?resource=gauge&variant=nocturne&theme=light&device=desktop&reducedMotion=false: net::ERR_ABORTED",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f646e1]:
  - generic [ref=f646e2]:
    - link "Skip to content" [ref=f646e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=f646e4]:
      - generic [ref=f646e5]:
        - generic [ref=f646e6]:
          - link "Tessellate Mark Tessellate" [ref=f646e7] [cursor=pointer]:
            - /url: /
            - img "Tessellate Mark" [ref=f646e8]
            - generic [ref=f646e13]: Tessellate
          - navigation "Primary" [ref=f646e14]:
            - link "Explore" [ref=f646e15] [cursor=pointer]:
              - /url: /explore
            - link "Compose" [ref=f646e16] [cursor=pointer]:
              - /url: /compose
            - link "Workbench" [ref=f646e17] [cursor=pointer]:
              - /url: /workbench
            - link "Tools" [ref=f646e18] [cursor=pointer]:
              - /url: /tools
            - link "Agents" [ref=f646e19] [cursor=pointer]:
              - /url: /agents
            - link "Creators" [ref=f646e20] [cursor=pointer]:
              - /url: /creators
            - link "Docs" [ref=f646e21] [cursor=pointer]:
              - /url: /docs
        - generic [ref=f646e22]:
          - button "Search resources (Press Command-K)" [ref=f646e23] [cursor=pointer]:
            - generic [ref=f646e27]: Search...
            - generic [ref=f646e28]: ⌘K
          - link "GitHub Repository" [ref=f646e29] [cursor=pointer]:
            - /url: https://github.com/danishgm-sketch/Tessellate
          - button "Local projects" [ref=f646e32] [cursor=pointer]
          - link "Start building" [ref=f646e33] [cursor=pointer]:
            - /url: /compose
  - main [ref=f646e34]:
    - navigation "Resource breadcrumb" [ref=f646e35]:
      - link "Home" [ref=f646e36] [cursor=pointer]:
        - /url: /
      - generic [ref=f646e37]: /
      - link "Explore" [ref=f646e38] [cursor=pointer]:
        - /url: /explore
      - generic [ref=f646e39]: /
      - generic [ref=f646e40]: shells
      - generic [ref=f646e41]: /
      - generic [ref=f646e42]: Workspace Switcher
    - generic [ref=f646e43]:
      - generic [ref=f646e44]:
        - heading "Workspace Switcher" [level=1] [ref=f646e45]
        - generic [ref=f646e46]:
          - generic [ref=f646e47]: "@tess/workspace-switcher"
          - generic [ref=f646e48]: v1.0.0
          - generic [ref=f646e49]: verified
        - paragraph [ref=f646e50]: Dropdown trigger displaying current tenant organization with plan badge and fast team switching.
        - generic [ref=f646e51]:
          - generic [ref=f646e52]: "Install:"
          - code [ref=f646e53]: tess add workspace-switcher
          - code [ref=f646e54]: "Registry source: /r/workspace-switcher.json"
      - list [ref=f646e55]:
        - listitem [ref=f646e56]: "#workspace-switcher"
        - listitem [ref=f646e57]: "#tenant"
        - listitem [ref=f646e58]: "#org"
        - listitem [ref=f646e59]: "#switcher"
    - generic [ref=f646e60]:
      - generic [ref=f646e61]:
        - generic [ref=f646e63]:
          - generic [ref=f646e64]:
            - generic [ref=f646e65]:
              - generic [ref=f646e66]: "Variant:"
              - button "Quiet" [active] [ref=f646e67]
              - button "Expressive" [ref=f646e68]
              - button "Nocturne" [ref=f646e69]
            - generic [ref=f646e70]:
              - generic [ref=f646e71]:
                - button "Desktop (1440px)" [ref=f646e72]
                - button "Tablet (768px)" [ref=f646e75]
                - button "Mobile (360px)" [ref=f646e78]
              - button "Switch to Dark theme" [ref=f646e81]
              - button "Motion" [ref=f646e84]
              - button "Reset preview state" [ref=f646e88]
          - iframe [ref=f646e94]:
            - button "T Tessellate HQ ▾" [ref=f647e8]:
              - generic [ref=f647e9]:
                - generic [ref=f647e10]: T
                - generic [ref=f647e11]: Tessellate HQ
              - generic [ref=f647e12]: ▾
        - generic [ref=f646e96]:
          - generic [ref=f646e97]:
            - button "Intent" [ref=f646e98]
            - button "Code" [ref=f646e102]
            - button "Variants" [ref=f646e107]
            - button "Anatomy" [ref=f646e115]
            - button "Accessibility" [ref=f646e121]
            - button "Performance" [ref=f646e126]
            - button "Dependencies" [ref=f646e130]
            - button "Versions" [ref=f646e136]
          - generic [ref=f646e142]:
            - generic [ref=f646e143]:
              - generic [ref=f646e144]:
                - heading "Summary & Purpose" [level=2] [ref=f646e145]
                - paragraph [ref=f646e146]: Dropdown trigger displaying current tenant organization with plan badge and fast team switching.
              - generic [ref=f646e147]:
                - generic [ref=f646e148]:
                  - generic [ref=f646e149]: When It Works (Ideal For)
                  - list [ref=f646e154]:
                    - listitem [ref=f646e155]:
                      - generic [ref=f646e156]: •
                      - generic [ref=f646e157]: Multi-tenant SaaS header or sidebar top
                - generic [ref=f646e158]:
                  - generic [ref=f646e159]: When It Is Inappropriate (Avoid For)
                  - list [ref=f646e165]:
                    - listitem [ref=f646e166]:
                      - generic [ref=f646e167]: •
                      - generic [ref=f646e168]: Consumer single-user accounts
              - generic [ref=f646e169]:
                - heading "Jobs To Be Done" [level=2] [ref=f646e170]
                - generic [ref=f646e171]: Switch active organization context
              - generic [ref=f646e173]:
                - heading "Expected Content Requirements" [level=2] [ref=f646e174]
                - list [ref=f646e175]:
                  - listitem [ref=f646e176]: Accessible navigation semantics and responsive containment
              - generic [ref=f646e177]:
                - heading "Target Product Archetypes" [level=2] [ref=f646e178]
                - generic [ref=f646e179]:
                  - generic [ref=f646e180]: developer-tool (90%)
                  - generic [ref=f646e181]: b2b-saas (85%)
            - status
      - generic [ref=f646e184]:
        - generic [ref=f646e185]:
          - paragraph [ref=f646e186]: Source and sandbox preview available. Workbench composition is restricted to the validated Gold runtime registry.
          - generic [ref=f646e187]:
            - button "Copy import" [ref=f646e188]
            - button "npx install" [ref=f646e193]
        - generic [ref=f646e198]:
          - note [ref=f646e199]: "Quality assessment: Not assessed."
          - generic [ref=f646e200]:
            - generic [ref=f646e201]: Category
            - generic [ref=f646e202]: shells
          - generic [ref=f646e203]:
            - generic [ref=f646e204]: SPDX License
            - generic [ref=f646e205]: MIT
          - generic [ref=f646e206]:
            - generic [ref=f646e207]: Creator
            - generic [ref=f646e208]: Tessellate Core
          - generic [ref=f646e209]:
            - generic [ref=f646e210]: Framework & Styling
            - generic [ref=f646e211]: react + tailwind
        - generic [ref=f646e213]:
          - generic [ref=f646e214]: Design DNA Profile
          - generic [ref=f646e228]:
            - generic [ref=f646e230]:
              - generic [ref=f646e231]: Density
              - generic [ref=f646e232]: 65%
            - generic [ref=f646e236]:
              - generic [ref=f646e237]: Visual Ambition
              - generic [ref=f646e238]: 60%
            - generic [ref=f646e242]:
              - generic [ref=f646e243]: Contrast
              - generic [ref=f646e244]: 75%
            - generic [ref=f646e248]:
              - generic [ref=f646e249]: Curvature
              - generic [ref=f646e250]: 40%
            - generic [ref=f646e254]:
              - generic [ref=f646e255]: Motion
              - generic [ref=f646e256]: 35%
  - contentinfo [ref=f646e259]: Tessellate Interface Intelligence Layer — Open resource library under MIT License.
```

# Test source

```ts
  324 |             const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-page-overflow.png`);
  325 |             await page.screenshot({ path: screenshotPath, animations: 'disabled' });
  326 |             record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
  327 |           }
  328 |           if (resource.slug === 'ai-agent-activity-feed' && width === 360) {
  329 |             const action = frame.getByText('Checked sample UI resources for duplicate patterns', { exact: true });
  330 |             const actionBounds = await action.boundingBox();
  331 |             const frameWidth = await frame.locator('html').evaluate((html) => html.clientWidth);
  332 |             if (!actionBounds || actionBounds.width < frameWidth * 0.6) {
  333 |               record.findings.push({ type: 'responsive-content', detail: `Activity-feed text occupies ${Math.round(actionBounds?.width ?? 0)}px of a ${frameWidth}px preview at 360px; the description becomes difficult to read.`, viewport: width });
  334 |             }
  335 |           }
  336 |           const bodyText = await frame.locator('body').innerText();
  337 |           if (/Preview failed:|missing-resource-recovery|No component registered|Loading the actual resource/i.test(bodyText)) {
  338 |             record.findings.push({ type: 'preview-error', detail: bodyText.slice(0, 400), viewport: width });
  339 |           }
  340 |           const readVisibleCount = () => frame.locator('body').evaluate((body) => [...body.querySelectorAll('*')].filter((element) => {
  341 |             const style = getComputedStyle(element);
  342 |             const bounds = element.getBoundingClientRect();
  343 |             return style.display !== 'none' && style.visibility !== 'hidden' && bounds.width > 0 && bounds.height > 0;
  344 |           }).length);
  345 |           if ((await readVisibleCount()) === 0) {
  346 |             try {
  347 |               await expect.poll(readVisibleCount, { timeout: 5000, message: `Preview for ${resource.slug} should settle with visible content at ${width}px.` }).toBeGreaterThan(0);
  348 |             } catch {
  349 |               const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-empty-preview.png`);
  350 |               await page.screenshot({ path: screenshotPath, animations: 'disabled' });
  351 |               record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
  352 |               record.findings.push({ type: 'preview-error', detail: `Preview remained without visible content after 5 seconds. Frame text: ${bodyText.slice(0, 200) || '(empty)'}.`, viewport: width });
  353 |             }
  354 |           }
  355 |           const dimensions = await frame.locator('html').evaluate((html) => ({ clientWidth: html.clientWidth, scrollWidth: html.scrollWidth }));
  356 |           if (width >= 1280) {
  357 |             const previewWidth = await preview.evaluate((iframe) => Math.round(iframe.getBoundingClientRect().width));
  358 |             if (previewWidth < 500) {
  359 |               record.findings.push({ type: 'shell-layout', detail: `Desktop resource preview width ${previewWidth}px is too narrow at a ${width}px viewport.`, viewport: width });
  360 |             }
  361 |           }
  362 |           if (dimensions.scrollWidth > dimensions.clientWidth + 2) {
  363 |             const frameContext = await preview.evaluate((iframe) => ({
  364 |               outerViewport: window.innerWidth,
  365 |               outerScrollX: window.scrollX,
  366 |               iframe: (() => { const rect = iframe.getBoundingClientRect(); return { left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right) }; })(),
  367 |               host: (() => { const rect = iframe.parentElement?.getBoundingClientRect(); return rect ? { width: Math.round(rect.width), right: Math.round(rect.right) } : null; })(),
  368 |               ancestors: (() => { const values = []; let element: HTMLElement | null = iframe as HTMLElement; for (let depth = 0; element && depth < 9; depth += 1, element = element.parentElement) { const rect = element.getBoundingClientRect(); values.push({ tag: element.tagName.toLowerCase(), className: String(element.className).slice(0, 70), left: Math.round(rect.left), width: Math.round(rect.width), right: Math.round(rect.right), columns: getComputedStyle(element).display === 'grid' ? getComputedStyle(element).gridTemplateColumns : undefined }); } return values; })(),
  369 |             }));
  370 |             record.findings.push({ type: 'overflow', detail: `Preview width ${dimensions.scrollWidth}px exceeds viewport ${dimensions.clientWidth}px. Host geometry: ${JSON.stringify(frameContext)}`, viewport: width });
  371 |             const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-overflow.png`);
  372 |             await page.screenshot({ path: screenshotPath, animations: 'disabled' });
  373 |             record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
  374 |           }
  375 |           if (width === 390 && responsiveFixes.has(resource.slug)) {
  376 |             const screenshotPath = path.join(outputDir, `${resource.slug}-${width}-after.png`);
  377 |             await page.screenshot({ path: screenshotPath, animations: 'disabled' });
  378 |             record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
  379 |           }
  380 |           if (width === 390 && navigationFixes.has(resource.slug)) {
  381 |             const screenshotPath = path.join(outputDir, `${resource.slug}-390-after.png`);
  382 |             await page.screenshot({ path: screenshotPath, animations: 'disabled' });
  383 |             record.screenshots.push(path.relative(process.cwd(), screenshotPath).replaceAll('\\', '/'));
  384 |           }
  385 |         }
  386 |       }
  387 |     } catch (cause) {
  388 |       record.findings.push({ type: 'test-error', detail: cause instanceof Error ? cause.message : String(cause) });
  389 |       try {
  390 |         await page.screenshot({ path: path.join(outputDir, `${resource.slug}-failure.png`), animations: 'disabled' });
  391 |       } catch {
  392 |         // A failed navigation may leave no document available to capture.
  393 |       }
  394 |     }
  395 |     const pending = pendingByRecord.get(record);
  396 |     if (pending?.size) {
  397 |       try {
  398 |         await expect.poll(() => pending.size, { timeout: 5000, message: `Requests for ${resource.slug} should finish before navigating away.` }).toBe(0);
  399 |       } catch {
  400 |         record.findings.push({
  401 |           type: 'failed-request',
  402 |           detail: `Resource page left ${pending.size} request(s) unsettled: ${[...pending].map((request) => `${request.method()} ${request.url()}`).join('; ')}`,
  403 |         });
  404 |       }
  405 |     }
  406 |     records.push(record);
  407 |   }
  408 |
  409 |   activeRecord = undefined;
  410 |   const reportPath = path.resolve(process.cwd(), 'audit/evidence/step-07/after/catalog-324-worker-pass.json');
  411 |   mkdirSync(path.dirname(reportPath), { recursive: true });
  412 |   await import('node:fs/promises').then(({ writeFile }) => writeFile(reportPath, JSON.stringify({
  413 |     schemaVersion: '1.0.0',
  414 |     browserProject: testInfo.project.name,
  415 |     widths: certifiedWidths,
  416 |     resourceCount: records.length,
  417 |     variantCount: records.reduce((sum, record) => sum + record.testedVariants.length, 0),
  418 |     findings: records.reduce((sum, record) => sum + record.findings.length, 0),
  419 |     cancelledRequestCount: records.reduce((sum, record) => sum + record.cancelledRequests.length, 0),
  420 |     resources: records,
  421 |   }, null, 2)));
  422 |
  423 |   const failures = records.flatMap((record) => record.findings.map((finding) => `${record.slug}: ${finding.type}: ${finding.detail}`));
> 424 |   expect(failures, `Catalogue browser smoke findings:\n${failures.join('\n')}`).toEqual([]);
      |                                                                                 ^ Error: Catalogue browser smoke findings:
  425 | });
  426 |
  427 | test('canonical /r resource detail route preserves title, preview, and responsive layout', async ({ page }, testInfo) => {
  428 |   test.skip(testInfo.project.name !== 'sites-chromium', 'This route smoke runs against the Sites Worker preview boundary.');
  429 |
  430 |   const slug = 'ai-prompt-hero';
  431 |   const title = 'AI Prompt Hero (@tess/ai-prompt-hero) — Tessellate Resource';
  432 |   const errors: string[] = [];
  433 |   page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  434 |   page.on('pageerror', (error) => errors.push(error.message));
  435 |   page.on('requestfailed', (request) => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  436 |   const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/resource-layout');
  437 |   mkdirSync(evidenceDir, { recursive: true });
  438 |   const results: Array<{ viewport: string; status: number | null; title: string; heading: string; pageWidth: number; previewWidth: number }> = [];
  439 |
  440 |   for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  441 |     await page.setViewportSize(viewport);
  442 |     const response = await page.goto(`/r/${slug}/`, { waitUntil: 'domcontentloaded' });
  443 |     await expect(page).toHaveTitle(title);
  444 |     const heading = page.getByRole('heading', { level: 1, name: 'AI Prompt Hero', exact: true });
  445 |     await expect(heading).toBeVisible();
  446 |     const preview = page.locator('iframe[title$=" live preview"]');
  447 |     await expect(preview).toHaveCount(1);
  448 |     await expect(page.frameLocator('iframe[title$=" live preview"]').locator('.tess-screen')).toHaveCount(1);
  449 |     const dimensions = await page.locator('html').evaluate((html) => ({ pageWidth: html.scrollWidth, clientWidth: html.clientWidth }));
  450 |     const previewWidth = await preview.evaluate((iframe) => Math.round(iframe.getBoundingClientRect().width));
  451 |     expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.clientWidth + 2);
  452 |     if (viewport.width >= 1280) expect(previewWidth).toBeGreaterThanOrEqual(500);
  453 |     await page.screenshot({ path: path.join(evidenceDir, `r-ai-prompt-hero-${viewport.width}.png`), animations: 'disabled' });
  454 |     results.push({ viewport: `${viewport.width}x${viewport.height}`, status: response?.status() ?? null, title: await page.title(), heading: (await heading.innerText()).trim(), pageWidth: dimensions.pageWidth, previewWidth });
  455 |   }
  456 |
  457 |   expect(errors, `Canonical resource route browser errors: ${errors.join('\n')}`).toEqual([]);
  458 |   await import('node:fs/promises').then(({ writeFile }) => writeFile(
  459 |     path.resolve(process.cwd(), 'audit/evidence/step-06/results/canonical-resource-route.json'),
  460 |     JSON.stringify({ route: `/r/${slug}/`, errors, results }, null, 2),
  461 |   ));
  462 | });
  463 |
  464 | test('AI Chat Panel standalone preview starts with a coherent heading hierarchy', async ({ page }, testInfo) => {
  465 |   const errors: string[] = [];
  466 |   page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  467 |   page.on('pageerror', (error) => errors.push(error.message));
  468 |   page.on('requestfailed', (request) => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  469 |   page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  470 |   const response = await page.goto('/r/ai-chat-panel/', { waitUntil: 'domcontentloaded' });
  471 |   expect(response?.status()).toBe(200);
  472 |   const frame = page.frameLocator('iframe[title$=" live preview"]');
  473 |   await expect(frame.getByText('Example conversation. This preview does not connect to a model; sending adds a fixed local example reply.')).toBeVisible();
  474 |   const firstHeading = frame.locator('h1, h2, h3, h4, h5, h6').first();
  475 |   await expect(firstHeading).toHaveText('Example assistant conversation');
  476 |   await expect(firstHeading).toHaveJSProperty('tagName', 'H2');
  477 |   const headingLevels = await frame.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) =>
  478 |     headings.map((heading) => Number(heading.tagName.slice(1)))
  479 |   );
  480 |   expect(headingLevels[0]).toBe(2);
  481 |   expect(errors).toEqual([]);
  482 |
  483 |   const screenshot = path.resolve(process.cwd(), `quality/evidence/step-35/after/ai-chat-panel-heading-${testInfo.project.name}.png`);
  484 |   mkdirSync(path.dirname(screenshot), { recursive: true });
  485 |   await page.screenshot({ path: screenshot, animations: 'disabled' });
  486 |   await import('node:fs/promises').then(({ writeFile }) => writeFile(
  487 |     path.resolve(process.cwd(), `quality/evidence/step-35/after/ai-chat-panel-heading-${testInfo.project.name}.json`),
  488 |     JSON.stringify({ route: page.url(), viewport: page.viewportSize(), status: response?.status(), headingLevels, errors, screenshot: path.relative(process.cwd(), screenshot) }, null, 2),
  489 |   ));
  490 | });
  491 |
  492 | test('marketing CTA header reflows without overflow in compact resource previews', async ({ page }, testInfo) => {
  493 |   test.skip(testInfo.project.name !== 'sites-chromium', 'This regression runs against the Sites Worker preview boundary.');
  494 |
  495 |   const viewports = [{ width: 360, height: 844 }, { width: 390, height: 844 }];
  496 |   const errors: string[] = [];
  497 |   const warnings: string[] = [];
  498 |   const failedRequests: string[] = [];
  499 |   const httpErrors: string[] = [];
  500 |   page.on('console', (message) => {
  501 |     if (message.type() === 'error') errors.push(message.text());
  502 |     if (message.type() === 'warning') warnings.push(message.text());
  503 |   });
  504 |   page.on('pageerror', (error) => errors.push(error.message));
  505 |   page.on('requestfailed', (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`));
  506 |   page.on('response', (response) => {
  507 |     if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  508 |   });
  509 |
  510 |   const evidenceDir = path.resolve(process.cwd(), 'audit/evidence/step-06/after/resource-layout');
  511 |   mkdirSync(evidenceDir, { recursive: true });
  512 |   await page.setViewportSize(viewports[0]);
  513 |   const response = await page.goto('/resources/marketing-nav-cta/', { waitUntil: 'domcontentloaded' });
  514 |   expect(response?.status()).toBe(200);
  515 |   const frame = page.frameLocator('iframe[title$=" live preview"]');
  516 |   const header = frame.locator('header');
  517 |   await expect(header).toBeVisible();
  518 |   await expect(frame.getByRole('button', { name: 'Start Free' })).toBeVisible();
  519 |
  520 |   const results: Array<{ viewport: string; frameWidth: number; documentWidth: number; headerWidth: number; itemsOverlap: boolean; screenshot: string }> = [];
  521 |   for (const viewport of viewports) {
  522 |     await page.setViewportSize(viewport);
  523 |     await header.evaluate(async (element) => { await element.ownerDocument.fonts.ready; });
  524 |     const measurements = await header.evaluate((element) => {
```
