import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';

const { unzipSync, strFromU8 } = createRequire(
  path.resolve(process.cwd(), 'packages/exporter/package.json')
)('fflate') as {
  unzipSync: (input: Uint8Array) => Record<string, Uint8Array>;
  strFromU8: (input: Uint8Array) => string;
};

function _computeCanonicalSubtreeHash(node: ProjectNode): string {
  function canonicalize(val: unknown): unknown {
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) return val.map(canonicalize);
    const sortedObj: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sortedObj[key] = canonicalize((val as Record<string, unknown>)[key]);
    }
    return sortedObj;
  }
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(node)))
    .digest('hex');
}

async function assertZeroUnresolvedResources(page: Page, containerLocator?: Locator) {
  const scope = containerLocator || page;
  await expect(scope.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  await expect(scope.locator('[data-testid="unresolved-required-role-diagnostic"]')).toHaveCount(0);
  await expect(scope.locator('text=Unresolved resource:')).toHaveCount(0);
}

function findManifestNode(
  manifest: ProjectManifest,
  screenName: string,
  predicate: (node: ProjectNode) => boolean
) {
  const screen = manifest.screens.find((item) => item.name === screenName);
  if (!screen) throw new Error(`The project is missing the ${screenName} screen.`);
  const visit = (node: ProjectNode): ProjectNode | null => {
    if (predicate(node)) return node;
    for (const child of node.children) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  const found = visit(screen.rootNode);
  if (!found) throw new Error(`The ${screenName} screen is missing the requested layer.`);
  return found;
}

function inspectEmployeeExperienceContent(manifest: ProjectManifest) {
  const screenNodes = (screenName: string) => {
    const screen = manifest.screens.find((item) => item.name === screenName);
    if (!screen) throw new Error(`The project is missing the ${screenName} screen.`);
    const result: ProjectNode[] = [];
    const visit = (node: ProjectNode) => {
      result.push(node);
      node.children.forEach(visit);
    };
    visit(screen.rootNode);
    return result;
  };
  const hero = findManifestNode(manifest, 'Marketing Home', (node) => node.semanticRole === 'hero');
  const primaryCta = hero.props.primaryCta as { href?: unknown } | undefined;
  const secondaryCta = hero.props.secondaryCta as { href?: unknown } | undefined;
  const screenForTarget = (href: unknown) =>
    manifest.screens.find((screen) => `#${screen.id}` === href)?.name ?? 'unresolved';
  const settings = findManifestNode(
    manifest,
    'Settings & Policies',
    (node) => node.semanticRole === 'settings-form'
  );
  const brandNodes = manifest.screens
    .flatMap((screen) => screenNodes(screen.name))
    .filter((node) => typeof node.props.brand === 'string');
  const settingsNavigationRoles = screenNodes('Settings & Policies')
    .filter((node) => ['navigation', 'settings-nav'].includes(node.semanticRole))
    .map((node) => node.semanticRole);

  return {
    brandReferences: brandNodes.length,
    brandMismatches: brandNodes.filter((node) => node.props.brand !== manifest.brand?.name),
    primaryMarketingTarget: screenForTarget(primaryCta?.href),
    secondaryMarketingTarget: screenForTarget(secondaryCta?.href),
    teamsRows: JSON.stringify(
      findManifestNode(manifest, 'Teams', (node) => node.semanticRole === 'data-table').props.rows
    ),
    settingsNavigationRoles,
    policyPreviewIsNotStored: /not stored/i.test(String(settings.props.helperText)),
  };
}

async function downloadManifest(
  page: Page,
  testInfo: TestInfo,
  name: string
): Promise<ProjectManifest> {
  await page.getByTestId('export-button').click();
  const pending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await pending;
  const destination = testInfo.outputPath(name);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  await download.saveAs(destination);
  return ProjectManifestSchema.parse(JSON.parse(fs.readFileSync(destination, 'utf8')));
}

function withoutUpdatedAt(manifest: ProjectManifest) {
  const { updatedAt: _updatedAt, ...stable } = manifest;
  return stable;
}

async function selectWorkbenchScreen(page: Page, screenName: string, isMobile: boolean) {
  if (isMobile) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Pages', exact: true })
      .click();
  } else {
    await page
      .getByTestId('left-panel')
      .getByRole('button', { name: 'Pages', exact: true })
      .click();
  }
  await page.getByRole('button', { name: `Select screen ${screenName}`, exact: true }).click();
}

async function selectWorkbenchLayer(
  page: Page,
  nodeId: string,
  isMobile: boolean
): Promise<Locator> {
  if (isMobile) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Pages', exact: true })
      .click();
  } else {
    await page
      .getByTestId('left-panel')
      .getByRole('button', { name: 'Layers', exact: true })
      .click();
  }
  const layer = page.getByTestId(`layer-node-${nodeId}`);
  await expect(layer).toBeVisible();
  await layer.click();
  return layer;
}

