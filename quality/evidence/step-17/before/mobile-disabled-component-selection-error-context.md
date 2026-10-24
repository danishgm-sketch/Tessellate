# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench-fundamentals-hardening.spec.ts >> mobile Workbench uses its inspection flow without losing screen or selection context
- Location: tests\e2e\workbench-fundamentals-hardening.spec.ts:270:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('right-inspector').getByText('Node: component')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('right-inspector').getByText('Node: component') with timeout 5000ms
  - waiting for getByTestId('right-inspector').getByText('Node: component')

```

```yaml
- banner:
  - link "T":
    - /url: /
  - button "Adaptive Architecture — Employee experience"
  - img
  - text: Local
  - link "Compose":
    - /url: /compose
    - img
    - text: Compose
  - button "structure" [pressed]
  - button "style"
  - button "motion"
  - button "content"
  - button "audit"
  - button "Recompose":
    - img
    - text: Recompose
  - button "Surprise":
    - img
    - text: Surprise
  - button "Blend":
    - img
    - text: Blend
  - button "Compare":
    - img
    - text: Compare
  - button "Snapshots (1)":
    - img
    - text: Snapshots (1)
  - button "Undo" [disabled]:
    - img
  - button "Redo" [disabled]:
    - img
  - button "Preview":
    - img
  - button "Export":
    - img
    - text: Export
    - img
- banner:
  - text: People & Teams
  - navigation "Product screens":
    - link "Marketing Home":
      - /url: "#screen-marketing-home"
    - link "Team Overview":
      - /url: "#screen-overview"
    - link "People Directory":
      - /url: "#screen-collection-index"
    - link "Teams":
      - /url: "#screen-teams"
    - link "Engagement":
      - /url: "#screen-engagement"
    - link "Settings & Policies":
      - /url: "#screen-settings"
- banner:
  - text: People & Teams
  - navigation "Product screens":
    - link "Marketing Home":
      - /url: "#screen-marketing-home"
    - link "Team Overview":
      - /url: "#screen-overview"
    - link "People Directory":
      - /url: "#screen-collection-index"
    - link "Teams":
      - /url: "#screen-teams"
    - link "Engagement":
      - /url: "#screen-engagement"
    - link "Settings & Policies":
      - /url: "#screen-settings"
- text: Notification preferences
- textbox "Notification preferences"
- paragraph: Example field. Connect persistence and your backend in the exported application.
- button "Explore Interface System →" [disabled]
- text: Connect an action before enabling this button.
- navigation "Mobile Workbench":
  - button "Preview" [pressed]:
    - img
    - text: Preview
  - button "Pages":
    - img
    - text: Pages
  - button "Inspect":
    - img
    - text: Inspect
  - button "Command":
    - img
    - text: Command
  - button "Audit":
    - img
    - text: Audit
