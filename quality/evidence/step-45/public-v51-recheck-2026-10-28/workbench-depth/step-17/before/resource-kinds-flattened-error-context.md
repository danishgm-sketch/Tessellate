# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workbench-fundamentals-hardening.spec.ts >> desktop Workbench selection, panels, canvas controls, and keyboard stay in sync
- Location: tests\e2e\workbench-fundamentals-hardening.spec.ts:67:1

# Error details

```
TimeoutError: locator.getAttribute: Timeout 10000ms exceeded.
Call log:
  - waiting for getByTestId('workbench-canvas').locator('[data-node-type="component"]').first()

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - link "T" [ref=f1e6] [cursor=pointer]:
        - /url: /
      - button "Adaptive Architecture — Employee experience" [ref=f1e9]
      - generic [ref=f1e10]: Local
    - generic [ref=f1e16]:
      - link "Compose" [ref=f1e17] [cursor=pointer]:
        - /url: /compose
      - button "structure" [pressed] [ref=f1e21]
      - button "style" [ref=f1e22]
      - button "motion" [ref=f1e23]
      - button "content" [ref=f1e24]
      - button "audit" [ref=f1e25]
    - generic [ref=f1e26]:
      - generic [ref=f1e27]:
        - button "Recompose" [ref=f1e28]
        - button "Surprise" [ref=f1e35]
        - button "Blend" [ref=f1e43]
        - button "Compare" [ref=f1e47]
        - button "Snapshots (1)" [ref=f1e53]
      - generic [ref=f1e58]:
        - button "Undo" [disabled] [ref=f1e59]
        - button "Redo" [disabled] [ref=f1e63]
      - button "Preview" [ref=f1e68]
      - button "Export" [ref=f1e74]
  - generic [ref=f1e81]:
    - complementary [ref=f1e82]:
      - generic [ref=f1e83]:
        - button "Layers" [ref=f1e84]
        - button "Pages" [ref=f1e90]
        - button "Library" [ref=f1e95]
        - button "Brief" [ref=f1e99]
      - generic [ref=f1e104]:
        - generic [ref=f1e105]: Semantic Tree (Settings & Policies)
        - tree "Semantic layers" [ref=f1e107]:
          - generic [ref=f1e108]:
            - treeitem "Collapse workspace-dock-shell workspace-dock-shell DNA Lock workspace-dock-shell" [active] [selected] [ref=f1e109] [cursor=pointer]:
              - generic [ref=f1e110]:
                - button "Collapse workspace-dock-shell" [expanded] [ref=f1e111]
                - generic [ref=f1e116]: workspace-dock-shell
                - generic "Has local DNA overrides" [ref=f1e117]: DNA
              - button "Lock workspace-dock-shell" [ref=f1e121]
            - generic [ref=f1e125]:
              - treeitem "navigation minimal-top-nav Lock navigation" [ref=f1e127] [cursor=pointer]:
                - generic [ref=f1e128]:
                  - generic [ref=f1e131]: navigation
                  - generic [ref=f1e132]: minimal-top-nav
                - button "Lock navigation" [ref=f1e134]
              - generic [ref=f1e138]:
                - treeitem "Collapse workspace-multi-pane workspace-multi-pane Lock workspace-multi-pane" [ref=f1e139] [cursor=pointer]:
                  - generic [ref=f1e140]:
                    - button "Collapse workspace-multi-pane" [expanded] [ref=f1e141]
                    - generic [ref=f1e146]: workspace-multi-pane
                  - button "Lock workspace-multi-pane" [ref=f1e148]
                - generic [ref=f1e152]:
                  - treeitem "settings-nav minimal-top-nav Lock settings-nav" [ref=f1e154] [cursor=pointer]:
                    - generic [ref=f1e155]:
                      - generic [ref=f1e160]: settings-nav
                      - generic [ref=f1e161]: minimal-top-nav
                    - button "Lock settings-nav" [ref=f1e163]
                  - treeitem "Settings & Policies input Lock Settings & Policies" [ref=f1e168] [cursor=pointer]:
                    - generic [ref=f1e169]:
                      - generic [ref=f1e174]: Settings & Policies
                      - generic [ref=f1e175]: input
                    - button "Lock Settings & Policies" [ref=f1e177]
                  - treeitem "Connect the exported application to your backend to enable this action. magnetic-button Lock Connect the exported application to your backend to enable this action." [ref=f1e182] [cursor=pointer]:
                    - generic [ref=f1e183]:
                      - generic [ref=f1e188]: Connect the exported application to your backend to enable this action.
                      - generic [ref=f1e189]: magnetic-button
                    - button "Lock Connect the exported application to your backend to enable this action." [ref=f1e191]
    - generic [ref=f1e195]:
      - generic [ref=f1e197]:
        - button "Settings & Policies" [ref=f1e198]
        - button "workspace-dock-shell" [ref=f1e205]
        - generic [ref=f1e207]: (Esc to climb)
      - generic [ref=f1e209]:
        - generic [ref=f1e210]:
          - button "Fluid" [ref=f1e211]
          - button "1440" [ref=f1e218]
          - button "1280" [ref=f1e222]
          - button "1024" [ref=f1e226]
          - button "768" [ref=f1e230]
          - button "430" [ref=f1e234]
          - button "360" [ref=f1e238]
          - button "390" [ref=f1e242]
        - generic [ref=f1e247]:
          - button "Zoom Out" [ref=f1e248]
          - generic [ref=f1e252]: 100%
          - button "Zoom In" [ref=f1e253]
          - button "100%" [ref=f1e257]
        - button "Motion" [ref=f1e259]
        - button "Preview" [ref=f1e265]
      - generic [ref=f1e274]:
        - banner [ref=f1e276]:
          - generic [ref=f1e278]:
            - generic [ref=f1e279]: People & Teams
            - navigation "Product screens" [ref=f1e282]:
              - link "Marketing Home" [ref=f1e283] [cursor=pointer]:
                - /url: "#screen-marketing-home"
              - link "Team Overview" [ref=f1e284] [cursor=pointer]:
                - /url: "#screen-overview"
              - link "People Directory" [ref=f1e285] [cursor=pointer]:
                - /url: "#screen-collection-index"
              - link "Teams" [ref=f1e286] [cursor=pointer]:
                - /url: "#screen-teams"
              - link "Engagement" [ref=f1e287] [cursor=pointer]:
                - /url: "#screen-engagement"
              - link "Settings & Policies" [ref=f1e288] [cursor=pointer]:
                - /url: "#screen-settings"
        - generic [ref=f1e289]:
          - banner [ref=f1e291]:
            - generic [ref=f1e293]:
              - generic [ref=f1e294]: People & Teams
              - navigation "Product screens" [ref=f1e297]:
                - link "Marketing Home" [ref=f1e298] [cursor=pointer]:
                  - /url: "#screen-marketing-home"
                - link "Team Overview" [ref=f1e299] [cursor=pointer]:
                  - /url: "#screen-overview"
                - link "People Directory" [ref=f1e300] [cursor=pointer]:
                  - /url: "#screen-collection-index"
                - link "Teams" [ref=f1e301] [cursor=pointer]:
                  - /url: "#screen-teams"
                - link "Engagement" [ref=f1e302] [cursor=pointer]:
                  - /url: "#screen-engagement"
                - link "Settings & Policies" [ref=f1e303] [cursor=pointer]:
                  - /url: "#screen-settings"
          - generic [ref=f1e305]:
            - generic [ref=f1e306]: Notification preferences
            - textbox "Notification preferences" [ref=f1e307]
            - paragraph [ref=f1e308]: Example field. Connect persistence and your backend in the exported application.
          - generic [ref=f1e310]:
            - button "Explore Interface System →" [disabled] [ref=f1e311]
            - generic [ref=f1e312]: Connect an action before enabling this button.
    - complementary [ref=f1e313]:
      - generic [ref=f1e314]:
        - generic [ref=f1e315]:
          - generic [ref=f1e316]: "Node: layout"
          - generic [ref=f1e317]: workspace-dock-shell
        - generic [ref=f1e318]:
          - button "Reset" [ref=f1e319]
          - button "Deselect Node" [ref=f1e324]
      - generic [ref=f1e328]:
        - button "Intent" [ref=f1e329]
        - button "Style" [ref=f1e333]
        - button "Motion" [ref=f1e341]
        - button "Content" [ref=f1e345]
        - button "Locks" [ref=f1e349]
        - button "Resource" [ref=f1e353]
      - group [ref=f1e360]:
        - group [ref=f1e362]:
          - generic [ref=f1e363]:
            - generic [ref=f1e364]: Feel Mixer (5 Pinned Traits)
            - button "Reset to Inherited" [ref=f1e367]
          - generic [ref=f1e372]:
            - generic [ref=f1e373]:
              - generic [ref=f1e374]:
                - generic [ref=f1e375]: Professionalism
                - generic [ref=f1e376]:
                  - generic [ref=f1e377]: overridden
                  - generic [ref=f1e378]: "96"
              - slider "Professionalism" [ref=f1e379] [cursor=pointer]: "96"
            - generic [ref=f1e380]:
              - generic [ref=f1e381]:
                - generic [ref=f1e382]: Playfulness
                - generic [ref=f1e383]:
                  - generic [ref=f1e384]: overridden
                  - generic [ref=f1e385]: "8"
              - slider "Playfulness" [ref=f1e386] [cursor=pointer]: "8"
            - generic [ref=f1e387]:
              - generic [ref=f1e388]:
                - generic [ref=f1e389]: Warmth
                - generic [ref=f1e390]:
                  - generic [ref=f1e391]: inherited
                  - generic [ref=f1e392]: "45"
              - slider "Warmth" [ref=f1e393] [cursor=pointer]: "45"
            - generic [ref=f1e394]:
              - generic [ref=f1e395]:
                - generic [ref=f1e396]: Technicality
                - generic [ref=f1e397]:
                  - generic [ref=f1e398]: inherited
                  - generic [ref=f1e399]: "65"
              - slider "Technicality" [ref=f1e400] [cursor=pointer]: "65"
            - generic [ref=f1e401]:
              - generic [ref=f1e402]:
                - generic [ref=f1e403]: Luxury
                - generic [ref=f1e404]:
                  - generic [ref=f1e405]: inherited
                  - generic [ref=f1e406]: "40"
              - slider "Luxury" [ref=f1e407] [cursor=pointer]: "40"
          - generic [ref=f1e408]:
            - generic [ref=f1e409]: Add Trait or Feel Phrase
            - generic [ref=f1e410]:
              - textbox "Feel phrase" [ref=f1e411]:
                - /placeholder: e.g. professional but playful, dense and technical
              - button "Apply" [ref=f1e412]
        - generic [ref=f1e414]:
          - generic [ref=f1e415]:
            - generic [ref=f1e416]: Visual Ambition
            - generic [ref=f1e421]:
              - generic [ref=f1e422]: Inherited
              - generic [ref=f1e423]: "40"
          - slider "Visual Ambition" [ref=f1e424] [cursor=pointer]: "40"
          - generic [ref=f1e425]:
            - generic [ref=f1e426]: Refined
            - paragraph [ref=f1e427]: Sophisticated spacing/typography, subtle motion, stronger visual hierarchy, and restrained distinctive details.
        - generic [ref=f1e429]:
          - generic [ref=f1e430]:
            - generic [ref=f1e431]: Structural Creativity
            - generic [ref=f1e436]:
              - generic [ref=f1e437]: Inherited
              - generic [ref=f1e438]: "95"
          - slider "Structural Creativity" [ref=f1e439] [cursor=pointer]: "95"
          - generic [ref=f1e440]:
            - generic [ref=f1e441]: Experimental
            - paragraph [ref=f1e442]: Permission to explore unconventional information architecture and spatial models while respecting explicit constraints.
            - paragraph [ref=f1e443]: Guides composition and replacement matching. This setting does not reorder the current screen by itself.
  - generic [ref=f1e444]:
    - generic [ref=f1e445]:
      - generic [ref=f1e446]: workspace-dock-shell
      - textbox "Tessellate command" [ref=f1e451]:
        - /placeholder: Tell Tess what to change on workspace-dock-shell… (e.g. recompose, replace, lock, reduce motion)
      - button "Execute command" [ref=f1e452]
    - switch "Laptop model Lab" [disabled] [ref=f1e456]:
      - generic [ref=f1e457]: Laptop model
      - generic [ref=f1e458]: Lab
      - generic [ref=f1e459]: "Off"
    - status "Host features require this laptop and Docker. Local deterministic controls remain available." [ref=f1e460]: Backend offline
    - generic [ref=f1e461]: The experimental laptop model is off by default. When enabled, its proposed mutations are not applied until you review and confirm them.
    - status [ref=f1e462]:
      - generic [ref=f1e463]:
        - generic [ref=f1e464]: Press Esc climb parent
        - generic [ref=f1e465]: / command
```

