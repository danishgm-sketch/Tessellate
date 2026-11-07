import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const exactBrief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

interface RuntimeEvidence {
  id: string;
  viewport: { width: number; height: number };
  url: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  uncaughtExceptions: string[];
  failedRequests: Array<{ url: string; error: string | null }>;
  httpErrors: Array<{ url: string; status: number }>;
  checks: Record<string, unknown>;
}

function captureRuntime(page: Page, evidence: RuntimeEvidence) {
  page.on('console', (message) => {
    if (message.type() === 'error') evidence.consoleErrors.push(message.text());
    if (message.type() === 'warning') evidence.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => evidence.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    evidence.failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText ?? null,
    })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) {
      evidence.httpErrors.push({ url: response.url(), status: response.status() });
    }
  });
}

async function openDirectionC(page: Page) {
  page.setDefaultTimeout(10000);
  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(exactBrief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined' }).click();
  await page.getByRole('button', { name: 'Radical' }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByTestId('direction-card-03')).toBeVisible();
  await page.getByTestId('open-workbench-dir-03').click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
}

async function saveEvidence(page: Page, evidence: RuntimeEvidence, testInfo: TestInfo) {
  const directory = path.resolve(process.cwd(), 'quality/evidence/step-17/after');
  await mkdir(directory, { recursive: true });
  const name = `workbench-fundamentals-${testInfo.project.name}.png`;
  const screenshot = path.join(directory, name);
  await page.screenshot({ path: screenshot, fullPage: true });
  evidence.url = page.url();
  await writeFile(
    path.join(directory, name.replace(/\.png$/, '.json')),
    `${JSON.stringify({ ...evidence, screenshot: path.relative(process.cwd(), screenshot) }, null, 2)}\n`,
    'utf8'
  );
}

test('desktop Workbench selection, panels, canvas controls, and keyboard stay in sync', async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(isMobile, 'Desktop Workbench fundamentals are exercised at 1440×900');
  const evidence: RuntimeEvidence = {
    id: 'STEP-17-DESKTOP',
    viewport: testInfo.project.use.viewport as { width: number; height: number },
    url: '',
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
    checks: {},
  };
  captureRuntime(page, evidence);

  try {
    await openDirectionC(page);
    await expect(page.getByTestId('workbench-shell')).toBeVisible();
    await expect(page.getByTestId('left-panel')).toBeVisible();
    await expect(page.getByTestId('workbench-canvas')).toBeVisible();
    await expect(page.getByTestId('right-inspector')).toBeVisible();
    await expect(page.getByTestId('command-bar')).toBeVisible();

    const shellMetrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      leftPanelWidth: document.querySelector('[data-testid="left-panel"]')?.getBoundingClientRect()
        .width,
      rightPanelWidth: document
        .querySelector('[data-testid="right-inspector"]')
        ?.getBoundingClientRect().width,
      canvasWidth: document
        .querySelector('[data-testid="workbench-canvas"]')
        ?.getBoundingClientRect().width,
    }));
    expect(shellMetrics.documentWidth).toBeLessThanOrEqual(shellMetrics.viewportWidth);
    expect(shellMetrics.leftPanelWidth).toBe(280);
    expect(shellMetrics.rightPanelWidth).toBe(340);
    expect(shellMetrics.canvasWidth).toBeGreaterThan(0);
    evidence.checks.shell = shellMetrics;
    await mkdir(path.resolve(process.cwd(), 'quality/evidence/step-17/after'), { recursive: true });
    await page.screenshot({
      path: path.resolve(
        process.cwd(),
        'quality/evidence/step-17/after/workbench-desktop-initial.png'
      ),
      fullPage: true,
    });

    const leftPanel = page.getByTestId('left-panel');
    for (const [tab, testId] of [
      ['Brief', 'brief-tab'],
      ['Pages', 'pages-tab'],
      ['Layers', 'layers-tab'],
      ['Library', 'library-tab'],
    ]) {
      await leftPanel.getByRole('button', { name: tab, exact: true }).click();
      await expect(page.getByTestId(testId)).toBeVisible();
    }

    await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
    const pageButtons = page
      .getByTestId('pages-tab')
      .locator('button[aria-label^="Select screen "]');
    const pageLabels = await pageButtons.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label'))
    );
    expect(pageLabels.length).toBeGreaterThanOrEqual(3);
    const initialScreenId = await page
      .locator('[data-testid="workbench-canvas"] [data-screen-id]')
      .getAttribute('data-screen-id');
    const settingsScreen = pageButtons.last();
    await expect(settingsScreen).toHaveAttribute('aria-label', 'Select screen Settings & Policies');
    await settingsScreen.click();
    await expect(
      page.locator('[data-testid="workbench-canvas"] [data-screen-id]')
    ).not.toHaveAttribute('data-screen-id', initialScreenId ?? '');
    const selectedScreenId = await page
      .locator('[data-testid="workbench-canvas"] [data-screen-id]')
      .getAttribute('data-screen-id');
    expect(selectedScreenId).toBeTruthy();
    await expect(page.getByTestId('right-inspector').getByText('Project Scope')).toBeVisible();

    await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
    const tree = page.getByRole('tree', { name: 'Semantic layers' });
    const canvas = page.getByTestId('workbench-canvas');
    const rootId = await canvas
      .locator('.tess-screen > [data-node-id]')
      .first()
      .getAttribute('data-node-id');
    expect(rootId).toBeTruthy();
    await page.getByTestId(`layer-node-${rootId}`).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('right-inspector').getByText('Node: layout')).toBeVisible();

    // Compose models each selected Gold resource as a semantic section. Select
    // a real rendered resource node instead of assuming generated projects
    // contain lower-level component nodes.
    await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
    await pageButtons.first().click();
    await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
    const resourceSection = canvas.locator('[data-node-type="section"][data-resource-variant]').first();
    await expect(resourceSection).toBeVisible();
    const resourceSectionId = await resourceSection.getAttribute('data-node-id');
    expect(resourceSectionId).toBeTruthy();
    await page.getByTestId(`layer-node-${resourceSectionId}`).click();
    await expect(page.getByTestId('right-inspector').getByText('Node: section')).toBeVisible();
    const breadcrumb = page.getByTestId('breadcrumb-bar');
    const beforeEscape = await breadcrumb.innerText();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('right-inspector').getByText(/Node:/)).toBeVisible();
    const afterEscape = await breadcrumb.innerText();
    expect(afterEscape.length).toBeLessThan(beforeEscape.length);
    for (let count = 0; count < 8; count += 1) {
      if (await page.getByTestId('right-inspector').getByText('Project Scope').isVisible()) break;
      await page.keyboard.press('Escape');
    }
    await expect(page.getByTestId('right-inspector').getByText('Project Scope')).toBeVisible();

    await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
    await pageButtons.first().click();
    const marketingScreenId = await page
      .locator('[data-testid="workbench-canvas"] [data-screen-id]')
      .getAttribute('data-screen-id');
    await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
    const section = canvas.locator('[data-node-type="section"]').first();
    const sectionId = await section.getAttribute('data-node-id');
    expect(sectionId).toBeTruthy();
    await page.getByTestId(`layer-node-${sectionId}`).click();
    await expect(page.getByTestId('right-inspector').getByText('Node: section')).toBeVisible();
    evidence.checks.selection = {
      screens: pageLabels,
      selectedScreenId,
      marketingScreenId,
      rootId,
      sectionId,
      resourceSectionId,
      breadcrumbBeforeEscape: beforeEscape,
      breadcrumbAfterEscape: afterEscape,
    };
    expect(await tree.getByRole('treeitem').count()).toBeGreaterThan(5);

    const topToolbar = page.getByTestId('top-toolbar');
    for (const [mode, testId] of [
      ['structure', 'intent-tab'],
      ['style', 'style-tab'],
      ['motion', 'motion-tab'],
      ['content', 'content-tab'],
      ['audit', 'audit-panel'],
    ]) {
      await topToolbar.getByRole('button', { name: mode, exact: true }).click();
      await expect(page.getByTestId(testId)).toBeVisible();
      await expect(topToolbar.getByRole('button', { name: mode, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    }
    await topToolbar.getByRole('button', { name: 'structure', exact: true }).click();

    const canvasToolbar = page.getByTestId('canvas-toolbar');
    await canvasToolbar.getByRole('button', { name: 'Zoom In' }).click();
    await expect(canvasToolbar.getByText('110%')).toBeVisible();
    await page.keyboard.press('f');
    await expect(canvasToolbar.getByText('100%', { exact: true }).first()).toBeVisible();
    await page.keyboard.press('1');
    await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'desktop');
    await page.keyboard.press('2');
    await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'tablet');
    await page.keyboard.press('3');
    await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'mobile');
    await canvasToolbar.getByRole('button', { name: 'Fluid' }).click();
    await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'desktop');
    await canvasToolbar.getByRole('button', { name: '768' }).click();
    await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'tablet');
    await canvasToolbar.getByRole('button', { name: '1440' }).click();
    await expect(canvas.locator('.tess-screen')).toHaveAttribute('data-viewport', 'desktop');
    const deviceFrame = canvas
      .locator('div.mx-auto.flex.flex-col.shrink-0[style*="1440px"]')
      .first();
    await expect
      .poll(async () =>
        Number.parseFloat(
          await deviceFrame.evaluate((node) => getComputedStyle(node).width)
        ),
        { timeout: 1000 }
      )
      .toBe(1440);
    const frameMetrics = await deviceFrame.evaluate((node) => ({
      inlineStyle: node.getAttribute('style'),
      className: node.className,
      computedWidth: getComputedStyle(node).width,
      maxWidth: getComputedStyle(node).maxWidth,
      flexShrink: getComputedStyle(node).flexShrink,
      offsetWidth: (node as HTMLElement).offsetWidth,
      rectWidth: node.getBoundingClientRect().width,
      parentWidth: node.parentElement?.getBoundingClientRect().width,
      parentClass: node.parentElement?.className,
    }));
    const deviceWidth = Number.parseFloat(frameMetrics.computedWidth);
    expect(deviceWidth).toBe(1440);
    evidence.checks.canvas = {
      zoomRestoredByShortcut: '100%',
      viewportShortcuts: ['1440', '768', '390'],
      finalPreset: '1440',
      deviceWidth,
    };

    await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
      0
    );
  } finally {
    await saveEvidence(page, evidence, testInfo);
  }

  expect(evidence.consoleErrors).toEqual([]);
  expect(evidence.uncaughtExceptions).toEqual([]);
  expect(evidence.failedRequests).toEqual([]);
  expect(evidence.httpErrors).toEqual([]);
});

