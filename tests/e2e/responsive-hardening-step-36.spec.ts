import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 900 },
  { width: 1536, height: 960 },
];

const surfaces = [
  '/',
  '/explore/',
  '/compose/',
  '/workbench/',
  '/r/button/',
  '/tools/',
  '/tools/accessibility/',
  '/blueprints/',
  '/blueprints/ai-product/',
  '/showcases/',
  '/showcase/showcase-playful-hr/',
  '/docs/',
  '/docs/cli/',
  '/about/',
];

async function waitForSurface(page: import('@playwright/test').Page, route: string) {
  if (route === '/explore/') {
    await expect(page.getByRole('textbox', { name: 'Search catalogue' })).toBeVisible();
    await expect(page.getByText(/Showing 50 of 324 resources/)).toBeVisible();
    return;
  }
  if (route === '/compose/') {
    await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
    await expect(page.getByTestId('compose-submit-btn')).toBeVisible();
    return;
  }
  if (route === '/workbench/') {
    await expect(page.getByRole('main', { name: 'Workbench editor' })).toBeVisible();
    return;
  }
  const main = page.locator('main').first();
  await expect(main).toBeVisible();
  await expect(main.locator('h1, h2').first()).toBeAttached();
}

test('major product surfaces fit and retain their primary content at every required width', async ({ page }, testInfo) => {
  test.setTimeout(10 * 60 * 1000);
  const evidence: Array<Record<string, unknown>> = [];
  const evidenceDir = path.resolve(process.cwd(), `quality/evidence/step-36/${testInfo.project.name}`);
  mkdirSync(evidenceDir, { recursive: true });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of surfaces) {
      const runtime = { consoleErrors: [] as string[], pageErrors: [] as string[], failedRequests: [] as string[], httpErrors: [] as string[] };
      const onConsole = (message: import('@playwright/test').ConsoleMessage) => { if (message.type() === 'error') runtime.consoleErrors.push(message.text()); };
      const onPageError = (error: Error) => runtime.pageErrors.push(error.message);
      const onRequestFailed = (request: import('@playwright/test').Request) => runtime.failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'unknown failure'}`);
      const onResponse = (response: import('@playwright/test').Response) => { if (response.status() >= 400) runtime.httpErrors.push(`${response.status()} ${response.url()}`); };
      page.on('console', onConsole);
      page.on('pageerror', onPageError);
      page.on('requestfailed', onRequestFailed);
      page.on('response', onResponse);

      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      await waitForSurface(page, route);
      const layout = await page.evaluate(() => {
        const root = document.documentElement;
        const main = document.querySelector('main');
        const header = document.querySelector('header');
        const rect = (element: Element | null) => {
          if (!element) return null;
          const box = element.getBoundingClientRect();
          return { left: Math.round(box.left), right: Math.round(box.right), width: Math.round(box.width) };
        };
        return {
          viewportWidth: root.clientWidth,
          documentWidth: root.scrollWidth,
          main: rect(main),
          mainContentWidth: main?.clientWidth ?? null,
          mainScrollWidth: main?.scrollWidth ?? null,
          header: rect(header),
          horizontalScrollContainers: Array.from(document.querySelectorAll<HTMLElement>('*'))
            .filter((element) => {
              const style = getComputedStyle(element);
              return ['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 2;
            })
            .slice(0, 12)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              label: element.getAttribute('aria-label'),
              testId: element.dataset.testid,
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
            })),
        };
      });
      const screenshot = `${viewport.width}-${route.replace(/^\//, '').replace(/\//g, '-') || 'home'}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
      evidence.push({
        route,
        url: page.url(),
        viewport,
        status: response?.status() ?? null,
        layout,
        runtime,
        screenshot,
      });

      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
      page.off('response', onResponse);
    }
  }

  writeFileSync(path.join(evidenceDir, 'responsive-route-matrix.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  const failures = evidence.filter((item) => {
    const layout = item.layout as { viewportWidth: number; documentWidth: number; main: { left: number; right: number } | null; header: { left: number; right: number } | null };
    const runtime = item.runtime as { consoleErrors: string[]; pageErrors: string[]; failedRequests: string[]; httpErrors: string[] };
    return item.status !== 200
      || layout.documentWidth > layout.viewportWidth + 2
      || Boolean(layout.main && (layout.main.left < -1 || layout.main.right > layout.viewportWidth + 1))
      || Boolean(layout.header && (layout.header.left < -1 || layout.header.right > layout.viewportWidth + 1))
      || runtime.consoleErrors.length > 0
      || runtime.pageErrors.length > 0
      || runtime.failedRequests.length > 0
      || runtime.httpErrors.length > 0;
  });
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});