async function openWorkbenchInspector(page: Page, tab: string, isMobile: boolean) {
  if (isMobile) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Inspect', exact: true })
      .click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: tab, exact: true }).click();
}

async function setSliderThroughKeyboard(page: Page, label: string, value: number) {
  const slider = page.getByRole('slider', { name: label });
  await slider.focus();
  await slider.press('Home');
  for (let index = 0; index < value; index += 1) await slider.press('ArrowRight');
  await expect(slider).toHaveValue(String(value));
}

test.describe('Flagship Acceptance & Merge Gate Verification', () => {
  // Test 1: Reproduce the canonical journey through visible controls and actual downloads.
  test('flagship employee experience journey uses the visible UI through independent React export', async ({
    page,
    isMobile,
  }, testInfo) => {
    test.setTimeout(240000);
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    const uncaughtExceptions: string[] = [];
    const failedRequests: Array<{ url: string; error: string | null }> = [];
    const httpErrors: Array<{ url: string; status: number }> = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
      if (message.type() === 'warning') consoleWarnings.push(message.text());
    });
    page.on('pageerror', (error) => uncaughtExceptions.push(error.message));
    page.on('requestfailed', (request) =>
      failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
    );
    page.on('response', (response) => {
      if (response.status() >= 400)
        httpErrors.push({ url: response.url(), status: response.status() });
    });

    const exactBrief =
      'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';
    await page.goto('/compose');
    await expect(
      page.getByRole('heading', { name: 'Describe the product. Get the interface.' })
    ).toBeVisible();
    await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
    await page.locator('#description').fill(exactBrief);
    await page.locator('#feel').fill('professional but playful');
    await page.getByRole('button', { name: 'Refined', exact: true }).click();
    await page.getByRole('button', { name: 'Radical', exact: true }).click();
    await page.getByTestId('compose-submit-btn').click();
    await expect(page.getByText('Inferred Product Architecture', { exact: true })).toBeVisible();

    const directions = ['01', '02', '03'];
    const directionTexts: string[] = [];
    for (const direction of directions) {
      const card = page.getByTestId(`direction-card-${direction}`);
      const preview = page.getByTestId(`direction-preview-${direction}`);
      await expect(card).toBeVisible();
      await expect(preview).toBeVisible();
      // Wait for the lazy resource renderer to replace its visible loading
      // skeleton before taking direction evidence or treating the preview as
      // a finished user-facing result.
      await expect(preview).toContainText('Team Overview', { timeout: 30_000 });
      await expect(preview).not.toContainText(/Loading/i, { timeout: 30_000 });
      await page.waitForTimeout(300);
      await expect(preview).not.toContainText(/Loading/i);
      await assertZeroUnresolvedResources(page, preview);
      directionTexts.push(await card.innerText());
      await preview.screenshot({
        path: testInfo.outputPath(`direction-${direction}-${testInfo.project.name}.png`),
      });
    }
    expect(new Set(directionTexts).size).toBe(3);

    const directionC = page.getByTestId('direction-card-03');
    const selectedProjectId = await directionC.getAttribute('data-project-id');
    expect(selectedProjectId).toBeTruthy();
    await directionC.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const directionDialog = page.getByRole('dialog');
    await expect(directionDialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(directionDialog).toHaveCount(0);
    await directionC.getByTestId('open-workbench-dir-03').click();
    await page.waitForURL(/\/workbench\?project=/);
    await expect(page.getByTestId('top-toolbar')).toBeVisible();
    expect(await page.evaluate(() => '__tessellate_workbench_store__' in window)).toBe(false);
    await assertZeroUnresolvedResources(page);

    let manifest = await downloadManifest(
      page,
      testInfo,
      `employee-start-${testInfo.project.name}.tess.json`
    );
    expect(manifest.id).toBe(selectedProjectId);
    const employeeContentChecks = inspectEmployeeExperienceContent(manifest);
    expect(employeeContentChecks.brandReferences).toBeGreaterThan(0);
    expect(employeeContentChecks.brandMismatches).toEqual([]);
    expect(employeeContentChecks.primaryMarketingTarget).toBe('Teams');
    expect(employeeContentChecks.secondaryMarketingTarget).toBe('Onboarding');
    expect(employeeContentChecks.teamsRows).not.toMatch(/Example colleague/i);
    expect(employeeContentChecks.settingsNavigationRoles).toEqual(['navigation']);
    expect(employeeContentChecks.policyPreviewIsNotStored).toBe(true);
    expect(manifest.screens.map((screen) => screen.name)).toEqual(
      expect.arrayContaining([
        'Team Overview',
        'People Directory',
        'Teams',
        'Engagement',
        'Onboarding',
        'Settings & Policies',
      ])
    );
    expect(JSON.stringify(manifest)).not.toMatch(
      /trading desk|order book|portfolio allocation|infrastructure latency/i
    );

    const onboardingRoot = manifest.screens.find(
      (screen) => screen.name === 'Onboarding'
    )?.rootNode;
    const settingsRoot = manifest.screens.find(
      (screen) => screen.name === 'Settings & Policies'
    )?.rootNode;
    expect(onboardingRoot).toBeDefined();
    expect(settingsRoot).toBeDefined();

    await selectWorkbenchScreen(page, 'Onboarding', isMobile);
    await selectWorkbenchLayer(page, onboardingRoot!.id, isMobile);
    await openWorkbenchInspector(page, 'Intent', isMobile);
    await setSliderThroughKeyboard(page, 'Playfulness', 85);
    await openWorkbenchInspector(page, 'Style', isMobile);
    await setSliderThroughKeyboard(page, 'Corner Curvature', 78);

    await selectWorkbenchScreen(page, 'Settings & Policies', isMobile);
    await selectWorkbenchLayer(page, settingsRoot!.id, isMobile);
    await openWorkbenchInspector(page, 'Intent', isMobile);
    await setSliderThroughKeyboard(page, 'Professionalism', 95);
    await setSliderThroughKeyboard(page, 'Playfulness', 15);
    await openWorkbenchInspector(page, 'Style', isMobile);
    await setSliderThroughKeyboard(page, 'Corner Curvature', 10);

    await selectWorkbenchScreen(page, 'Onboarding', isMobile);
    await selectWorkbenchLayer(page, onboardingRoot!.id, isMobile);
    await openWorkbenchInspector(page, 'Intent', isMobile);
    await expect(page.getByRole('slider', { name: 'Playfulness' })).toHaveValue('85');
    await expect(
      page.getByTestId('feel-mixer').getByText('Overridden', { exact: true }).first()
    ).toBeVisible();
    await selectWorkbenchScreen(page, 'Settings & Policies', isMobile);
    await selectWorkbenchLayer(page, settingsRoot!.id, isMobile);
    await openWorkbenchInspector(page, 'Intent', isMobile);
    await expect(page.getByRole('slider', { name: 'Professionalism' })).toHaveValue('95');
    await expect(page.getByRole('slider', { name: 'Playfulness' })).toHaveValue('15');
    await page.reload();
    await expect(page.getByTestId('top-toolbar')).toBeVisible();

    manifest = await downloadManifest(
      page,
      testInfo,
      `employee-overrides-${testInfo.project.name}.tess.json`
    );
    const storedOnboardingRoot = manifest.screens.find(
      (screen) => screen.name === 'Onboarding'
    )!.rootNode;
    const storedSettingsRoot = manifest.screens.find(
      (screen) => screen.name === 'Settings & Policies'
    )!.rootNode;
    expect(storedOnboardingRoot.dnaOverrides?.playfulness).toBe(85);
    expect(storedOnboardingRoot.dnaOverrides?.curvature).toBe(78);
    expect(storedSettingsRoot.dnaOverrides?.professionalism).toBe(95);
    expect(storedSettingsRoot.dnaOverrides?.playfulness).toBe(15);
    expect(storedSettingsRoot.dnaOverrides?.curvature).toBe(10);

    await selectWorkbenchScreen(page, 'Team Overview', isMobile);
    const kpi = findManifestNode(
      manifest,
      'Team Overview',
      (node) => node.semanticRole === 'metric-cards'
    );
    expect(kpi.resourceRef?.slug).toBe('dashboard-kpi-grid');
    const kpiLayer = await selectWorkbenchLayer(page, kpi.id, isMobile);
    const kpiTitle = String(kpi.props.title);
    const lockButton = kpiLayer.getByRole('button', { name: `Lock ${kpiTitle}`, exact: true });
    await lockButton.click();
    await expect(
      kpiLayer.getByRole('button', { name: `Unlock ${kpiTitle}`, exact: true })
    ).toHaveAttribute('aria-pressed', 'true');

    const lockedBeforeRecompose = await downloadManifest(
      page,
      testInfo,
      `employee-locked-before-recompose-${testInfo.project.name}.tess.json`
    );
    const lockedKpi = findManifestNode(
      lockedBeforeRecompose,
      'Team Overview',
      (node) => node.id === kpi.id
    );
    expect(lockedKpi.locks?.node).toBe(true);
    const lockedHash = _computeCanonicalSubtreeHash(lockedKpi);
    const overviewBeforeRecompose = lockedBeforeRecompose.screens.find(
      (screen) => screen.name === 'Team Overview'
    )!.rootNode;

    const recomposeButton = page.getByTestId('recompose-button');
    await expect(recomposeButton).toHaveAttribute('title', /divergenceLevel 95/);
    await recomposeButton.click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Recomposed Team Overview' })
    ).toBeVisible();
    await assertZeroUnresolvedResources(page);
    const recomposed = await downloadManifest(
      page,
      testInfo,
      `employee-recomposed-${testInfo.project.name}.tess.json`
    );
    expect(
      _computeCanonicalSubtreeHash(
        findManifestNode(recomposed, 'Team Overview', (node) => node.id === kpi.id)
      )
    ).toBe(lockedHash);
    expect(
      recomposed.screens.find((screen) => screen.name === 'Team Overview')!.rootNode
    ).not.toEqual(overviewBeforeRecompose);

    const activity = findManifestNode(
      recomposed,
      'Team Overview',
      (node) => node.semanticRole === 'activity-feed'
    );
    expect(activity.resourceRef).toBeDefined();
    await selectWorkbenchLayer(page, activity.id, isMobile);
    await openWorkbenchInspector(page, 'Resource', isMobile);
    await page.getByTestId('open-replace-drawer-btn').click();
    const replacementDialog = page.getByRole('dialog', { name: 'Replace Resource' });
    await expect(replacementDialog).toBeVisible();
    const replacement = replacementDialog.getByTestId('apply-replacement-btn').first();
    const replacementSlug = await replacement.getAttribute('data-resource-slug');
    const replacementCard = replacement.locator('xpath=..');
    expect(replacementSlug).toBeTruthy();
    expect(replacementSlug).not.toBe(activity.resourceRef!.slug);
    await expect(replacementCard.getByText('Gold', { exact: true })).toBeVisible();
    await expect(replacementCard.getByRole('region', { name: /actual preview/i })).toBeVisible();
    await replacement.click();
    await assertZeroUnresolvedResources(page);
    const replaced = await downloadManifest(
      page,
      testInfo,
      `employee-replaced-${testInfo.project.name}.tess.json`
    );
    expect(
      findManifestNode(replaced, 'Team Overview', (node) => node.id === activity.id).resourceRef
        ?.slug
    ).toBe(replacementSlug);

    await page.getByTestId('surprise-me-button').click();
    await expect(
      page.getByRole('status').filter({ hasText: 'Surprise Me (divergence: 60%)' })
    ).toBeVisible();
    await assertZeroUnresolvedResources(page);
    const surprised = await downloadManifest(
      page,
      testInfo,
      `employee-surprised-${testInfo.project.name}.tess.json`
    );
    expect(surprised.designDNA.primaryArchetype).toBe('saas');
    expect(surprised.designDNA.typographyPersonality).not.toBe('financial-sans-tabular-mono');
    expect(
      _computeCanonicalSubtreeHash(
        findManifestNode(surprised, 'Team Overview', (node) => node.id === kpi.id)
      )
    ).toBe(lockedHash);
    expect(withoutUpdatedAt(surprised)).not.toEqual(withoutUpdatedAt(replaced));

    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(
      withoutUpdatedAt(
        await downloadManifest(
          page,
          testInfo,
          `employee-undo-surprise-${testInfo.project.name}.tess.json`
        )
      )
    ).toEqual(withoutUpdatedAt(replaced));
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(
      withoutUpdatedAt(
        await downloadManifest(
          page,
          testInfo,
          `employee-undo-replacement-${testInfo.project.name}.tess.json`
        )
      )
    ).toEqual(withoutUpdatedAt(recomposed));
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    expect(
      withoutUpdatedAt(
        await downloadManifest(
          page,
          testInfo,
          `employee-undo-recompose-${testInfo.project.name}.tess.json`
        )
      )
    ).toEqual(withoutUpdatedAt(lockedBeforeRecompose));
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    expect(
      withoutUpdatedAt(
        await downloadManifest(
          page,
          testInfo,
          `employee-redo-recompose-${testInfo.project.name}.tess.json`
        )
      )
    ).toEqual(withoutUpdatedAt(recomposed));
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    expect(
      withoutUpdatedAt(
        await downloadManifest(
          page,
          testInfo,
          `employee-redo-replacement-${testInfo.project.name}.tess.json`
        )
      )
    ).toEqual(withoutUpdatedAt(replaced));
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    const finalManifest = await downloadManifest(
      page,
      testInfo,
      `employee-final-${testInfo.project.name}.tess.json`
    );
    expect(withoutUpdatedAt(finalManifest)).toEqual(withoutUpdatedAt(surprised));

    await page.getByTestId('top-toolbar').getByRole('button', { name: 'Preview' }).click();
    const preview = page.getByTestId('preview-modal');
    await expect(preview).toBeVisible();
    await preview
      .getByLabel('Preview screen')
      .selectOption(manifest.screens.find((screen) => screen.name === 'Team Overview')!.id);
    await expect(preview.locator(`[data-node-id="${kpi.id}"]`)).toBeVisible();
    await expect(preview.locator(`[data-node-id="${activity.id}"]`)).toBeVisible();
    await page.getByRole('button', { name: 'Exit Preview' }).click();

    const evidenceDir = path.resolve(
      process.cwd(),
      process.env.TESSELLATE_EVIDENCE_DIR ?? 'audit/evidence/v26/flagship'
    );
    fs.mkdirSync(evidenceDir, { recursive: true });
    const viewportLabel = isMobile ? 'mobile-390' : 'desktop-1440';
    const workbenchScreenshot = path.join(evidenceDir, `employee-workbench-${viewportLabel}.png`);
    await page.screenshot({ path: workbenchScreenshot, fullPage: true });

    await page.getByTestId('export-button').click();
    const zipPending = page.waitForEvent('download');
    await page.getByTestId('export-zip-btn').click();
    const zipDownload = await zipPending;
    expect(zipDownload.suggestedFilename()).toMatch(/\.zip$/);
    const zipPath = path.join(evidenceDir, `employee-experience-${viewportLabel}.zip`);
    await zipDownload.saveAs(zipPath);
    const zipFiles = unzipSync(fs.readFileSync(zipPath));
    const packageJson = JSON.parse(strFromU8(zipFiles['package.json']!)) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    expect(
      Object.keys(packageJson.dependencies ?? {}).filter((name) => name.startsWith('@tessellate/'))
    ).toEqual([]);
    expect(
      Object.keys(packageJson.devDependencies ?? {}).filter((name) =>
        name.startsWith('@tessellate/')
      )
    ).toEqual([]);
    const exportedManifest = ProjectManifestSchema.parse(
      JSON.parse(strFromU8(zipFiles['project.tess.json']!))
    );
    expect(withoutUpdatedAt(exportedManifest)).toEqual(withoutUpdatedAt(finalManifest));
    const finalKpi = findManifestNode(
      exportedManifest,
      'Team Overview',
      (node) => node.id === kpi.id
    );
    expect(finalKpi.locks?.node).toBe(true);
    expect(_computeCanonicalSubtreeHash(finalKpi)).toBe(lockedHash);
    expect(
      findManifestNode(exportedManifest, 'Team Overview', (node) => node.id === activity.id)
        .resourceRef?.slug
    ).toBe(replacementSlug);

    if (!isMobile) {
      // Extract the downloaded ZIP into a clean OS temp directory; never reuse the repository's node_modules.
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-user-zip-e2e-'));
      let previewProcess: ReturnType<typeof spawn> | null = null;
      const previewPort = 4299;
      try {
        for (const [filePath, contents] of Object.entries(zipFiles)) {
          const destination = path.resolve(tempDir, filePath);
          if (!destination.startsWith(`${tempDir}${path.sep}`))
            throw new Error(`Unsafe export path: ${filePath}`);
          fs.mkdirSync(path.dirname(destination), { recursive: true });
          fs.writeFileSync(destination, contents);
        }
        execSync('pnpm install --prefer-offline --ignore-scripts', { cwd: tempDir, stdio: 'pipe' });
        execSync('pnpm build', { cwd: tempDir, stdio: 'pipe' });
        const viteCli = path.join(tempDir, 'node_modules', 'vite', 'bin', 'vite.js');
        previewProcess = spawn(
          process.execPath,
          [
            viteCli,
            'preview',
            '--host',
            '127.0.0.1',
            '--port',
            String(previewPort),
            '--strictPort',
          ],
          {
            cwd: tempDir,
            stdio: ['ignore', 'pipe', 'pipe'],
          }
        );
        const previewUrl = `http://127.0.0.1:${previewPort}`;
        let ready = false;
        for (let attempt = 0; attempt < 100; attempt += 1) {
          if (previewProcess.exitCode !== null)
            throw new Error(`Standalone preview exited with code ${previewProcess.exitCode}`);
          try {
            const response = await fetch(previewUrl);
            if (response.ok) {
              ready = true;
              break;
            }
          } catch {
            /* wait for Vite to bind */
          }
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        expect(ready).toBe(true);

        const standalonePage = await page.context().newPage();
        const standaloneErrors: string[] = [];
        standalonePage.on('pageerror', (error) => standaloneErrors.push(error.message));
        standalonePage.on('console', (message) => {
          if (message.type() === 'error') standaloneErrors.push(message.text());
        });
        try {
          for (const size of [
            { width: 1440, height: 900 },
            { width: 390, height: 844 },
          ]) {
            await standalonePage.setViewportSize(size);
            await standalonePage.goto(previewUrl);
            await expect(standalonePage).toHaveTitle(finalManifest.name);
            const teamsLink = standalonePage
              .locator(
                `a[href="#${finalManifest.screens.find((screen) => screen.name === 'Teams')!.id}"]`
              )
              .first();
            await expect(teamsLink).toBeVisible();
            await teamsLink.click();
            await expect(standalonePage.locator('.tess-screen')).toHaveAttribute(
              'data-screen-id',
              finalManifest.screens.find((screen) => screen.name === 'Teams')!.id
            );
            const teamsTable = findManifestNode(
              finalManifest,
              'Teams',
              (node) => node.semanticRole === 'data-table'
            );
            await expect(standalonePage.locator(`[data-node-id="${teamsTable.id}"]`)).toBeVisible();
            const documentWidth = await standalonePage.evaluate(
              () => document.documentElement.scrollWidth
            );
            expect(documentWidth).toBeLessThanOrEqual(size.width);
            const overviewLink = standalonePage
              .locator(
                `a[href="#${finalManifest.screens.find((screen) => screen.name === 'Team Overview')!.id}"]`
              )
              .first();
            await overviewLink.click();
            await expect(standalonePage.locator(`[data-node-id="${activity.id}"]`)).toBeVisible();
            await expect(standalonePage.locator(`[data-node-id="${kpi.id}"]`)).toBeVisible();
            await expect(
              standalonePage.locator(
                '[data-testid="missing-resource-recovery"], [data-testid="unresolved-required-role-diagnostic"]'
              )
            ).toHaveCount(0);
          }
        } finally {
          await standalonePage.close();
        }
        expect(standaloneErrors).toEqual([]);
      } finally {
        if (previewProcess) {
          try {
            if (process.platform === 'win32' && previewProcess.pid)
              execSync(`taskkill /pid ${previewProcess.pid} /T /F`, { stdio: 'ignore' });
            else previewProcess.kill('SIGTERM');
          } catch {
            /* process may have exited during test cleanup */
          }
        }
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }

    fs.writeFileSync(
      path.join(evidenceDir, `employee-workflow-${viewportLabel}.json`),
      `${JSON.stringify(
        {
          brief: exactBrief,
          viewport: page.viewportSize(),
          route: page.url(),
          projectId: finalManifest.id,
          selectedDirection: 'C',
          screens: finalManifest.screens.map((screen) => screen.name),
          lockedNode: {
            id: kpi.id,
            subtreeSha256: lockedHash,
            resource: finalKpi.resourceRef?.slug,
          },
          replacement: { nodeId: activity.id, resource: replacementSlug },
          undoRedo:
            'surprise, replacement and recomposition restored exactly through exported manifests',
          standaloneZip: {
            filename: zipDownload.suggestedFilename(),
            files: Object.keys(zipFiles).length,
            builtAndBrowsed: !isMobile,
          },
          screenshot: path.relative(process.cwd(), workbenchScreenshot),
          consoleErrors,
          consoleWarnings,
          uncaughtExceptions,
          failedRequests,
          httpErrors,
        },
        null,
        2
      )}\n`
    );
    expect(consoleErrors).toEqual([]);
    expect(consoleWarnings).toEqual([]);
    expect(uncaughtExceptions).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(httpErrors).toEqual([]);
  });

  // Test 2: Regression Suite — Financial Trading Terminal
  test('regression suite: financial trading terminal flow with locks, recomposition and zip export', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Desktop studio workflow targets desktop viewport');
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    // Step 1: Open /compose
    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');

    await expect(
      page.getByRole('heading', { name: 'Describe the product. Get the interface.' })
    ).toBeVisible();

    const catalogStatus = page.locator('[data-testid="catalog-status"]');
    await expect(catalogStatus).toContainText('Catalogue ready', { timeout: 15000 });

    const promptText =
      'A high-density financial intelligence trading terminal with real-time portfolio risk feeds, interactive depth charts, and automated order execution for institutional desks';
    const descriptionArea = page.locator('textarea#description');
    await descriptionArea.fill(promptText);

    const feelInput = page.locator('input#feel');
    await feelInput.fill('professional but playful');

    const strikingBtn = page.locator('button:has-text("Striking")').first();
    if (await strikingBtn.isVisible()) {
      await strikingBtn.click();
    }

    const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
    await composeBtn.click();

    await expect(page.locator('text=Inferred Product Architecture').first()).toBeVisible({
      timeout: 15000,
    });

    const dirCard1 = page.locator('[data-testid="direction-card-01"]');
    const dirCard2 = page.locator('[data-testid="direction-card-02"]');
    const dirCard3 = page.locator('[data-testid="direction-card-03"]');

    await expect(dirCard1).toBeVisible();
    await expect(dirCard2).toBeVisible();
    await expect(dirCard3).toBeVisible();

    const preview1 = page.locator('[data-testid="direction-preview-01"]');
    const preview2 = page.locator('[data-testid="direction-preview-02"]');
    const preview3 = page.locator('[data-testid="direction-preview-03"]');
    await expect(preview1).toBeVisible();
    await expect(preview2).toBeVisible();
    await expect(preview3).toBeVisible();

    await assertZeroUnresolvedResources(page, preview1);
    await assertZeroUnresolvedResources(page, preview2);
    await assertZeroUnresolvedResources(page, preview3);

    const openDir3Btn = page.locator('[data-testid="open-workbench-dir-03"]');
    await openDir3Btn.click();

    await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
    const topToolbar = page.locator('[data-testid="top-toolbar"]');
    await expect(topToolbar).toBeVisible({ timeout: 10000 });

    await assertZeroUnresolvedResources(page);

    const layersTab = page
      .locator('aside[data-testid="left-panel"] button:has-text("Layers")')
      .first();
    if (await layersTab.isVisible()) {
      await layersTab.click();
    }

    const lockBtn = page.locator('[data-testid^="toggle-lock-"]').nth(1);
    await expect(lockBtn).toBeVisible({ timeout: 5000 });
    const lockTestId = await lockBtn.getAttribute('data-testid');
    expect(lockTestId).toBeTruthy();
    await lockBtn.click();

    await expect(lockBtn).toHaveAttribute('title', 'Node Locked');

    const recomposeBtn = page.locator('[data-testid="recompose-button"]');
    await expect(recomposeBtn).toBeVisible();
    await recomposeBtn.click();
    await page.waitForTimeout(1000);

    const lockedBtnAfterRecompose = page.locator(`[data-testid="${lockTestId}"]`);
    await expect(lockedBtnAfterRecompose).toBeVisible();
    await expect(lockedBtnAfterRecompose).toHaveAttribute('title', 'Node Locked');

    await assertZeroUnresolvedResources(page);

    const surpriseBtn = page.locator('[data-testid="surprise-me-button"]');
    await expect(surpriseBtn).toBeVisible();
    await surpriseBtn.click();
    await page.waitForTimeout(1000);

    const lockedBtnAfterSurprise = page.locator(`[data-testid="${lockTestId}"]`);
    await expect(lockedBtnAfterSurprise).toBeVisible();
    await expect(lockedBtnAfterSurprise).toHaveAttribute('title', 'Node Locked');

    await assertZeroUnresolvedResources(page);

    const exportBtn = page.locator('[data-testid="export-button"]');
    await exportBtn.click();

    const exportMenu = page.locator('[data-testid="export-menu"]');
    await expect(exportMenu).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    const zipBtn = page.locator('[data-testid="export-zip-btn"]');
    await zipBtn.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.zip$/);

    expect(consoleErrors).toEqual([]);
  });

  // Test 3: Mobile Composer Flow
  test('mobile composer to workbench acceptance flow', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific flow');
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/compose');
    await page.waitForLoadState('domcontentloaded');
    await expect(
      page.getByRole('heading', { name: 'Describe the product. Get the interface.' })
    ).toBeVisible();

    const catalogStatus = page.locator('[data-testid="catalog-status"]');
    await expect(catalogStatus).toContainText('Catalogue ready', { timeout: 15000 });

    const descriptionArea = page.locator('textarea#description');
    await descriptionArea.fill('Mobile financial intelligence portfolio overview');

    const composeBtn = page.locator('[data-testid="compose-submit-btn"]');
    await composeBtn.click();

    const dirCard1 = page.locator('[data-testid="direction-card-01"]');
    await expect(dirCard1).toBeVisible({ timeout: 10000 });

    const openDir1Btn = page.locator('[data-testid="open-workbench-dir-01"]');
    await openDir1Btn.click();

    await page.waitForURL(/\/workbench\?project=/, { timeout: 15000 });
    const mobileWorkbench = page.locator('[data-testid="mobile-workbench"]');
    await expect(mobileWorkbench).toBeVisible({ timeout: 10000 });

    await assertZeroUnresolvedResources(page);

    const activeProjectRaw = await page.evaluate(() =>
      localStorage.getItem('tessellate_active_project')
    );
    expect(activeProjectRaw).not.toBeNull();
    expect(activeProjectRaw).not.toContain('res_synth_');

    expect(consoleErrors).toEqual([]);
  });
});
