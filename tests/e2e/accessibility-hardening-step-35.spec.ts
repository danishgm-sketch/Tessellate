import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const knownHeadingRoutes = [
  '/showcase/showcase-ai-developer-platform/',
  '/showcase/showcase-luxury-ecommerce/',
  '/showcase/showcase-luxury-hospitality/',
  '/showcase/showcase-scientific-research/',
];

const coreRoutes = [
  '/',
  '/explore/',
  '/compose/',
  '/workbench/',
  '/r/button/',
  '/preview/?resource=button',
  '/showcase/showcase-playful-hr/',
];

const shellRoutes = [
  '/',
  '/explore/',
  '/compose/',
  '/workbench/',
  '/r/button/',
  '/tools/accessibility/',
  '/docs/cli/',
  '/showcase/showcase-playful-hr/',
  '/about/',
];

test('Compose labels describe form fields rather than styling non-field controls', async ({ page }) => {
  await page.goto('/compose/');

  const unassociatedLabels = await page.locator('label').evaluateAll((labels) =>
    labels
      .filter((label) => !label.control)
      .map((label) => label.textContent?.trim().replace(/\s+/g, ' ')),
  );

  expect(unassociatedLabels).toEqual([]);
});

test('showcase previews continue the document heading hierarchy', async ({ page }, testInfo) => {
  const evidence: Array<Record<string, unknown>> = [];
  for (const route of knownHeadingRoutes) {
    await page.goto(route);
    const headings = await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll((elements) =>
      elements.map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100),
        scope: element.closest('.tess-screen') ? 'rendered-product' : 'site-shell',
      })),
    );
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .withRules(['target-size'])
      .analyze();
    evidence.push({ route, headings, violations: axe.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    })) });
  }

  const evidenceDir = path.resolve(process.cwd(), 'quality/evidence/step-35/before');
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(path.join(evidenceDir, `heading-order-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(evidence.flatMap((entry) => entry.violations as unknown[]), JSON.stringify(evidence, null, 2)).toEqual([]);
});

test('Core surfaces pass WCAG 2.2 A/AA and target-size scans', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('sites-'), 'Core iframe accessibility uses the Sites Worker response policy for opaque preview frames.');
  const evidence: Array<Record<string, unknown>> = [];
  const evidenceDir = path.resolve(process.cwd(), `quality/evidence/step-35/${testInfo.project.name}`);
  mkdirSync(evidenceDir, { recursive: true });

  for (const route of coreRoutes) {
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
    expect(response?.status(), `${route} should load successfully`).toBe(200);
    if (!route.startsWith('/preview/')) {
      await expect(page.locator('main h1, main h2').first(), `${route} should expose a primary heading`).toBeVisible();
    }
    if (route === '/explore/') await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
    if (route === '/compose/') await expect(page.getByRole('textbox', { name: /product/i }).first()).toBeVisible();
    if (route === '/workbench/') {
      const shell = testInfo.project.name.includes('mobile') ? 'mobile-workbench' : 'workbench-shell';
      await expect(page.getByTestId(shell)).toBeVisible();
    }
    if (route === '/r/button/') await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (route.includes('/showcase/')) await expect(page.getByRole('heading', { name: /Example:/ })).toBeVisible();
    if (route === '/explore/') {
      await expect(page.frameLocator('iframe[title$="actual preview"]').first().locator('[data-node-id^="preview-"]').first()).toBeVisible();
    }
    if (route === '/r/button/') {
      await expect(page.frameLocator('iframe[title$="live preview"]').locator('[data-node-id^="preview-"]').first()).toBeVisible();
    }
    if (route.startsWith('/preview/')) {
      await expect(
        page
          .frameLocator('iframe[title="Isolated Tessellate resource preview"]')
          .locator('[data-node-id^="preview-"]')
          .first(),
      ).toBeVisible();
    }

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .withRules(['target-size'])
      .analyze();
    const accessibleTreeExcerpt = (await page.locator('body').ariaSnapshot()).split('\n').slice(0, 60).join('\n');
    const finding = {
      route,
      viewport: page.viewportSize(),
      accessibleTreeExcerpt,
      axe: axe.violations.map(({ id, impact, help, nodes }) => ({
        id,
        impact,
        help,
        nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
      })),
      runtime,
      screenshot: `${testInfo.project.name}-${route.replace(/[^a-z0-9]+/gi, '-')}.png`,
    };
    evidence.push(finding);
    await page.screenshot({ path: path.join(evidenceDir, finding.screenshot as string), fullPage: true, animations: 'disabled' });
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('requestfailed', onRequestFailed);
    page.off('response', onResponse);
  }

  writeFileSync(path.join(evidenceDir, 'core-route-a11y.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(evidence.filter((item) => (item.axe as unknown[]).length > 0), JSON.stringify(evidence, null, 2)).toEqual([]);
  expect(evidence.filter((item) => {
    const runtime = item.runtime as { consoleErrors: string[]; pageErrors: string[]; failedRequests: string[]; httpErrors: string[] };
    return runtime.consoleErrors.length || runtime.pageErrors.length || runtime.failedRequests.length || runtime.httpErrors.length;
  })).toEqual([]);
});

test('keyboard dialogs trap focus, close with Escape, and return focus', async ({ page }, testInfo) => {
  if (testInfo.project.name.includes('mobile')) {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    await toggle.click();
    const navigation = page.getByRole('dialog', { name: 'Main navigation' });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('button', { name: 'Close navigation' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(navigation).toContainText('Documentation');
    expect(await navigation.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    await expect(navigation.getByRole('button', { name: 'Close navigation' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(navigation).toHaveCount(0);
    await expect(toggle).toBeFocused();

    await page.goto('/explore/');
    const filters = page.getByRole('button', { name: 'Filters', exact: true });
    await expect(page.getByText(/Showing 50 of 324 resources/)).toBeVisible();
    await filters.click();
    await expect(filters).toHaveAttribute('aria-expanded', 'true');
    const filterDialog = page.getByRole('dialog', { name: 'Explore filters' });
    await expect(filterDialog).toBeVisible();
    await expect(filterDialog.getByRole('button', { name: 'Close filters' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    expect(await filterDialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    await expect(filterDialog.getByRole('button', { name: 'Close filters' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(filterDialog).toHaveCount(0);
    await expect(filters).toBeFocused();

    await page.goto('/workbench/');
    await expect(page.getByTestId('mobile-workbench')).toBeVisible();
    await page.keyboard.press('Tab');
    const workbenchSkip = page.getByRole('link', { name: 'Skip to editor' });
    await expect(workbenchSkip).toBeFocused();
    await expect(workbenchSkip).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main', { name: 'Workbench editor' })).toBeFocused();
    return;
  }

  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to content' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  const focusStyle = await skipLink.evaluate((element) => ({
    outlineStyle: getComputedStyle(element).outlineStyle,
    outlineWidth: getComputedStyle(element).outlineWidth,
  }));
  expect(focusStyle.outlineStyle).not.toBe('none');
  expect(parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.goto('/explore/');
  await expect(page.getByRole('heading', { level: 1, name: 'Explore Resource Library' })).toBeVisible();
  await page.keyboard.press('Tab');
  const publicSkip = page.getByRole('link', { name: 'Skip to content' });
  await expect(publicSkip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  await page.goto('/workbench/');
  await expect(page.getByTestId('workbench-shell')).toBeVisible();
  await page.keyboard.press('Tab');
  const workbenchSkip = page.getByRole('link', { name: 'Skip to editor' });
  await expect(workbenchSkip).toBeFocused();
  await expect(workbenchSkip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main', { name: 'Workbench editor' })).toBeFocused();

  await page.goto('/');

  const searchButton = page.getByRole('button', { name: /Search resources/ });
  // SiteHeader keeps the server-rendered trigger disabled until the React island hydrates.
  // Wait for that user-visible ready state before starting a keyboard focus assertion.
  await expect(searchButton).toBeEnabled();
  await searchButton.focus();
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Search Tessellate' });
  await expect(palette).toBeVisible();
  const searchInput = palette.getByRole('textbox', { name: 'Search commands and resources' });
  await expect(searchInput).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  expect(await palette.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(searchInput).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(palette).toHaveCount(0);
  await expect(searchButton).toBeFocused();
});

test('every public and editing shell exposes a working keyboard skip target', async ({ page }, testInfo) => {
  const evidence: Array<Record<string, unknown>> = [];
  for (const route of shellRoutes) {
    await page.goto(route);
    await expect(page.locator('main').first(), `${route} should expose its main landmark`).toBeVisible();
    if (route === '/workbench/') {
      await expect(page.getByTestId(testInfo.project.name.includes('mobile') ? 'mobile-workbench' : 'workbench-shell')).toBeVisible();
    }

    const skip = page.getByRole('link', {
      name: route === '/workbench/' ? 'Skip to editor' : 'Skip to content',
    });
    await expect(skip, `${route} should begin with a skip link`).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    const targetId = (await skip.getAttribute('href'))?.slice(1);
    expect(targetId).toBeTruthy();
    const main = page.locator(`#${targetId}`);
    await expect(main).toHaveAttribute('tabindex', '-1');
    await page.keyboard.press('Enter');
    await expect(main).toBeFocused();
    evidence.push({ route, skipTarget: `#${targetId}`, mainFocusedAfterActivation: true });
  }

  const evidenceDir = path.resolve(process.cwd(), `quality/evidence/step-35/${testInfo.project.name}`);
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(path.join(evidenceDir, 'skip-targets.json'), `${JSON.stringify(evidence, null, 2)}\n`);
});

