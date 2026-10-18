import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  ProjectManifestSchema,
  type ProjectManifest,
  type ProjectNode,
} from '../../packages/schemas/src/index.js';

type DirectionPreviewSnapshot = {
  id: string;
  dna: ProjectManifest['designDNA'];
  navigation: ProjectManifest['navigation'];
  screens: ProjectManifest['screens'];
  diagnostics: unknown[];
};

const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/step-16/after');
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
  if (testInfo.project.name === 'mobile-chrome') {
    await expect(page.getByTestId('mobile-workbench')).toBeVisible();
  } else {
    await expect(page.getByTestId('workbench-shell')).toBeVisible();
  }
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

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

  const counts = countManifestNodes(activeManifest.screens);
  const report = {
    exactBrief,
    route: page.url(),
    viewport: page.viewportSize(),
    selectedDirection: 'C',
    selectedProjectId,
    visibleDirectionSnapshot: selectedPreview,
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