test('mobile Workbench uses its inspection flow without losing screen or selection context', async ({
  page,
  isMobile,
}, testInfo) => {
  test.skip(!isMobile, 'Mobile Workbench fundamentals are exercised at 390×844');
  const evidence: RuntimeEvidence = {
    id: 'STEP-17-MOBILE',
    viewport: testInfo.project.use.viewport as { width: number; height: number },
    url: '',
    consoleErrors: [],
    consoleWarnings: [],
    uncaughtExceptions: [],
    failedRequests: [],
    httpErrors: [],
    checks: {},
  };
  captureRuntime(page, evidence);

  try {
    await openDirectionC(page);
    const mobileShell = page.getByTestId('mobile-workbench');
    await expect(mobileShell).toBeVisible();
    const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Workbench' });
    for (const tab of ['Preview', 'Pages', 'Inspect', 'Command', 'Audit']) {
      await expect(mobileNavigation.getByRole('button', { name: tab, exact: true })).toBeVisible();
    }
    const viewportMetrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      navigationHeight: document
        .querySelector('nav[aria-label="Mobile Workbench"]')
        ?.getBoundingClientRect().height,
      shellHeight: document
        .querySelector('[data-testid="mobile-workbench"]')
        ?.getBoundingClientRect().height,
    }));
    expect(viewportMetrics.documentWidth).toBeLessThanOrEqual(viewportMetrics.viewportWidth);
    expect(viewportMetrics.navigationHeight).toBe(64);
    expect(viewportMetrics.shellHeight).toBe(viewportMetrics.viewportHeight);
    evidence.checks.shell = viewportMetrics;
    await mkdir(path.resolve(process.cwd(), 'quality/evidence/step-17/after'), { recursive: true });
    await page.screenshot({
      path: path.resolve(
        process.cwd(),
        'quality/evidence/step-17/after/workbench-mobile-initial.png'
      ),
      fullPage: true,
    });

    const firstScreen = await page.locator('.tess-screen').getAttribute('data-screen-id');
    await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
    await expect(page.getByTestId('pages-tab')).toBeVisible();
    await expect(page.getByTestId('layers-tab')).toBeVisible();
    const pageButtons = page
      .getByTestId('pages-tab')
      .locator('button[aria-label^="Select screen "]');
    const pageNames = await pageButtons.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label'))
    );
    expect(pageNames.length).toBeGreaterThanOrEqual(3);
    await expect(pageButtons.last()).toHaveAttribute(
      'aria-label',
      'Select screen Settings & Policies'
    );
    await pageButtons.last().click();
    await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.locator('.tess-screen')).not.toHaveAttribute(
      'data-screen-id',
      firstScreen ?? ''
    );
    const selectedScreen = await page.locator('.tess-screen').getAttribute('data-screen-id');

    const disabledAction = page.getByRole('button', {
      name: 'Save preferences',
      exact: true,
    });
    await expect(disabledAction).toBeDisabled();
    await expect(page.getByText('Connect persistence to save.')).toBeVisible();
    const disabledActionContext = await disabledAction.evaluate((button) => {
      const node = button.closest<HTMLElement>('[data-node-id][data-node-type]');
      const bounds = button.getBoundingClientRect();
      return {
        nodeId: node?.dataset.nodeId,
        nodeType: node?.dataset.nodeType,
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      };
    });
    expect(disabledActionContext.nodeId).toBeTruthy();
    // Generated resource-backed sections own their nested preview controls;
    // selection and inspector state must agree at that semantic boundary.
    expect(['component', 'element', 'section']).toContain(disabledActionContext.nodeType);
    await page.mouse.click(disabledActionContext.x, disabledActionContext.y);
    await expect(
      page
        .getByTestId('right-inspector')
        .getByText(`Node: ${disabledActionContext.nodeType}`)
    ).toBeVisible();
    await expect(
      mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    const disabledSelectionScreenshot = path.resolve(
      process.cwd(),
      'quality/evidence/step-17/after/disabled-resource-canvas-selection-mobile-390x844.png'
    );
    await page.screenshot({ path: disabledSelectionScreenshot, fullPage: true });
    evidence.checks.disabledControlSelection = {
      nodeId: disabledActionContext.nodeId,
      nodeType: disabledActionContext.nodeType,
      inspectorOpened: true,
      screenshot: path.relative(process.cwd(), disabledSelectionScreenshot),
    };
    await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();

    // Generated compositions expose resource-backed sections, while deeper
    // component/element nodes are available in projects that contain them.
    await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
    await pageButtons.first().click();
    await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
    const resourceSection = page.locator('.tess-screen [data-node-type="section"][data-resource-variant]').first();
    const resourceSectionId = await resourceSection.getAttribute('data-node-id');
    expect(resourceSectionId).toBeTruthy();
    await resourceSection.click();
    await expect(page.getByTestId('right-inspector').getByText('Node: section')).toBeVisible();
    await expect(
      mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');

    await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
    await page.getByTestId(`layer-node-${resourceSectionId}`).click();
    await mobileNavigation.getByRole('button', { name: 'Inspect', exact: true }).click();
    await expect(page.getByTestId('right-inspector').getByText('Node: section')).toBeVisible();
    await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();
    await expect(page.locator('.tess-screen [data-node-id]').first()).toBeVisible();
    await mobileNavigation.getByRole('button', { name: 'Command', exact: true }).click();
    await expect(
      page.getByTestId('command-bar').getByRole('textbox', { name: 'Tessellate command' })
    ).toBeVisible();
    await mobileNavigation.getByRole('button', { name: 'Audit', exact: true }).click();
    await expect(page.getByTestId('audit-panel')).toBeVisible();
    await page
      .getByTestId('top-toolbar')
      .getByRole('button', { name: 'motion', exact: true })
      .click();
    await expect(page.getByTestId('right-inspector').getByTestId('motion-tab')).toBeVisible();
    await expect(
      mobileNavigation.getByRole('button', { name: 'Inspect', exact: true })
    ).toHaveAttribute('aria-pressed', 'true');
    await mobileNavigation.getByRole('button', { name: 'Preview', exact: true }).click();

    await expect(page.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(
      0
    );
    evidence.checks.navigation = {
      pages: pageNames,
      firstScreen,
      selectedScreen,
      selectedResourceSection: resourceSectionId,
      tabs: ['Preview', 'Pages', 'Inspect', 'Command', 'Audit'],
    };
  } finally {
    await saveEvidence(page, evidence, testInfo);
  }

  expect(evidence.consoleErrors).toEqual([]);
  expect(evidence.uncaughtExceptions).toEqual([]);
  expect(evidence.failedRequests).toEqual([]);
  expect(evidence.httpErrors).toEqual([]);
});
