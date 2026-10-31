import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const exactBrief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

interface HierarchyIds {
  screenName: string;
  path: Array<{ id: string; type: string }>;
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

async function getHierarchyIds(page: Page): Promise<HierarchyIds> {
  return page.evaluate(() => {
    const raw = localStorage.getItem('tessellate_active_project');
    if (!raw) throw new Error('The selected project has not been saved in browser storage.');
    const manifest = JSON.parse(raw);
    type NodeRecord = { id: string; nodeType: string; children?: NodeRecord[] };
    let deepest: { screenName: string; path: NodeRecord[] } | undefined;
    const visit = (screenName: string, node: NodeRecord, parents: NodeRecord[]) => {
      const current = [...parents, node];
      if (!deepest || current.length > deepest.path.length) deepest = { screenName, path: current };
      for (const child of node.children ?? []) visit(screenName, child, current);
    };
    for (const screen of manifest.screens ?? []) visit(screen.name, screen.rootNode, []);
    if (!deepest || deepest.path.length < 2) throw new Error('The generated project has no nested node to exercise inheritance.');
    return { screenName: deepest.screenName, path: deepest.path.map((node) => ({ id: node.id, type: node.nodeType })) };
  });
}

async function getShowcaseNodeIds(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('tessellate_active_project');
    if (!raw) throw new Error('The showcase project has not been saved in browser storage.');
    const manifest = JSON.parse(raw);
    type NodeRecord = { id: string; nodeType: string; children?: NodeRecord[] };
    const find = (node: NodeRecord, type: string): NodeRecord | undefined => {
      if (node.nodeType === type) return node;
      for (const child of node.children ?? []) {
        const result = find(child, type);
        if (result) return result;
      }
      return undefined;
    };
    const marketing = manifest.screens.find((screen: { name: string }) => screen.name === 'Marketing Home');
    const settings = manifest.screens.find((screen: { name: string }) => screen.name === 'Settings & Policies');
    if (!marketing || !settings) throw new Error('The Playful HR showcase is missing expected screens.');
    const section = find(marketing.rootNode, 'section');
    const component = find(settings.rootNode, 'component');
    const element = find(settings.rootNode, 'element');
    if (!section || !component || !element) throw new Error('The Playful HR showcase does not expose section, component, and element nodes.');
    return {
      projectId: manifest.id,
      marketing: { id: marketing.rootNode.id, type: marketing.rootNode.nodeType },
      section: { id: section.id, type: section.nodeType },
      component: { id: component.id, type: component.nodeType },
      element: { id: element.id, type: element.nodeType },
    };
  });
}

async function selectLayer(page: Page, node: { id: string; type: string }) {
  await page.getByTestId(`layer-node-${node.id}`).click();
  await expect(page.getByTestId('right-inspector').getByText(`Node: ${node.type}`)).toBeVisible();
}

async function setPlayfulness(page: Page, value: number) {
  const slider = page.getByRole('slider', { name: 'Playfulness' });
  await slider.focus();
  await slider.press('Home');
  for (let step = 0; step < value; step += 1) await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(value));
}

async function resetLocalDNAIfPresent(page: Page) {
  const reset = page.getByRole('button', { name: 'Reset to Inherited' });
  if (await reset.count()) await reset.click();
}

async function expectPlayfulness(page: Page, value: number, status: 'Project' | 'Inherited' | 'Overridden' | 'Locked') {
  await expect(page.getByRole('slider', { name: 'Playfulness' })).toHaveValue(String(value));
  const trait = page
    .getByTestId('feel-mixer')
    .locator('div.space-y-1')
    .filter({ has: page.getByText('Playfulness', { exact: true }) })
    .first();
  await expect(trait.getByText(status, { exact: true })).toBeVisible();
}

function captureRuntime(page: Page, viewport = { width: 1440, height: 900 }) {
  const runtime = {
    url: '',
    viewport,
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
    checks: {} as Record<string, unknown>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) runtime.httpErrors.push({ url: response.url(), status: response.status() });
  });
  return runtime;
}

async function saveEvidence(page: Page, runtime: ReturnType<typeof captureRuntime>, phase: 'before' | 'after', name: string) {
  const directory = path.resolve(process.cwd(), `quality/evidence/step-18/${phase}`);
  await mkdir(directory, { recursive: true });
  const screenshot = path.join(directory, `${name}.png`);
  runtime.url = page.url();
  await page.screenshot({ path: screenshot, fullPage: true });
  await writeFile(
    path.join(directory, `${name}.json`),
    `${JSON.stringify({ ...runtime, screenshot: path.relative(process.cwd(), screenshot) }, null, 2)}\n`,
    'utf8'
  );
}