test('responsive navigation, filters and Workbench controls switch at their real breakpoints', async ({ page }) => {
  const evidence: Array<Record<string, unknown>> = [];
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/interactions');
  mkdirSync(evidenceDir, { recursive: true });

  for (const width of [360, 768, 1024, 1279, 1280, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    if (width < 1280) {
      const menu = page.getByRole('button', { name: 'Toggle menu' });
      await expect(menu).toBeVisible();
      await menu.click();
      const dialog = page.getByRole('dialog', { name: 'Main navigation' });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.right).toBeLessThanOrEqual(width + 1);
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth + 2);
      if ([360, 768, 1279].includes(width)) {
        const screenshot = `navigation-menu-${width}.png`;
        await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
        evidence.push({ surface: 'public navigation drawer', viewport: width, bounds, screenshot });
      }
      await page.getByRole('button', { name: 'Close navigation' }).click();
      await expect(dialog).toHaveCount(0);
    } else {
      await expect(page.getByRole('navigation').first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeHidden();
    }
  }

  for (const width of [360, 390, 430, 768, 1023, 1024, 1280, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/explore/');
    await expect(page.getByRole('textbox', { name: 'Search catalogue' })).toBeVisible();
    await expect(page.getByText(/Showing 50 of 324 resources/)).toBeVisible();
    if (width < 1024) {
      const toggle = page.getByRole('button', { name: 'Filters', exact: true });
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      const dialog = page.getByRole('dialog', { name: 'Explore filters' });
      await expect(dialog).toBeVisible();
      const bounds = await dialog.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      });
      expect(bounds.left).toBeGreaterThanOrEqual(-1);
      expect(bounds.right).toBeLessThanOrEqual(width + 1);
      if ([360, 768, 1023].includes(width)) {
        const screenshot = `explore-filter-drawer-${width}.png`;
        await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
        evidence.push({ surface: 'Explore filter drawer', viewport: width, bounds, screenshot });
      }
      await page.getByRole('button', { name: 'Close filters' }).click();
      await expect(dialog).toHaveCount(0);
    } else {
      await expect(page.getByRole('button', { name: 'Filters', exact: true })).toBeHidden();
      await expect(page.locator('main aside').getByText('Filters', { exact: true })).toBeVisible();
    }
  }

  await page.goto('/workbench/');
  for (const width of [360, 390, 430, 768, 1023, 1024, 1280, 1536]) {
    await page.setViewportSize({ width, height: 900 });
    if (width < 1024) {
      const mobileNav = page.getByRole('navigation', { name: 'Mobile Workbench' });
      await expect(mobileNav).toBeVisible();
      await mobileNav.getByRole('button', { name: 'Pages', exact: true }).click();
      await expect(page.getByText(/Screens & Navigation/)).toBeVisible();
      const screenshot = `workbench-pages-${width}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
      evidence.push({ surface: 'mobile Workbench Pages tab', viewport: width, screenshot });
    } else {
      await expect(page.getByTestId('workbench-shell')).toBeVisible();
      await page.getByRole('button', { name: 'style', exact: true }).click();
      await expect(page.getByRole('button', { name: 'style', exact: true })).toHaveAttribute('aria-pressed', 'true');
      const screenshot = `workbench-style-${width}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshot), animations: 'disabled' });
      evidence.push({ surface: 'desktop Workbench Style mode', viewport: width, screenshot });
    }
  }

  writeFileSync(path.join(evidenceDir, 'breakpoint-interactions.json'), `${JSON.stringify(evidence, null, 2)}\n`);
});

