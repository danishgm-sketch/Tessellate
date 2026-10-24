import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';

const requireExporterDependency = createRequire(
  path.resolve(process.cwd(), 'packages/exporter/package.json')
);
const { strFromU8, unzipSync } = requireExporterDependency('fflate') as {
  strFromU8: (input: Uint8Array) => string;
  unzipSync: (input: Uint8Array) => Record<string, Uint8Array>;
};

type DirectionPreviewSnapshot = {
  id: string;
  dna: ProjectManifest['designDNA'];
  navigation: ProjectManifest['navigation'];
  screens: ProjectManifest['screens'];
  diagnostics: unknown[];
};

const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-16/after');
const handoffEvidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-24/after');
const exactBrief =
  'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

test('Compose Direction C opens the exact selected manifest in Workbench', async ({
  page,
}, testInfo) => {
  const runtime = {
    consoleErrors: [] as string[],
    consoleWarnings: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    responses: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
    if (message.type() === 'warning') runtime.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) =>
    runtime.responses.push({ url: response.url(), status: response.status() })
  );

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(exactBrief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined' }).click();
  await page.getByRole('button', { name: 'Radical' }).click();
  await page.getByTestId('compose-submit-btn').click();

  const directionC = page.getByTestId('direction-card-03');
  await expect(directionC).toBeVisible();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  await expect(directionC.locator('[data-testid="direction-preview-03"]')).toBeVisible();
  await expect(directionC.locator('[data-testid="missing-resource-recovery"]')).toHaveCount(0);
  await expect(
    directionC.locator('[data-testid="unresolved-required-role-diagnostic"]')
  ).toHaveCount(0);

  const directionFilters = page.locator(
    '[data-testid^="direction-preview-"] input[aria-label^="Filter "]'
  );
  await expect(directionFilters).toHaveCount(3);
  const filterFields = await directionFilters.evaluateAll((inputs) =>
    inputs.map((input) => ({
      id: (input as HTMLInputElement).id,
      name: (input as HTMLInputElement).name,
    }))
  );
  expect(filterFields.every((field) => field.id && field.name)).toBe(true);
  expect(new Set(filterFields.map((field) => field.id)).size).toBe(filterFields.length);

  const directionCFilter = directionC.locator(
    '[data-testid="direction-preview-03"] input[aria-label^="Filter "]'
  );
  await directionCFilter.fill('tessellate-no-match');
  await expect(directionC.getByRole('status')).toContainText('No records match this filter.');
  await directionCFilter.fill('');
  await expect(directionC.getByRole('status')).toHaveCount(0);

  mkdirSync(handoffEvidenceDirectory, { recursive: true });
  const directionScreenshot = path.resolve(
    handoffEvidenceDirectory,
    `employee-directions-${testInfo.project.name}.png`
  );
  await page.screenshot({ path: directionScreenshot, fullPage: true });

  const selectedProjectId = await directionC.getAttribute('data-project-id');
  expect(selectedProjectId).toBeTruthy();
  if (!selectedProjectId) throw new Error('Direction C did not expose its project id.');
  await directionC.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByText('Design DNA and resource references').click();
  const selectedPreview = JSON.parse(
    await dialog.locator('pre').innerText()
  ) as DirectionPreviewSnapshot;
  expect(selectedPreview.id).toBe(selectedProjectId);
  expect(selectedPreview.screens.length).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await directionC.getByTestId('open-workbench-dir-03').click();
  await expect(page).toHaveURL(new RegExp(`/workbench\\?project=${selectedProjectId}$`));
  if ((page.viewportSize()?.width ?? 1440) < 1024) {
    await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  } else {
    await expect(page.getByTestId('workbench-shell')).toBeVisible();
  }
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  const workbenchFieldIdentity = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('input, textarea, select')];
    const ids = controls.map((control) => control.id).filter(Boolean);
    return {
      controlsWithoutIdOrName: controls
        .filter((control) => !(control.id || control.getAttribute('name')))
        .map((control) => ({
          tag: control.tagName,
          type: control.getAttribute('type'),
          label: control.getAttribute('aria-label'),
        })),
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      unassociatedLabels: [...document.querySelectorAll('label')]
        .filter((label) => !label.control)
        .map((label) => label.textContent?.trim().replace(/\s+/g, ' ')),
    };
  });
  expect(workbenchFieldIdentity).toEqual({
    controlsWithoutIdOrName: [],
    duplicateIds: [],
    unassociatedLabels: [],
  });
  const workbenchControlsScreenshot = path.resolve(
    handoffEvidenceDirectory,
    `employee-workbench-controls-${testInfo.project.name}.png`
  );
  await page.screenshot({ path: workbenchControlsScreenshot, fullPage: true });

  const storageSnapshot = await page.evaluate(
    (projectId) => ({
      active: localStorage.getItem('tessellate_active_project'),
      project: localStorage.getItem(`tessellate_project_${projectId}`),
    }),
    selectedProjectId
  );
  expect(storageSnapshot.active).not.toBeNull();
  expect(storageSnapshot.project).not.toBeNull();
  const activeManifest = JSON.parse(storageSnapshot.active!) as ProjectManifest;
  const projectManifest = JSON.parse(storageSnapshot.project!) as ProjectManifest;

  expect(activeManifest.id).toBe(selectedProjectId);
  expect(projectManifest).toEqual(activeManifest);
  expect(activeManifest.designDNA).toEqual(selectedPreview.dna);
  expect(activeManifest.navigation).toEqual(selectedPreview.navigation);
  expect(activeManifest.screens).toEqual(selectedPreview.screens);
  expect(selectedPreview.diagnostics).toEqual([]);

  let sameProjectMobileEvidence: {
    projectId: string;
    manifestSha256: string;
    viewport: { width: number; height: number } | null;
    screenshot: string;
    documentWidth: number;
  } | null = null;
  if ((page.viewportSize()?.width ?? 1440) >= 1024) {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('mobile-workbench')).toBeVisible();
    const mobileWidth = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    expect(mobileWidth.viewport).toBe(390);
    expect(mobileWidth.document).toBeLessThanOrEqual(mobileWidth.viewport);
    const mobileScreenshot = path.resolve(
      handoffEvidenceDirectory,
      'employee-workbench-same-project-mobile-390.png'
    );
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    sameProjectMobileEvidence = {
      projectId: activeManifest.id,
      manifestSha256: hashManifest(activeManifest),
      viewport: page.viewportSize(),
      screenshot: path.relative(process.cwd(), mobileScreenshot),
      documentWidth: mobileWidth.document,
    };
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByTestId('workbench-shell')).toBeVisible();
  }

  const employeeContentChecks = inspectEmployeeExperienceContent(activeManifest);
  expect(employeeContentChecks.brandReferences).toBeGreaterThan(0);
  expect(employeeContentChecks.brandMismatches).toEqual([]);
  expect(employeeContentChecks.primaryMarketingTarget).toBe('Teams');
  expect(employeeContentChecks.secondaryMarketingTarget).toBe('Onboarding');
  expect(employeeContentChecks.teamsColumnLabels).toEqual({
    name: 'Team',
    type: 'Focus',
    quality: 'Members',
    status: 'Status',
  });
  expect(employeeContentChecks.teamsRows).not.toMatch(/Example colleague/i);
  expect(employeeContentChecks.engagementTitle).toBe('Feedback and recognition');
  expect(employeeContentChecks.engagementRowsDifferFromOverview).toBe(true);
  expect(employeeContentChecks.settingsNavigationRoles).toEqual(['navigation']);
  expect(employeeContentChecks.policyPreviewLabel).toBe('Policy acknowledgement (preview only)');
  expect(employeeContentChecks.policyPreviewIsNotStored).toBe(true);

  await page.getByTestId('top-toolbar').getByRole('button', { name: 'Preview' }).click();
  const preview = page.getByTestId('preview-modal');
  await expect(preview).toBeVisible();
  const screenScreenshots: string[] = [];
  const captureScreen = async (screenName: string) => {
    const file = path.join(
      handoffEvidenceDirectory,
      `employee-product-${screenName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${testInfo.project.name}.png`
    );
    await preview.screenshot({ path: file });
    screenScreenshots.push(path.relative(process.cwd(), file));
  };
  const selectPreviewScreen = async (screenName: string) => {
    const screen = activeManifest.screens.find((item) => item.name === screenName);
    if (!screen) throw new Error(`Employee experience is missing the ${screenName} screen.`);
    await preview.getByLabel('Preview screen').selectOption(screen.id);
  };

  await preview.getByRole('link', { name: 'Explore onboarding', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#${activeManifest.screens.find((screen) => screen.name === 'Onboarding')!.id}$`));
  await expect(preview.getByText('Your onboarding journey')).toBeVisible();
  await selectPreviewScreen('Marketing Home');
  await preview.getByRole('link', { name: 'Meet your team', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#${activeManifest.screens.find((screen) => screen.name === 'Teams')!.id}$`));
  await expect(
    preview.locator('td:visible, h3:visible').filter({ hasText: 'Example Product team' }).first()
  ).toBeVisible();
  const pagingControl = preview.getByRole('button', { name: 'Paging unavailable' });
  await expect(pagingControl).toBeDisabled();
  await expect(pagingControl).toHaveAttribute('title', /connect a paging data source/i);
  await captureScreen('teams');

  await selectPreviewScreen('Engagement');
  await expect(
    preview.locator('td:visible, h3:visible').filter({ hasText: 'Example feedback topic' }).first()
  ).toBeVisible();
  await captureScreen('engagement');
  await selectPreviewScreen('Settings & Policies');
  await expect(preview.getByLabel('Policy acknowledgement (preview only)')).toBeVisible();
  await expect(preview.getByText(/acknowledgements are not stored in this preview/i)).toBeVisible();
  await expect(preview.getByRole('button', { name: 'Save preferences' })).toBeDisabled();
  await expect(preview.getByText('Connect persistence to save.')).toBeVisible();
  await captureScreen('settings-policies');
  await selectPreviewScreen('Marketing Home');
  await page.getByRole('button', { name: 'Exit Preview' }).click();
  await expect(preview).toHaveCount(0);

  await page.getByTestId('export-button').click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPromise;
  const downloadPath = testInfo.outputPath('direction-c.tess.json');
  await download.saveAs(downloadPath);
  const exportedManifest = JSON.parse(readFileSync(downloadPath, 'utf8')) as ProjectManifest;
  ProjectManifestSchema.parse(exportedManifest);
  expect(exportedManifest).toEqual(activeManifest);
  const activeManifestSha256 = hashManifest(activeManifest);
  const exportedManifestSha256 = hashManifest(exportedManifest);
  expect(exportedManifestSha256).toBe(activeManifestSha256);

  const exportButton = page.getByTestId('export-button');
  await exportButton.focus();
  await page.keyboard.press('Enter');
  const handoffButton = page.getByTestId('export-agent-handoff-btn');
  const exportMenu = page.getByTestId('export-menu');
  await expect(exportMenu).toBeVisible();
  const exportActions = exportMenu.getByRole('button');
  for (let index = 0; index < await exportActions.count(); index += 1) {
    await page.keyboard.press('Tab');
    await expect(exportActions.nth(index)).toBeFocused();
  }
  await expect(handoffButton).toBeFocused();
  mkdirSync(handoffEvidenceDirectory, { recursive: true });
  const handoffMenuScreenshot = path.join(
    handoffEvidenceDirectory,
    `workbench-agent-handoff-menu-${testInfo.project.name}.png`
  );
  await page.screenshot({ path: handoffMenuScreenshot });
  const handoffDownloadPromise = page.waitForEvent('download');
  await page.keyboard.press('Enter');
  const handoffDownload = await handoffDownloadPromise;
  expect(handoffDownload.suggestedFilename()).toMatch(/-agent-handoff\.zip$/);
  const handoffPath = testInfo.outputPath('employee-experience-agent-handoff.zip');
  await handoffDownload.saveAs(handoffPath);
  const retainedHandoffPath = path.resolve(
    handoffEvidenceDirectory,
    'employee-experience-agent-handoff.zip'
  );
  if (testInfo.project.name === 'desktop-chrome') {
    copyFileSync(handoffPath, retainedHandoffPath);
  }
  const handoffFiles = unzipSync(readFileSync(handoffPath));
  expect(Object.keys(handoffFiles).sort()).toEqual(
    [
      'AGENT_PROMPT.md',
      'COMPONENTS.md',
      'DESIGN.md',
      'IMPLEMENTATION.md',
      'PRODUCT.md',
      'dependencies.json',
      'project.tess.json',
    ].sort()
  );
  const handoffManifest = JSON.parse(
    strFromU8(handoffFiles['project.tess.json']!)
  ) as ProjectManifest;
  ProjectManifestSchema.parse(handoffManifest);
  expect(handoffManifest).toEqual(activeManifest);
  const productDocument = strFromU8(handoffFiles['PRODUCT.md']!);
  const implementationDocument = strFromU8(handoffFiles['IMPLEMENTATION.md']!);
  expect(productDocument).toContain(activeManifest.productModel.primaryAudience);
  expect(productDocument).toContain(activeManifest.productModel.primaryObjective);
  for (const screen of activeManifest.screens) expect(productDocument + strFromU8(handoffFiles['IMPLEMENTATION.md']!)).toContain(screen.name);
  expect(implementationDocument).toContain('does not implement pathname routing');
  for (const screen of activeManifest.screens) {
    const normalizedSlug = screen.slug.replace(/^\/+|\/+$/g, '');
    expect(implementationDocument).toContain(`declared path \`/${normalizedSlug}\``);
  }
  expect(productDocument).not.toMatch(/order book|trading desk|portfolio allocation/i);
  const componentsDocument = strFromU8(handoffFiles['COMPONENTS.md']!);
  for (const lock of activeManifest.locks) expect(componentsDocument).toContain(lock.targetNodeId);
  const dependenciesDocument = JSON.parse(strFromU8(handoffFiles['dependencies.json']!)) as {
    project: { id: string };
    tessellateRuntimeDependencies: string[];
    dependencyPolicyReview: {
      status: string;
      unapprovedRuntimeDependencies: string[];
      prohibitedRuntimeDependencies: string[];
    };
  };
  expect(dependenciesDocument.project.id).toBe(activeManifest.id);
  expect(dependenciesDocument.tessellateRuntimeDependencies).toEqual([]);
  const handoffEvidence = {
    filename: handoffDownload.suggestedFilename(),
    files: Object.keys(handoffFiles).sort(),
    projectIdMatchesWorkbench: handoffManifest.id === activeManifest.id,
    fullManifestMatchesWorkbench: stableStringify(handoffManifest) === stableStringify(activeManifest),
    productAudienceMatchesWorkbench: productDocument.includes(activeManifest.productModel.primaryAudience),
    productObjectiveMatchesWorkbench: productDocument.includes(activeManifest.productModel.primaryObjective),
    lockTargets: activeManifest.locks.map((lock) => lock.targetNodeId),
    resourceReferenceCount: countManifestNodes(activeManifest.screens).resourceRefs.length,
    hasTessellateRuntimeDependencies: dependenciesDocument.tessellateRuntimeDependencies.length > 0,
    dependencyPolicyReview: dependenciesDocument.dependencyPolicyReview,
    retainedArchive: testInfo.project.name === 'desktop-chrome'
      ? path.relative(process.cwd(), retainedHandoffPath)
      : null,
    screenshot: path.relative(process.cwd(), handoffMenuScreenshot),
  };

  const counts = countManifestNodes(activeManifest.screens);
  const report = {
    exactBrief,
    route: page.url(),
    viewport: page.viewportSize(),
    selectedDirection: 'C',
    selectedProjectId,
    directionScreenshot: path.relative(process.cwd(), directionScreenshot),
    visibleDirectionSnapshot: selectedPreview,
    employeeContentChecks,
    screenScreenshots,
    persistedManifestSnapshot: activeManifest,
    manifestChecks: {
      storedKeyMatchesActiveManifest: true,
      workbenchManifestMatchesVisiblePreview: true,
      manifestExportMatchesWorkbench: true,
      fieldsCompared: [
        'project id',
        'Design DNA',
        'screen list and node trees',
        'navigation model',
        'resource refs',
        'variants',
        'props',
        'slots',
        'node and project locks',
      ],
      screenCount: activeManifest.screens.length,
      nodeCount: counts.nodes,
      resourceRefs: counts.resourceRefs,
      projectLocks: activeManifest.locks,
      activeManifestSha256,
      exportedManifestSha256,
    },
    handoffChecks: handoffEvidence,
    sameProjectMobileEvidence,
    workbenchFieldIdentity,
    workbenchControlsScreenshot: path.relative(process.cwd(), workbenchControlsScreenshot),
    runtime,
  };
  mkdirSync(evidenceDirectory, { recursive: true });
  const project = testInfo.project.name;
  await page.screenshot({
    path: path.join(evidenceDirectory, `compose-workbench-handoff-${project}.png`),
    fullPage: true,
  });
  writeFileSync(
    path.join(evidenceDirectory, `compose-workbench-handoff-${project}.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );
  writeFileSync(
    path.join(handoffEvidenceDirectory, `agent-handoff-${project}.json`),
    `${JSON.stringify({
      route: page.url(),
      viewport: page.viewportSize(),
      selectedProjectId,
      handoff: handoffEvidence,
      sameProjectMobileEvidence,
      consoleErrors: runtime.consoleErrors,
      consoleWarnings: runtime.consoleWarnings,
      uncaughtExceptions: runtime.uncaughtExceptions,
      failedRequests: runtime.failedRequests,
      httpErrors: runtime.responses.filter((response) => response.status >= 400),
    }, null, 2)}\n`
  );

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.consoleWarnings).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.responses.filter((response) => response.status >= 400)).toEqual([]);
});

function countManifestNodes(screens: ProjectManifest['screens']) {
  let nodes = 0;
  const resourceRefs: Array<{ id?: string; slug?: string; version?: string; variant?: string }> =
    [];
  const visit = (node: ProjectNode) => {
    nodes++;
    if (node.resourceRef) resourceRefs.push({ ...node.resourceRef, variant: node.variant });
    for (const child of node.children) visit(child);
  };
  for (const screen of screens) visit(screen.rootNode);
  return { nodes, resourceRefs };
}

function inspectEmployeeExperienceContent(manifest: ProjectManifest) {
  const nodesForScreen = (screenName: string) => {
    const screen = manifest.screens.find((item) => item.name === screenName);
    if (!screen) throw new Error(`Employee experience is missing the ${screenName} screen.`);
    const nodes: ProjectNode[] = [];
    const visit = (node: ProjectNode) => {
      nodes.push(node);
      node.children.forEach(visit);
    };
    visit(screen.rootNode);
    return nodes;
  };
  const byRole = (screenName: string, role: string) => {
    const node = nodesForScreen(screenName).find((item) => item.semanticRole === role);
    if (!node) throw new Error(`${screenName} has no ${role} node.`);
    return node;
  };
  const targetName = (href: string) =>
    manifest.screens.find((screen) => `#${screen.id}` === href)?.name ?? 'unresolved';
  const hero = byRole('Marketing Home', 'hero');
  const primaryCta = hero.props.primaryCta as { href: string };
  const secondaryCta = hero.props.secondaryCta as { href: string };
  const teamTable = byRole('Teams', 'data-table');
  const overviewTable = byRole('Team Overview', 'data-table');
  const engagementTable = byRole('Engagement', 'data-table');
  const settingsField = byRole('Settings & Policies', 'settings-form');
  const settingsNavigationRoles = nodesForScreen('Settings & Policies')
    .filter((node) => ['navigation', 'settings-nav'].includes(node.semanticRole))
    .map((node) => node.semanticRole);
  const brandNodes = manifest.screens.flatMap((screen) => nodesForScreen(screen.name))
    .filter((node) => typeof node.props.brand === 'string');

  return {
    brandReferences: brandNodes.length,
    brandMismatches: brandNodes
      .filter((node) => node.props.brand !== manifest.brand?.name)
      .map((node) => ({ nodeId: node.id, actual: node.props.brand, expected: manifest.brand?.name })),
    primaryMarketingTarget: targetName(primaryCta.href),
    secondaryMarketingTarget: targetName(secondaryCta.href),
    teamsColumnLabels: teamTable.props.columnLabels,
    teamsRows: JSON.stringify(teamTable.props.rows),
    engagementTitle: engagementTable.props.title,
    engagementRowsDifferFromOverview:
      JSON.stringify(engagementTable.props.rows) !== JSON.stringify(overviewTable.props.rows),
    settingsNavigationRoles,
    policyPreviewLabel: settingsField.props.label,
    policyPreviewIsNotStored: /not stored/i.test(String(settingsField.props.helperText)),
  };
}

function hashManifest(manifest: ProjectManifest) {
  return createHash('sha256').update(stableStringify(manifest)).digest('hex');
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).sort(([left], [right]) => left.localeCompare(right));
    return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}