test('project-level DNA is identified as the source value', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Project inheritance status is audited at the 1440×900 Workbench viewport');
  const runtime = captureRuntime(page);
  await openDirectionC(page);
  const leftPanel = page.getByTestId('left-panel');
  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  const hierarchy = await getHierarchyIds(page);
  await page.getByRole('button', { name: `Select screen ${hierarchy.screenName}` }).click();
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  await selectLayer(page, hierarchy.path[0]!);
  await page.getByRole('button', { name: 'Deselect Node' }).click();
  await expect(page.getByTestId('right-inspector').getByText('Project Scope')).toBeVisible();
  await setPlayfulness(page, 32);
  await expectPlayfulness(page, 32, 'Project');
  await expect(page.getByTestId('intent-tab').getByText('Project', { exact: true })).toHaveCount(7);
  runtime.checks = { selectedScreen: hierarchy.screenName, nodePath: hierarchy.path, scope: 'project' };
  await saveEvidence(page, runtime, 'after', 'project-scope-labelled-as-project');
});

test('Workbench inherits DNA through available nodes and restores inheritance after explicit reset', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Intent inheritance is audited at the 1440×900 Workbench viewport');
  const runtime = captureRuntime(page);
  await openDirectionC(page);
  const leftPanel = page.getByTestId('left-panel');
  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  const hierarchy = await getHierarchyIds(page);
  expect(hierarchy.path.length).toBeGreaterThanOrEqual(3);
  runtime.checks = { selectedScreen: hierarchy.screenName, nodePath: hierarchy.path };
  await page.getByRole('button', { name: `Select screen ${hierarchy.screenName}` }).click();
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();

  await selectLayer(page, hierarchy.path[0]!);
  await page.getByRole('button', { name: 'Deselect Node' }).click();
  await setPlayfulness(page, 18);
  await selectLayer(page, hierarchy.path[0]!);
  await expectPlayfulness(page, 18, 'Inherited');
  await setPlayfulness(page, 24);
  await expectPlayfulness(page, 24, 'Overridden');

  await selectLayer(page, hierarchy.path[1]!);
  await expectPlayfulness(page, 24, 'Inherited');
  await setPlayfulness(page, 61);
  await expectPlayfulness(page, 61, 'Overridden');

  await selectLayer(page, hierarchy.path[2] ?? hierarchy.path[1]!);
  await expectPlayfulness(page, 61, 'Inherited');
  await setPlayfulness(page, 78);
  await expectPlayfulness(page, 78, 'Overridden');
  await page.getByRole('button', { name: 'Reset to Inherited' }).click();
  await expectPlayfulness(page, 61, 'Inherited');

  await selectLayer(page, hierarchy.path[2] ?? hierarchy.path[1]!);
  await expectPlayfulness(page, 61, 'Inherited');
  await setPlayfulness(page, 89);
  await expectPlayfulness(page, 89, 'Overridden');
  await page.getByRole('button', { name: 'Reset to Inherited' }).click();
  await expectPlayfulness(page, 61, 'Inherited');

  const screenButtons = page.getByTestId('pages-tab').locator('button[aria-label^="Select screen "]');
  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  await screenButtons.nth(1).click();
  await page.getByRole('button', { name: `Select screen ${hierarchy.screenName}` }).click();
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  await selectLayer(page, hierarchy.path[2] ?? hierarchy.path[1]!);
  await expectPlayfulness(page, 61, 'Inherited');
  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  await page.getByRole('button', { name: `Select screen ${hierarchy.screenName}` }).click();
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  await selectLayer(page, hierarchy.path[2] ?? hierarchy.path[1]!);
  await expectPlayfulness(page, 61, 'Inherited');

  await page.getByTestId('right-inspector').getByRole('button', { name: 'Locks' }).click();
  await expect(page.getByText(/Inherited values stay local after unlock/)).toBeVisible();
  const dnaLock = page.getByRole('button', { name: 'Lock Design DNA' });
  await dnaLock.click();
  await expect(dnaLock).toHaveAttribute('aria-pressed', 'true');
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  await selectLayer(page, hierarchy.path[1]!);
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent' }).click();
  await setPlayfulness(page, 42);
  await selectLayer(page, hierarchy.path[2] ?? hierarchy.path[1]!);
  await expectPlayfulness(page, 61, 'Locked');
  await expect(page.getByTestId('intent-tab')).toContainText('active lock');
  await saveEvidence(page, runtime, 'after', 'locked-dna-stays-frozen');

  await page.getByTestId('right-inspector').getByRole('button', { name: 'Locks' }).click();
  await page.getByRole('button', { name: 'Lock Design DNA' }).click();
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent' }).click();

  await expectPlayfulness(page, 61, 'Overridden');
  await saveEvidence(page, runtime, 'after', 'unlocked-snapshot-before-reset');
  await page.getByRole('button', { name: 'Reset to Inherited' }).click();
  await expectPlayfulness(page, 42, 'Inherited');
  await saveEvidence(page, runtime, 'after', 'inheritance-restored-after-reset');
});