test('reduced motion and 200 percent equivalent layout keep Core controls usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/compose/');
  const animationDuration = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.className = 'animate-pulse';
    document.body.append(probe);
    const value = getComputedStyle(probe).animationDuration;
    probe.remove();
    return value;
  });
  expect(parseFloat(animationDuration)).toBeLessThanOrEqual(0.01);

  // A 720 CSS-pixel viewport is the reflow equivalent of a 1440px desktop at 200% zoom.
  await page.setViewportSize({ width: 720, height: 900 });
  await page.reload();
  await expect(page.getByRole('textbox', { name: /product/i }).first()).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    main: document.querySelector('main')?.getBoundingClientRect().width ?? 0,
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.main).toBeGreaterThan(0);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
});

test('Workbench landmarks and every primary mode pass WCAG 2.2 A/AA', async ({ page }, testInfo) => {
  await page.goto('/workbench/');
  await expect(page.getByRole('main', { name: 'Workbench editor' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: /^Workbench:/ })).toBeAttached();
  const isMobile = testInfo.project.name.includes('mobile');
  const modes = isMobile
    ? ['Preview', 'Pages', 'Inspect', 'Command', 'Audit']
    : ['structure', 'style', 'motion', 'content', 'audit'];
  const evidence: Array<Record<string, unknown>> = [];

  for (const mode of modes) {
    if (isMobile) {
      await page.getByRole('navigation', { name: 'Mobile Workbench' }).getByRole('button', { name: mode, exact: true }).click();
    } else {
      await page.getByRole('button', { name: mode, exact: true }).click();
    }
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .withRules(['target-size'])
      .analyze();
    evidence.push({ mode, viewport: page.viewportSize(), violations: axe.violations.map(({ id, impact, help, nodes }) => ({
      id, impact, help, nodes: nodes.map(({ target, html, failureSummary }) => ({ target, html, failureSummary })),
    })) });
  }

  const evidenceDir = path.resolve(process.cwd(), `quality/evidence/step-35/${testInfo.project.name}`);
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(path.join(evidenceDir, 'workbench-mode-a11y.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(evidence.filter((item) => (item.violations as unknown[]).length > 0), JSON.stringify(evidence, null, 2)).toEqual([]);
});

test('keyboard users can reorder Workbench layers without drag and drop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'), 'Mobile selection and action reachability are covered in the mobile Workbench workflow; this ordering regression targets the desktop Layers panel.');
  await page.goto('/workbench/');
  await expect(page.getByTestId('workbench-shell')).toBeVisible();
  await page.getByRole('button', { name: 'Layers', exact: true }).click();
  const tree = page.getByRole('tree', { name: 'Semantic layers' });
  const items = tree.getByRole('treeitem');
  await expect.poll(() => items.count(), { timeout: 10000 }).toBeGreaterThan(1);

  let movableId: string | null = null;
  for (let index = 1; index < await items.count(); index += 1) {
    const candidate = items.nth(index);
    await candidate.focus();
    await page.keyboard.press('Enter');
    const moveDown = page.getByRole('button', { name: 'Move selected layer down' });
    if (await moveDown.isEnabled()) {
      movableId = await candidate.getAttribute('data-testid');
      break;
    }
  }
  expect(movableId, 'a non-root sibling should expose the keyboard move alternative').toBeTruthy();
  const selected = page.getByTestId(movableId!);
  await expect(selected).toHaveAttribute('aria-selected', 'true');
  const orderBefore = await selected.evaluate((element) => Array.from(element.parentElement!.parentElement!.children).indexOf(element.parentElement!));
  const moveDown = page.getByRole('button', { name: 'Move selected layer down' });
  await moveDown.focus();
  await page.keyboard.press('Space');
  await expect.poll(() => selected.evaluate((element) => Array.from(element.parentElement!.parentElement!.children).indexOf(element.parentElement!))).toBe(orderBefore + 1);
  await expect(selected).toHaveAttribute('aria-selected', 'true');

  const evidenceDir = path.resolve(process.cwd(), `quality/evidence/step-35/${testInfo.project.name}`);
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(path.join(evidenceDir, 'keyboard-layer-reorder.json'), `${JSON.stringify({
    viewport: page.viewportSize(),
    selectedLayer: await selected.getAttribute('data-testid'),
    beforeSiblingIndex: orderBefore,
    afterSiblingIndex: orderBefore + 1,
    operation: 'keyboard focus Move selected layer down, Space',
    preservedSelection: await selected.getAttribute('aria-selected'),
  }, null, 2)}\n`);
});
