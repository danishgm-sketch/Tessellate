# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench-fundamentals-hardening.spec.ts >> mobile Workbench uses its inspection flow without losing screen or selection context
- Location: tests\e2e\workbench-fundamentals-hardening.spec.ts:290:1

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
  285 |   expect(evidence.uncaughtExceptions).toEqual([]);
  286 |   expect(evidence.failedRequests).toEqual([]);
  287 |   expect(evidence.httpErrors).toEqual([]);
  288 | });
  289 |
  290 | test('mobile Workbench uses its inspection flow without losing screen or selection context', async ({
  291 |   page,
  292 |   isMobile,
  293 | }, testInfo) => {
  294 |   test.skip(!isMobile, 'Mobile Workbench fundamentals are exercised at 390×844');
  295 |   const evidence: RuntimeEvidence = {
  296 |     id: 'STEP-17-MOBILE',
  297 |     viewport: testInfo.project.use.viewport as { width: number; height: number },
  298 |     url: '',
  299 |     consoleErrors: [],
  300 |     consoleWarnings: [],
  301 |     uncaughtExceptions: [],
  302 |     failedRequests: [],
  303 |     httpErrors: [],
  304 |     checks: {},
  305 |   };
  306 |   captureRuntime(page, evidence);
  307 |
  308 |   try {
  309 |     await openDirectionC(page);
  310 |     const mobileShell = page.getByTestId('mobile-workbench');
  311 |     await expect(mobileShell).toBeVisible();
  312 |     const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Workbench' });
  313 |     for (const tab of ['Preview', 'Pages', 'Inspect', 'Command', 'Audit']) {
  314 |       await expect(mobileNavigation.getByRole('button', { name: tab, exact: true })).toBeVisible();
  315 |     }
  316 |     const viewportMetrics = await page.evaluate(() => ({
  317 |       viewportWidth: window.innerWidth,
  318 |       viewportHeight: window.innerHeight,
  319 |       documentWidth: document.documentElement.scrollWidth,
  320 |       navigationHeight: document
  321 |         .querySelector('nav[aria-label="Mobile Workbench"]')
  322 |         ?.getBoundingClientRect().height,
  323 |       shellHeight: document
  324 |         .querySelector('[data-testid="mobile-workbench"]')
  325 |         ?.getBoundingClientRect().height,
  326 |     }));
  327 |     expect(viewportMetrics.documentWidth).toBeLessThanOrEqual(viewportMetrics.viewportWidth);
  328 |     expect(viewportMetrics.navigationHeight).toBe(64);
  329 |     expect(viewportMetrics.shellHeight).toBe(viewportMetrics.viewportHeight);
  330 |     evidence.checks.shell = viewportMetrics;
  331 |     await mkdir(path.resolve(process.cwd(), 'quality/evidence/step-17/after'), { recursive: true });
  332 |     await page.screenshot({
  333 |       path: path.resolve(
  334 |         process.cwd(),
  335 |         'quality/evidence/step-17/after/workbench-mobile-initial.png'
  336 |       ),
  337 |       fullPage: true,
  338 |     });
  339 |
  340 |     const firstScreen = await page.locator('.tess-screen').getAttribute('data-screen-id');
  341 |     await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
  342 |     await expect(page.getByTestId('pages-tab')).toBeVisible();
  343 |     await expect(page.getByTestId('layers-tab')).toBeVisible();
  344 |     const pageButtons = page
  345 |       .getByTestId('pages-tab')
  346 |       .locator('button[aria-label^="Select screen "]');
  347 |     const pageNames = await pageButtons.evaluateAll((buttons) =>
  348 |       buttons.map((button) => button.getAttribute('aria-label'))
  349 |     );
  350 |     expect(pageNames.length).toBeGreaterThanOrEqual(3);
  351 |     await expect(pageButtons.last()).toHaveAttribute(
  352 |       'aria-label',
  353 |       'Select screen Settings & Policies'
  354 |     );
  355 |     await pageButtons.last().click();
  356 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  357 |     await expect(page.locator('.tess-screen')).not.toHaveAttribute(
  358 |       'data-screen-id',
  359 |       firstScreen ?? ''
  360 |     );
  361 |     const selectedScreen = await page.locator('.tess-screen').getAttribute('data-screen-id');
  362 |
  363 |     const disabledAction = page.getByRole('button', {
  364 |       name: 'Explore Interface System →',
  365 |       exact: true,
  366 |     });
  367 |     await expect(disabledAction).toBeDisabled();
  368 |     const disabledActionContext = await disabledAction.evaluate((button) => {
  369 |       const node = button.closest<HTMLElement>('[data-node-id][data-node-type]');
  370 |       const bounds = button.getBoundingClientRect();
  371 |       return {
  372 |         nodeId: node?.dataset.nodeId,
  373 |         nodeType: node?.dataset.nodeType,
  374 |         x: bounds.x + bounds.width / 2,
  375 |         y: bounds.y + bounds.height / 2,
  376 |       };
  377 |     });
  378 |     expect(disabledActionContext.nodeId).toBeTruthy();
  379 |     expect(disabledActionContext.nodeType).toBe('component');
  380 |     await page.mouse.click(disabledActionContext.x, disabledActionContext.y);
  381 |     await expect(
  382 |       page
  383 |         .getByTestId('right-inspector')
  384 |         .getByText(`Node: ${disabledActionContext.nodeType}`)
> 385 |     ).toBeVisible();
      |       ^ Error: expect(locator).toBeVisible() failed
  386 |     await expect(
  387 |       mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
  388 |     ).toHaveAttribute('aria-pressed', 'true');
  389 |     const disabledSelectionScreenshot = path.resolve(
  390 |       process.cwd(),
  391 |       'quality/evidence/step-17/after/disabled-resource-canvas-selection-mobile-390x844.png'
  392 |     );
  393 |     await page.screenshot({ path: disabledSelectionScreenshot, fullPage: true });
  394 |     evidence.checks.disabledControlSelection = {
  395 |       nodeId: disabledActionContext.nodeId,
  396 |       nodeType: disabledActionContext.nodeType,
  397 |       inspectorOpened: true,
  398 |       screenshot: path.relative(process.cwd(), disabledSelectionScreenshot),
  399 |     };
  400 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  401 |
  402 |     const component = page.locator('.tess-screen [data-node-type="component"]').first();
  403 |     const componentId = await component.getAttribute('data-node-id');
  404 |     expect(componentId).toBeTruthy();
  405 |     const elementId = await page
  406 |       .locator('.tess-screen [data-node-type="element"]')
  407 |       .first()
  408 |       .getAttribute('data-node-id');
  409 |     expect(elementId).toBeTruthy();
  410 |     await component.click();
  411 |     await expect(page.getByTestId('right-inspector').getByText('Node: component')).toBeVisible();
  412 |     await expect(
  413 |       mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
  414 |     ).toHaveAttribute('aria-pressed', 'true');
  415 |
  416 |     await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
  417 |     await page.getByTestId(`layer-node-${elementId}`).click();
  418 |     await mobileNavigation.getByRole('button', { name: 'Inspect', exact: true }).click();
  419 |     await expect(page.getByTestId('right-inspector').getByText('Node: element')).toBeVisible();
  420 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  421 |     await expect(page.locator('.tess-screen [data-node-id]').first()).toBeVisible();
  422 |     await mobileNavigation.getByRole('button', { name: 'Command', exact: true }).click();
  423 |     await expect(
  424 |       page.getByTestId('command-bar').getByRole('textbox', { name: 'Tessellate command' })
  425 |     ).toBeVisible();
  426 |     await mobileNavigation.getByRole('button', { name: 'Audit', exact: true }).click();
  427 |     await expect(page.getByTestId('audit-panel')).toBeVisible();
  428 |     await page
  429 |       .getByTestId('top-toolbar')
  430 |       .getByRole('button', { name: 'motion', exact: true })
  431 |       .click();
  432 |     await expect(page.getByTestId('right-inspector').getByTestId('motion-tab')).toBeVisible();
  433 |     await expect(
  434 |       mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
  435 |     ).toHaveAttribute('aria-pressed', 'true');
  436 |     await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
  437 |
  438 |     await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  439 |     await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
  440 |       0
  441 |     );
  442 |     evidence.checks.navigation = {
  443 |       pages: pageNames,
  444 |       firstScreen,
  445 |       selectedScreen,
  446 |       selectedComponent: componentId,
  447 |       selectedElement: elementId,
  448 |       tabs: ['Preview', 'Pages', 'Inspect', 'Command', 'Audit'],
  449 |     };
  450 |   } finally {
  451 |     await saveEvidence(page, evidence, testInfo);
  452 |   }
  453 |
  454 |   expect(evidence.consoleErrors).toEqual([]);
  455 |   expect(evidence.uncaughtExceptions).toEqual([]);
  456 |   expect(evidence.failedRequests).toEqual([]);
  457 |   expect(evidence.httpErrors).toEqual([]);
  458 | });
  459 |
```