```

# Test source

```ts
  247 |       .evaluate((node) => node.parentElement?.parentElement?.getBoundingClientRect().width);
  248 |     expect(deviceWidth).toBe(1440);
  249 |     evidence.checks.canvas = {
  250 |       zoomRestoredByShortcut: '100%',
  251 |       viewportShortcuts: ['1440', '768', '390'],
  252 |       finalPreset: '1440',
  253 |       deviceWidth,
  254 |     };
  255 |
  256 |     await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  257 |     await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
  258 |       0
  259 |     );
  260 |   } finally {
  261 |     await saveEvidence(page, evidence, testInfo);
  262 |   }
  263 |
  264 |   expect(evidence.consoleErrors).toEqual([]);
  265 |   expect(evidence.uncaughtExceptions).toEqual([]);
  266 |   expect(evidence.failedRequests).toEqual([]);
  267 |   expect(evidence.httpErrors).toEqual([]);
  268 | });
  269 |
  270 | test('mobile Workbench uses its inspection flow without losing screen or selection context', async ({
  271 |   page,
  272 |   isMobile,
  273 | }, testInfo) => {
  274 |   test.skip(!isMobile, 'Mobile Workbench fundamentals are exercised at 390×844');
  275 |   const evidence: RuntimeEvidence = {
  276 |     id: 'STEP-17-MOBILE',
  277 |     viewport: testInfo.project.use.viewport as { width: number; height: number },
  278 |     url: '',
  279 |     consoleErrors: [],
  280 |     consoleWarnings: [],
  281 |     uncaughtExceptions: [],
  282 |     failedRequests: [],
  283 |     httpErrors: [],
  284 |     checks: {},
  285 |   };
  286 |   captureRuntime(page, evidence);
  287 |
  288 |   try {
  289 |     await openDirectionC(page);
  290 |     const mobileShell = page.getByTestId('mobile-workbench');
  291 |     await expect(mobileShell).toBeVisible();
  292 |     const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Workbench' });
  293 |     for (const tab of ['Preview', 'Pages', 'Inspect', 'Command', 'Audit']) {
  294 |       await expect(mobileNavigation.getByRole('button', { name: tab, exact: true })).toBeVisible();
  295 |     }
  296 |     const viewportMetrics = await page.evaluate(() => ({
  297 |       viewportWidth: window.innerWidth,
  298 |       viewportHeight: window.innerHeight,
  299 |       documentWidth: document.documentElement.scrollWidth,
  300 |       navigationHeight: document
  301 |         .querySelector('nav[aria-label="Mobile Workbench"]')
  302 |         ?.getBoundingClientRect().height,
  303 |       shellHeight: document
  304 |         .querySelector('[data-testid="mobile-workbench"]')
  305 |         ?.getBoundingClientRect().height,
  306 |     }));
  307 |     expect(viewportMetrics.documentWidth).toBeLessThanOrEqual(viewportMetrics.viewportWidth);
  308 |     expect(viewportMetrics.navigationHeight).toBe(64);
  309 |     expect(viewportMetrics.shellHeight).toBe(viewportMetrics.viewportHeight);
  310 |     evidence.checks.shell = viewportMetrics;
  311 |     await mkdir(path.resolve(process.cwd(), 'quality/evidence/step-17/after'), { recursive: true });
  312 |     await page.screenshot({
  313 |       path: path.resolve(
  314 |         process.cwd(),
  315 |         'quality/evidence/step-17/after/workbench-mobile-initial.png'
  316 |       ),
  317 |       fullPage: true,
  318 |     });
  319 |
  320 |     const firstScreen = await page.locator('.tess-screen').getAttribute('data-screen-id');
  321 |     await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
  322 |     await expect(page.getByTestId('pages-tab')).toBeVisible();
  323 |     await expect(page.getByTestId('layers-tab')).toBeVisible();
  324 |     const pageButtons = page
  325 |       .getByTestId('pages-tab')
  326 |       .locator('button[aria-label^="Select screen "]');
  327 |     const pageNames = await pageButtons.evaluateAll((buttons) =>
  328 |       buttons.map((button) => button.getAttribute('aria-label'))
  329 |     );
  330 |     expect(pageNames.length).toBeGreaterThanOrEqual(3);
  331 |     await expect(pageButtons.last()).toHaveAttribute(
  332 |       'aria-label',
  333 |       'Select screen Settings & Policies'
  334 |     );
  335 |     await pageButtons.last().click();
  336 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  337 |     await expect(page.locator('.tess-screen')).not.toHaveAttribute(
  338 |       'data-screen-id',
  339 |       firstScreen ?? ''
  340 |     );
  341 |     const selectedScreen = await page.locator('.tess-screen').getAttribute('data-screen-id');
  342 |
  343 |     const component = page.locator('.tess-screen [data-node-type="component"]').first();
  344 |     const componentId = await component.getAttribute('data-node-id');
  345 |     expect(componentId).toBeTruthy();
  346 |     await component.click();
> 347 |     await expect(page.getByTestId('right-inspector').getByText('Node: component')).toBeVisible();
      |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  348 |     await expect(
  349 |       mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
  350 |     ).toHaveAttribute('aria-pressed', 'true');
  351 |
  352 |     await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
  353 |     const element = page.locator('.tess-screen [data-node-type="element"]').first();
  354 |     const elementId = await element.getAttribute('data-node-id');
  355 |     expect(elementId).toBeTruthy();
  356 |     await page.getByTestId(`layer-node-${elementId}`).click();
  357 |     await mobileNavigation.getByRole('button', { name: 'Inspect', exact: true }).click();
  358 |     await expect(page.getByTestId('right-inspector').getByText('Node: element')).toBeVisible();
  359 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  360 |     await expect(page.locator('.tess-screen [data-node-id]').first()).toBeVisible();
  361 |     await mobileNavigation.getByRole('button', { name: 'Command', exact: true }).click();
  362 |     await expect(
  363 |       page.getByTestId('command-bar').getByRole('textbox', { name: 'Tessellate command' })
  364 |     ).toBeVisible();
  365 |     await mobileNavigation.getByRole('button', { name: 'Audit', exact: true }).click();
  366 |     await expect(page.getByTestId('audit-panel')).toBeVisible();
  367 |     await page
  368 |       .getByTestId('top-toolbar')
  369 |       .getByRole('button', { name: 'Motion', exact: true })
  370 |       .click();
  371 |     await expect(page.getByTestId('right-inspector').getByTestId('motion-tab')).toBeVisible();
  372 |     await expect(
  373 |       mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
  374 |     ).toHaveAttribute('aria-pressed', 'true');
  375 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  376 |
  377 |     await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  378 |     await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
  379 |       0
  380 |     );
  381 |     evidence.checks.navigation = {
  382 |       pages: pageNames,
  383 |       firstScreen,
  384 |       selectedScreen,
  385 |       selectedComponent: componentId,
  386 |       selectedElement: elementId,
  387 |       tabs: ['Preview', 'Pages', 'Inspect', 'Command', 'Audit'],
  388 |     };
  389 |   } finally {
  390 |     await saveEvidence(page, evidence, testInfo);
  391 |   }
  392 |
  393 |   expect(evidence.consoleErrors).toEqual([]);
  394 |   expect(evidence.uncaughtExceptions).toEqual([]);
  395 |   expect(evidence.failedRequests).toEqual([]);
  396 |   expect(evidence.httpErrors).toEqual([]);
  397 | });
  398 |
```