# Test source

```ts
  66  |
  67  | test('desktop Workbench selection, panels, canvas controls, and keyboard stay in sync', async ({
  68  |   page,
  69  |   isMobile,
  70  | }, testInfo) => {
  71  |   test.skip(isMobile, 'Desktop Workbench fundamentals are exercised at 1440×900');
  72  |   const evidence: RuntimeEvidence = {
  73  |     id: 'STEP-17-DESKTOP',
  74  |     viewport: testInfo.project.use.viewport as { width: number; height: number },
  75  |     url: '',
  76  |     consoleErrors: [],
  77  |     consoleWarnings: [],
  78  |     uncaughtExceptions: [],
  79  |     failedRequests: [],
  80  |     httpErrors: [],
  81  |     checks: {},
  82  |   };
  83  |   captureRuntime(page, evidence);
  84  |
  85  |   try {
  86  |     await openDirectionC(page);
  87  |     await expect(page.getByTestId('workbench-shell')).toBeVisible();
  88  |     await expect(page.getByTestId('left-panel')).toBeVisible();
  89  |     await expect(page.getByTestId('workbench-canvas')).toBeVisible();
  90  |     await expect(page.getByTestId('right-inspector')).toBeVisible();
  91  |     await expect(page.getByTestId('command-bar')).toBeVisible();
  92  |
  93  |     const shellMetrics = await page.evaluate(() => ({
  94  |       viewportWidth: window.innerWidth,
  95  |       documentWidth: document.documentElement.scrollWidth,
  96  |       leftPanelWidth: document.querySelector('[data-testid="left-panel"]')?.getBoundingClientRect()
  97  |         .width,
  98  |       rightPanelWidth: document
  99  |         .querySelector('[data-testid="right-inspector"]')
  100 |         ?.getBoundingClientRect().width,
  101 |       canvasWidth: document
  102 |         .querySelector('[data-testid="workbench-canvas"]')
  103 |         ?.getBoundingClientRect().width,
  104 |     }));
  105 |     expect(shellMetrics.documentWidth).toBeLessThanOrEqual(shellMetrics.viewportWidth);
  106 |     expect(shellMetrics.leftPanelWidth).toBe(280);
  107 |     expect(shellMetrics.rightPanelWidth).toBe(340);
  108 |     expect(shellMetrics.canvasWidth).toBeGreaterThan(0);
  109 |     evidence.checks.shell = shellMetrics;
  110 |     await mkdir(path.resolve(process.cwd(), 'quality/evidence/step-17/after'), { recursive: true });
  111 |     await page.screenshot({
  112 |       path: path.resolve(
  113 |         process.cwd(),
  114 |         'quality/evidence/step-17/after/workbench-desktop-initial.png'
  115 |       ),
  116 |       fullPage: true,
  117 |     });
  118 |
  119 |     const leftPanel = page.getByTestId('left-panel');
  120 |     for (const [tab, testId] of [
  121 |       ['Brief', 'brief-tab'],
  122 |       ['Pages', 'pages-tab'],
  123 |       ['Layers', 'layers-tab'],
  124 |       ['Library', 'library-tab'],
  125 |     ]) {
  126 |       await leftPanel.getByRole('button', { name: tab, exact: true }).click();
  127 |       await expect(page.getByTestId(testId)).toBeVisible();
  128 |     }
  129 |
  130 |     await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  131 |     const pageButtons = page
  132 |       .getByTestId('pages-tab')
  133 |       .locator('button[aria-label^="Select screen "]');
  134 |     const pageLabels = await pageButtons.evaluateAll((buttons) =>
  135 |       buttons.map((button) => button.getAttribute('aria-label'))
  136 |     );
  137 |     expect(pageLabels.length).toBeGreaterThanOrEqual(3);
  138 |     const initialScreenId = await page
  139 |       .locator('[data-testid="workbench-canvas"] [data-screen-id]')
  140 |       .getAttribute('data-screen-id');
  141 |     const settingsScreen = pageButtons.last();
  142 |     await expect(settingsScreen).toHaveAttribute('aria-label', 'Select screen Settings & Policies');
  143 |     await settingsScreen.click();
  144 |     await expect(
  145 |       page.locator('[data-testid="workbench-canvas"] [data-screen-id]')
  146 |     ).not.toHaveAttribute('data-screen-id', initialScreenId ?? '');
  147 |     const selectedScreenId = await page
  148 |       .locator('[data-testid="workbench-canvas"] [data-screen-id]')
  149 |       .getAttribute('data-screen-id');
  150 |     expect(selectedScreenId).toBeTruthy();
  151 |     await expect(page.getByTestId('right-inspector').getByText('Project Scope')).toBeVisible();
  152 |
  153 |     await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  154 |     const tree = page.getByRole('tree', { name: 'Semantic layers' });
  155 |     const canvas = page.getByTestId('workbench-canvas');
  156 |     const rootId = await canvas
  157 |       .locator('.tess-screen > [data-node-id]')
  158 |       .first()
  159 |       .getAttribute('data-node-id');
  160 |     expect(rootId).toBeTruthy();
  161 |     await page.getByTestId(`layer-node-${rootId}`).focus();
  162 |     await page.keyboard.press('Enter');
  163 |     await expect(page.getByTestId('right-inspector').getByText('Node: layout')).toBeVisible();
  164 |
  165 |     const component = canvas.locator('[data-node-type="component"]').first();
> 166 |     const componentId = await component.getAttribute('data-node-id');
      |                                         ^ TimeoutError: locator.getAttribute: Timeout 10000ms exceeded.
  167 |     expect(componentId).toBeTruthy();
  168 |     await page.getByTestId(`layer-node-${componentId}`).click();
  169 |     await expect(page.getByTestId('right-inspector').getByText('Node: component')).toBeVisible();
  170 |     const element = canvas.locator('[data-node-type="element"]').first();
  171 |     const elementId = await element.getAttribute('data-node-id');
  172 |     expect(elementId).toBeTruthy();
  173 |     await page.getByTestId(`layer-node-${elementId}`).click();
  174 |     await expect(page.getByTestId('right-inspector').getByText('Node: element')).toBeVisible();
  175 |     const breadcrumb = page.getByTestId('breadcrumb-bar');
  176 |     const beforeEscape = await breadcrumb.innerText();
  177 |     await page.keyboard.press('Escape');
  178 |     await expect(page.getByTestId('right-inspector').getByText(/Node:/)).toBeVisible();
  179 |     const afterEscape = await breadcrumb.innerText();
  180 |     expect(afterEscape.length).toBeLessThan(beforeEscape.length);
  181 |     for (let count = 0; count < 8; count += 1) {
  182 |       if (await page.getByTestId('right-inspector').getByText('Project Scope').isVisible()) break;
  183 |       await page.keyboard.press('Escape');
  184 |     }
  185 |     await expect(page.getByTestId('right-inspector').getByText('Project Scope')).toBeVisible();
  186 |
  187 |     await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  188 |     await pageButtons.first().click();
  189 |     const marketingScreenId = await page
  190 |       .locator('[data-testid="workbench-canvas"] [data-screen-id]')
  191 |       .getAttribute('data-screen-id');
  192 |     await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  193 |     const section = canvas.locator('[data-node-type="section"]').first();
  194 |     const sectionId = await section.getAttribute('data-node-id');
  195 |     expect(sectionId).toBeTruthy();
  196 |     await page.getByTestId(`layer-node-${sectionId}`).click();
  197 |     await expect(page.getByTestId('right-inspector').getByText('Node: section')).toBeVisible();
  198 |     evidence.checks.selection = {
  199 |       screens: pageLabels,
  200 |       selectedScreenId,
  201 |       marketingScreenId,
  202 |       rootId,
  203 |       sectionId,
  204 |       componentId,
  205 |       elementId,
  206 |       breadcrumbBeforeEscape: beforeEscape,
  207 |       breadcrumbAfterEscape: afterEscape,
  208 |     };
  209 |     expect(await tree.getByRole('treeitem').count()).toBeGreaterThan(5);
  210 |
  211 |     const topToolbar = page.getByTestId('top-toolbar');
  212 |     for (const [mode, testId] of [
  213 |       ['structure', 'intent-tab'],
  214 |       ['style', 'style-tab'],
  215 |       ['motion', 'motion-tab'],
  216 |       ['content', 'content-tab'],
  217 |       ['audit', 'audit-panel'],
  218 |     ]) {
  219 |       await topToolbar.getByRole('button', { name: mode, exact: true }).click();
  220 |       await expect(page.getByTestId(testId)).toBeVisible();
  221 |       await expect(topToolbar.getByRole('button', { name: mode, exact: true })).toHaveAttribute(
  222 |         'aria-pressed',
  223 |         'true'
  224 |       );
  225 |     }
  226 |     await topToolbar.getByRole('button', { name: 'structure', exact: true }).click();
  227 |
  228 |     const canvasToolbar = page.getByTestId('canvas-toolbar');
  229 |     await canvasToolbar.getByRole('button', { name: 'Zoom In' }).click();
  230 |     await expect(canvasToolbar.getByText('110%')).toBeVisible();
  231 |     await page.keyboard.press('f');
  232 |     await expect(canvasToolbar.getByText('100%', { exact: true }).first()).toBeVisible();
  233 |     await page.keyboard.press('1');
  234 |     await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'desktop');
  235 |     await page.keyboard.press('2');
  236 |     await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'tablet');
  237 |     await page.keyboard.press('3');
  238 |     await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'mobile');
  239 |     await canvasToolbar.getByRole('button', { name: 'Fluid' }).click();
  240 |     await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'desktop');
  241 |     await canvasToolbar.getByRole('button', { name: '768' }).click();
  242 |     await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'tablet');
  243 |     await canvasToolbar.getByRole('button', { name: '1440' }).click();
  244 |     await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'desktop');
  245 |     const deviceFrame = canvas
  246 |       .locator('div.mx-auto.flex.flex-col.shrink-0[style*="1440px"]')
  247 |       .first();
  248 |     await expect
  249 |       .poll(async () =>
  250 |         Number.parseFloat(
  251 |           await deviceFrame.evaluate((node) => getComputedStyle(node).width)
  252 |         ),
  253 |         { timeout: 1000 }
  254 |       )
  255 |       .toBe(1440);
  256 |     const frameMetrics = await deviceFrame.evaluate((node) => ({
  257 |       inlineStyle: node.getAttribute('style'),
  258 |       className: node.className,
  259 |       computedWidth: getComputedStyle(node).width,
  260 |       maxWidth: getComputedStyle(node).maxWidth,
  261 |       flexShrink: getComputedStyle(node).flexShrink,
  262 |       offsetWidth: (node as HTMLElement).offsetWidth,
  263 |       rectWidth: node.getBoundingClientRect().width,
  264 |       parentWidth: node.parentElement?.getBoundingClientRect().width,
  265 |       parentClass: node.parentElement?.className,
  266 |     }));
```
