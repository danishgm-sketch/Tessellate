# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive-hardening-step-36.spec.ts >> phone Workbench keeps the project name and save status inside the toolbar
- Location: tests/e2e/responsive-hardening-step-36.spec.ts:253:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('top-toolbar').getByRole('button', { name: 'Example employee workspace' })
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" getByTestId('top-toolbar').getByRole('button', { name: 'Example employee workspace' }) with timeout 5000ms
  - waiting for getByTestId('top-toolbar').getByRole('button', { name: 'Example employee workspace' })
    14 × locator resolved to <button title="Click to rename project" class="min-w-0 max-w-[220px] flex-1 truncate text-sm font-bold text-[#111217] dark:text-[#F5F7FA] hover:text-[#2547E8] transition-colors">Example employee workspace</button>
       - unexpected value "hidden"

```

```yaml
- link "Skip to editor":
  - /url: "#workbench-main"
- banner:
  - link "T":
    - /url: /
  - button "Example employee workspace"
  - img
  - text: Local Saved
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
- main "Workbench editor":
  - 'heading "Workbench: Example employee workspace" [level=1]'
  - text: People & Co
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
  - text: Example organisation · sample content
  - heading "A better workday starts with people." [level=1]
  - paragraph: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
  - link "Meet your team":
    - /url: "#screen-teams"
  - link "Explore onboarding":
    - /url: "#screen-onboarding"
  - paragraph: Example interface · replace sample data with your organisation
  - heading "Made for everyday employee experiences" [level=2]
  - text: Flagship Feature
  - heading "A warm welcome" [level=3]
  - paragraph: Meet your buddy, discover your team and complete onboarding at your own pace.
  - text: Onboarding Everyday experience
  - heading "People, connected" [level=3]
  - paragraph: Find colleagues and understand the teams around you.
  - text: People directory
  - heading "A voice for everyone" [level=3]
  - paragraph: Make space for feedback, recognition and conversations.
  - text: Engagement
  - heading "Clarity you can trust" [level=3]
  - paragraph: Keep organisational policies and account preferences easy to find.
  - heading "A better workday starts with people." [level=2]
  - paragraph: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
  - link "Meet your team →":
    - /url: "#screen-teams"
  - text: People & Co
  - paragraph: Bring your people, teams and everyday employee experiences together. A warm welcome, clear priorities and trusted policies.
  - text: Example interface Explore
  - list:
    - listitem:
      - link "Marketing Home":
        - /url: "#screen-marketing-home"
    - listitem:
      - link "Team Overview":
        - /url: "#screen-overview"
    - listitem:
      - link "People Directory":
        - /url: "#screen-collection-index"
    - listitem:
      - link "Teams":
        - /url: "#screen-teams"
    - listitem:
      - link "Engagement":
        - /url: "#screen-engagement"
    - listitem:
      - link "Settings & Policies":
        - /url: "#screen-settings"
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
  238 |     const lineCount = await action.locator('span').evaluate((element) => {
  239 |       const range = document.createRange();
  240 |       range.selectNodeContents(element);
  241 |       return range.getClientRects().length;
  242 |     });
  243 |     expect(lineCount, `Start building should remain on one line at ${width}px`).toBe(1);
  244 |     const bounds = await action.boundingBox();
  245 |     expect(bounds).not.toBeNull();
  246 |     expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
  247 |     evidence.push({ viewport: width, lineCount, bounds, horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
  248 |     if (width === 360) await page.screenshot({ path: path.join(evidenceDir, 'phone-header-360.png'), animations: 'disabled' });
  249 |   }
  250 |   writeFileSync(path.join(evidenceDir, 'phone-header.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  251 | });
  252 |
  253 | test('phone Workbench keeps the project name and save status inside the toolbar', async ({ page }) => {
  254 |   for (const width of [360, 390, 430]) {
  255 |     await page.setViewportSize({ width, height: 844 });
  256 |     await page.goto('/workbench/');
  257 |     await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  258 |     const toolbar = page.getByTestId('top-toolbar');
  259 |     const projectName = toolbar.getByRole('button', { name: 'Example employee workspace' });
  260 |     const saveStatus = page.getByTestId('history-save-status');
> 261 |     await expect(projectName).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  262 |     await expect(saveStatus).toBeVisible();
  263 |     const dimensions = await page.evaluate(() => {
  264 |       const toolbarElement = document.querySelector('[data-testid="top-toolbar"]')!;
  265 |       const project = toolbarElement.querySelector('button')!;
  266 |       const status = toolbarElement.querySelector('[data-testid="history-save-status"]')!;
  267 |       const rect = (element: Element) => {
  268 |         const bounds = element.getBoundingClientRect();
  269 |         return { left: Math.round(bounds.left), right: Math.round(bounds.right), width: Math.round(bounds.width) };
  270 |       };
  271 |       return { viewport: document.documentElement.clientWidth, toolbar: rect(toolbarElement), project: rect(project), status: rect(status) };
  272 |     });
  273 |     expect(dimensions.project.left).toBeGreaterThanOrEqual(-1);
  274 |     expect(dimensions.project.right).toBeLessThanOrEqual(width + 1);
  275 |     expect(dimensions.status.right, `save status should remain visible at ${width}px`).toBeLessThanOrEqual(width + 1);
  276 |     const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/interactions');
  277 |     mkdirSync(evidenceDir, { recursive: true });
  278 |     if (width === 360) await page.screenshot({ path: path.join(evidenceDir, 'workbench-status-360.png'), animations: 'disabled' });
  279 |   }
  280 | });
  281 |
  282 | test('Compose remains actionable across phone, tablet and desktop widths', async ({ page }) => {
  283 |   for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1536]) {
  284 |     await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
  285 |     await page.goto('/compose/');
  286 |     await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  287 |     const brief = page.getByLabel('Product Description & Objectives');
  288 |     await expect(brief).toBeVisible();
  289 |     await brief.fill('A people platform for a technology company, with teams, onboarding, and employee resources.');
  290 |     const submit = page.getByTestId('compose-submit-btn');
  291 |     await expect(submit).toBeEnabled();
  292 |     const bounds = await submit.boundingBox();
  293 |     expect(bounds).not.toBeNull();
  294 |     expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  295 |     expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
  296 |     await submit.click();
  297 |     await expect(page.getByTestId('open-workbench-dir-03')).toBeVisible({ timeout: 30000 });
  298 |     for (const suffix of ['01', '02', '03']) {
  299 |       const direction = page.getByTestId(`open-workbench-dir-${suffix}`);
  300 |       await expect(direction).toBeVisible();
  301 |       const directionBounds = await direction.boundingBox();
  302 |       expect(directionBounds).not.toBeNull();
  303 |       expect(directionBounds!.x).toBeGreaterThanOrEqual(-1);
  304 |       expect(directionBounds!.x + directionBounds!.width).toBeLessThanOrEqual(width + 1);
  305 |     }
  306 |     const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/compose-workflows');
  307 |     mkdirSync(evidenceDir, { recursive: true });
  308 |     await page.getByTestId('open-workbench-dir-03').scrollIntoViewIfNeeded();
  309 |     await page.screenshot({ path: path.join(evidenceDir, `compose-${width}.png`), animations: 'disabled' });
  310 |   }
  311 | });
  312 |
```