test('phone header keeps its primary action on one line', async ({ page }) => {
  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/interactions');
  mkdirSync(evidenceDir, { recursive: true });
  const evidence: Array<Record<string, unknown>> = [];
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const action = page.getByRole('link', { name: 'Start building' });
    await expect(action).toBeVisible();
    const lineCount = await action.locator('span').evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects().length;
    });
    expect(lineCount, `Start building should remain on one line at ${width}px`).toBe(1);
    const bounds = await action.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    evidence.push({ viewport: width, lineCount, bounds, horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
    if (width === 360) await page.screenshot({ path: path.join(evidenceDir, 'phone-header-360.png'), animations: 'disabled' });
  }
  writeFileSync(path.join(evidenceDir, 'phone-header.json'), `${JSON.stringify(evidence, null, 2)}\n`);
});

test('phone Workbench keeps the project name and save status inside the toolbar', async ({ page }) => {
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/workbench/');
    await expect(page.getByTestId('mobile-workbench')).toBeVisible();
    const toolbar = page.getByTestId('top-toolbar');
    const projectName = toolbar.getByRole('button', { name: 'Example employee workspace' });
    const saveStatus = page.getByTestId('history-save-status');
    await expect(projectName).toBeVisible();
    await expect(saveStatus).toBeVisible();
    const dimensions = await page.evaluate(() => {
      const toolbarElement = document.querySelector('[data-testid="top-toolbar"]')!;
      const project = toolbarElement.querySelector('button')!;
      const status = toolbarElement.querySelector('[data-testid="history-save-status"]')!;
      const rect = (element: Element) => {
        const bounds = element.getBoundingClientRect();
        return { left: Math.round(bounds.left), right: Math.round(bounds.right), width: Math.round(bounds.width) };
      };
      return { viewport: document.documentElement.clientWidth, toolbar: rect(toolbarElement), project: rect(project), status: rect(status) };
    });
    expect(dimensions.project.left).toBeGreaterThanOrEqual(-1);
    expect(dimensions.project.right).toBeLessThanOrEqual(width + 1);
    expect(dimensions.status.right, `save status should remain visible at ${width}px`).toBeLessThanOrEqual(width + 1);
    const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/interactions');
    mkdirSync(evidenceDir, { recursive: true });
    if (width === 360 || width === 430) {
      await page.screenshot({ path: path.join(evidenceDir, `workbench-status-${width}.png`), animations: 'disabled' });
    }
  }
});

test('Compose remains actionable across phone, tablet and desktop widths', async ({ page }) => {
  for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1536]) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 900 });
    await page.goto('/compose/');
    await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
    const brief = page.getByLabel('Product Description & Objectives');
    await expect(brief).toBeVisible();
    await brief.fill('A people platform for a technology company, with teams, onboarding, and employee resources.');
    const submit = page.getByTestId('compose-submit-btn');
    await expect(submit).toBeEnabled();
    const bounds = await submit.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(-1);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    await submit.click();
    await expect(page.getByTestId('open-workbench-dir-03')).toBeVisible({ timeout: 30000 });
    for (const suffix of ['01', '02', '03']) {
      const direction = page.getByTestId(`open-workbench-dir-${suffix}`);
      await expect(direction).toBeVisible();
      const directionBounds = await direction.boundingBox();
      expect(directionBounds).not.toBeNull();
      expect(directionBounds!.x).toBeGreaterThanOrEqual(-1);
      expect(directionBounds!.x + directionBounds!.width).toBeLessThanOrEqual(width + 1);
    }
    const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-36/compose-workflows');
    mkdirSync(evidenceDir, { recursive: true });
    await page.getByTestId('open-workbench-dir-03').scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(evidenceDir, `compose-${width}.png`), animations: 'disabled' });
  }
});