test('mobile Workbench distinguishes project DNA from a node override', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile inheritance controls are exercised at 390×844');
  const runtime = captureRuntime(page, { width: 390, height: 844 });
  await openDirectionC(page);
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile Workbench' });
  await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
  const hierarchy = await getHierarchyIds(page);
  expect(hierarchy.path.length).toBeGreaterThanOrEqual(3);
  await page.getByRole('button', { name: `Select screen ${hierarchy.screenName}` }).click();
  await page.getByTestId(`layer-node-${hierarchy.path[0]!.id}`).click();
  await mobileNavigation.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('button', { name: 'Deselect Node' }).click();
  const projectValue = Number(await page.getByRole('slider', { name: 'Playfulness' }).inputValue());
  await expectPlayfulness(page, projectValue, 'Project');
  await setPlayfulness(page, 32);

  await mobileNavigation.getByRole('button', { name: 'Pages', exact: true }).click();
  await page.getByTestId(`layer-node-${hierarchy.path[1]!.id}`).click();
  await mobileNavigation.getByRole('button', { name: 'Inspect', exact: true }).click();
  await expectPlayfulness(page, 32, 'Inherited');
  runtime.checks = { selectedScreen: hierarchy.screenName, nodePath: hierarchy.path, mobilePersistence: 'project edit visible on child after navigation' };
  await saveEvidence(page, runtime, 'after', 'mobile-project-and-inherited-status');
});

test('Workbench exposes inheritance on section, component, and element showcase nodes', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Nested showcase node scopes are audited at 1440×900');
  const runtime = captureRuntime(page);
  await page.goto('/showcase/showcase-playful-hr/');
  await page.getByRole('link', { name: 'Edit a local copy in Workbench' }).click();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const ids = await getShowcaseNodeIds(page);
  const leftPanel = page.getByTestId('left-panel');

  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  await page.getByRole('button', { name: 'Select screen Marketing Home' }).click();
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  await selectLayer(page, ids.marketing);
  await page.getByRole('button', { name: 'Deselect Node' }).click();
  const projectValue = Number(await page.getByRole('slider', { name: 'Playfulness' }).inputValue());
  await expectPlayfulness(page, projectValue, 'Project');
  await selectLayer(page, ids.marketing);
  await resetLocalDNAIfPresent(page);
  await expectPlayfulness(page, projectValue, 'Inherited');
  await setPlayfulness(page, 24);
  await expectPlayfulness(page, 24, 'Overridden');
  await selectLayer(page, ids.section);
  await expectPlayfulness(page, 24, 'Inherited');
  await setPlayfulness(page, 61);
  await expectPlayfulness(page, 61, 'Overridden');
  await page.getByRole('button', { name: 'Reset to Inherited' }).click();
  await expectPlayfulness(page, 24, 'Inherited');

  await leftPanel.getByRole('button', { name: 'Pages', exact: true }).click();
  await page.getByRole('button', { name: 'Select screen Settings & Policies' }).click();
  await leftPanel.getByRole('button', { name: 'Layers', exact: true }).click();
  await selectLayer(page, ids.component);
  await resetLocalDNAIfPresent(page);
  const componentInheritedValue = Number(await page.getByRole('slider', { name: 'Playfulness' }).inputValue());
  await expectPlayfulness(page, componentInheritedValue, 'Inherited');
  await setPlayfulness(page, 74);
  await expectPlayfulness(page, 74, 'Overridden');
  await page.getByRole('button', { name: 'Reset to Inherited' }).click();
  await expectPlayfulness(page, componentInheritedValue, 'Inherited');

  await selectLayer(page, ids.element);
  await resetLocalDNAIfPresent(page);
  const elementInheritedValue = Number(await page.getByRole('slider', { name: 'Playfulness' }).inputValue());
  await expectPlayfulness(page, elementInheritedValue, 'Inherited');
  await setPlayfulness(page, 86);
  await expectPlayfulness(page, 86, 'Overridden');
  await page.getByRole('button', { name: 'Reset to Inherited' }).click();
  await expectPlayfulness(page, elementInheritedValue, 'Inherited');

  runtime.checks = { projectId: ids.projectId, visibleNodes: ids, resetValue: projectValue };
  await saveEvidence(page, runtime, 'after', 'showcase-section-component-element-inheritance');
});
