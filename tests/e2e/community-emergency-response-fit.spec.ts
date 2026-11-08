import { expect, test } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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

const evidenceDirectory = path.resolve(process.cwd(), 'quality/evidence/AUD-527');
const exactBrief =
  'A volunteer mutual-aid network for a flood-prone coastal town. Coordinate requests for bottled water, charging, blankets, accessible transport, and welfare checks between three shelters and six neighborhood hubs. Needs shared-tablet intake that works during outages, multilingual updates, disability-aware prioritisation, volunteer shift handoffs, and stock visibility. Never collect immigration status, diagnoses, or financial data; no payments or fundraising. Public status should show only aggregated capacity and safe pickup points. Record requests locally for later sync, but do not imply that SMS dispatch, live mapping, or synchronisation works while disconnected.';
const expectedScreens = [
  'Coordination Overview',
  'Request Intake & Triage',
  'Shelter & Hub Capacity',
  'Supplies & Distribution',
  'Volunteer Shift Handover',
  'Public Capacity Status',
];

function flattenNodes(node: ProjectNode): ProjectNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

test('community emergency response composes, edits, persists, and exports honestly', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const runtime = {
    consoleErrors: [] as string[],
    uncaughtExceptions: [] as string[],
    failedRequests: [] as Array<{ url: string; error: string | null }>,
    httpErrors: [] as Array<{ url: string; status: number }>,
  };
  page.on('console', (message) => {
    if (message.type() === 'error') runtime.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtime.uncaughtExceptions.push(error.message));
  page.on('requestfailed', (request) =>
    runtime.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null })
  );
  page.on('response', (response) => {
    if (response.status() >= 400) {
      runtime.httpErrors.push({ url: response.url(), status: response.status() });
    }
  });

  await page.goto('/compose');
  await expect(page.getByRole('heading', { name: 'Product Composer' })).toBeVisible();
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(exactBrief);
  await page.locator('#feel').fill('clear, steady, civic, resilient, accessible');
  await page.getByTestId('compose-submit-btn').click();

  const directionNames = ['Coordination Desk', 'Neighbourhood Commons', 'Field Operations'];
  await expect(page.getByText('Community Emergency Response', { exact: true })).toBeVisible();
  await expect(page.locator('[data-testid^="direction-card-"]')).toHaveCount(3);
  const snapshots: Array<{ direction: string; screenNames: string[]; resourceCount: number }> = [];

  for (const [index, name] of directionNames.entries()) {
    const number = String(index + 1).padStart(2, '0');
    const card = page.getByTestId(`direction-card-${number}`);
    await expect(card.getByRole('heading', { name })).toBeVisible();
    await expect(card).toContainText(
      index === 0 ? 'Clear requests' : index === 1 ? 'safe pickup guidance' : 'shift handovers'
    );
    await expect(card.getByTestId(`direction-preview-${number}`)).toBeVisible();
    await expect(card.getByTestId(`direction-diagnostics-summary-${number}`)).toHaveCount(0);

    await card.getByRole('button', { name: 'Inspect full preview and DNA' }).click();
    const dialog = page.getByRole('dialog', { name: new RegExp(`Direction ${number}`) });
    await expect(dialog).toBeVisible();
    const manifestDetails = dialog
      .locator('details')
      .filter({ hasText: 'Design DNA and resource references' });
    await manifestDetails.locator('summary').click();
    const preview = JSON.parse(await manifestDetails.locator('pre').innerText()) as {
      id: string;
      screens: ProjectManifest['screens'];
      diagnostics: unknown[];
    };
    const screenNames = preview.screens.map((screen) => screen.name);
    expect(screenNames).toEqual(expect.arrayContaining(expectedScreens));
    expect(screenNames).not.toEqual(
      expect.arrayContaining(['Marketing Home', 'Overview Dashboard', 'Projects Index'])
    );
    expect(preview.diagnostics).toEqual([]);
    const serializedNodes = JSON.stringify(preview.screens);
    expect(serializedNodes).toContain('Community Response');
    expect(serializedNodes).toContain('Example response updates');
    expect(serializedNodes).toContain('This preview does not store requests');
    expect(serializedNodes).not.toMatch(
      /unresolvedRequiredRole|live shelter map is connected|automatic offline sync/i
    );
    const resourceCount = preview.screens.reduce(
      (total, screen) =>
        total + flattenNodes(screen.rootNode).filter((node) => node.resourceRef).length,
      0
    );
    expect(resourceCount).toBeGreaterThan(0);
    snapshots.push({ direction: name, screenNames, resourceCount });

    if (index === 0) {
      const screenSelect = dialog.getByLabel('Direction preview screen');
      const canvas = dialog.locator('.tess-screen');
      await screenSelect.selectOption({ label: 'Coordination Overview' });
      await expect(canvas).toContainText('Example response updates');
      await expect(canvas).toContainText('Sample request queued for review');

      await screenSelect.selectOption({ label: 'Request Intake & Triage' });
      const intake = canvas.getByLabel('Aid type and assigned hub (preview only)');
      await expect(intake).toBeDisabled();
      await expect(intake).toHaveAttribute('placeholder', /entries are not saved or synced/i);
      await expect(
        canvas.getByText(/do not enter names, contact details, diagnoses/i)
      ).toBeVisible();
      const recordButton = canvas.getByRole('button', { name: 'Record request preview' });
      await expect(recordButton).toBeDisabled();
      await expect(recordButton).toHaveAttribute(
        'title',
        'Example only. No request or handover is recorded.'
      );
      await expect(
        canvas.getByText(
          'Example only. This preview does not store requests or handovers or sync after outages.',
          { exact: true }
        )
      ).toBeVisible();

      await screenSelect.selectOption({ label: 'Shelter & Hub Capacity' });
      await expect(canvas).toContainText('Example coastal shelter');
      await expect(canvas).toContainText('Capacity not connected');

      await screenSelect.selectOption({ label: 'Supplies & Distribution' });
      await expect(canvas).toContainText('Example bottled water');
      await expect(canvas).toContainText('Quantity not connected');

      await screenSelect.selectOption({ label: 'Volunteer Shift Handover' });
      const handover = canvas.getByLabel('Shift handover notes (preview only)');
      await expect(handover).toBeDisabled();
      const handoverButton = canvas.getByRole('button', { name: 'Save handover preview' });
      await expect(handoverButton).toBeDisabled();

      await screenSelect.selectOption({ label: 'Public Capacity Status' });
      await expect(canvas).toContainText('Example public capacity updates');
      await expect(canvas).toContainText('Not shown on public status');
      await expect(canvas).toContainText('no individual requests or welfare checks');
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }

  mkdirSync(evidenceDirectory, { recursive: true });
  const directionScreenshot = path.join(
    evidenceDirectory,
    `community-emergency-directions-${testInfo.project.name}.png`
  );
  await page.screenshot({ path: directionScreenshot, fullPage: true });
  const desktopWidth = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(desktopWidth.document).toBeLessThanOrEqual(desktopWidth.viewport);

  const selectedCard = page.getByTestId('direction-card-01');
  const selectedProjectId = await selectedCard.getAttribute('data-project-id');
  expect(selectedProjectId).toBeTruthy();
  if (!selectedProjectId) throw new Error('The selected direction did not expose a project id.');
  await selectedCard.getByTestId('open-workbench-dir-01').click();
  await expect(page).toHaveURL(new RegExp(`/workbench\\?project=${selectedProjectId}$`));
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Workbench: Coordination Desk/ })).toBeAttached();
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  const projectBeforeEdit = (await page.evaluate(
    (projectId) => JSON.parse(localStorage.getItem(`tessellate_project_${projectId}`) ?? 'null'),
    selectedProjectId
  )) as ProjectManifest | null;
  expect(projectBeforeEdit).not.toBeNull();
  expect(projectBeforeEdit?.brand?.name).toBe('Community Response');
  expect(projectBeforeEdit?.screens.map((screen) => screen.name)).toEqual(
    expect.arrayContaining(expectedScreens)
  );

  const projectNameButton = page.locator('button[title="Click to rename project"]');
  await projectNameButton.click();
  const editedName = 'Coastal Response Study — edited';
  await page.getByRole('textbox', { name: 'Project name' }).fill(editedName);
  await page.getByRole('textbox', { name: 'Project name' }).press('Enter');
  await expect(projectNameButton).toHaveText(editedName);
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');

  const beforeReload = (await page.evaluate(
    (projectId) => ({
      active: JSON.parse(localStorage.getItem('tessellate_active_project') ?? 'null'),
      project: JSON.parse(localStorage.getItem(`tessellate_project_${projectId}`) ?? 'null'),
    }),
    selectedProjectId
  )) as { active: ProjectManifest | null; project: ProjectManifest | null };
  expect(beforeReload.active?.name).toBe(editedName);
  expect(beforeReload.project).toEqual(beforeReload.active);

  await page.reload();
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  await expect(projectNameButton).toHaveText(editedName);
  await expect(page.getByTestId('history-save-status')).toHaveAttribute('data-state', 'saved');
  const workbenchScreenshot = path.join(
    evidenceDirectory,
    `community-emergency-workbench-${testInfo.project.name}.png`
  );
  await page.screenshot({ path: workbenchScreenshot, fullPage: true });

  const manifestDownloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-manifest-btn').click();
  const manifestDownload = await manifestDownloadPromise;
  const manifestPath = testInfo.outputPath('community-emergency-response.tess.json');
  await manifestDownload.saveAs(manifestPath);
  const exportedManifest = ProjectManifestSchema.parse(
    JSON.parse(readFileSync(manifestPath, 'utf8'))
  ) as ProjectManifest;
  expect(exportedManifest).toEqual(beforeReload.active);
  expect(manifestDownload.suggestedFilename()).toMatch(/\.tess\.json$/);

  const zipDownloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-button').click();
  await page.getByTestId('export-zip-btn').click();
  const zipDownload = await zipDownloadPromise;
  const zipPath = testInfo.outputPath('community-emergency-response.zip');
  await zipDownload.saveAs(zipPath);
  await expect(page.getByTestId('export-status')).toContainText(
    'Standalone React project download started'
  );
  const zipFiles = unzipSync(new Uint8Array(readFileSync(zipPath)));
  expect(Object.keys(zipFiles).sort()).toEqual(
    expect.arrayContaining(['package.json', 'src/App.tsx', 'src/main.tsx', 'index.html'])
  );
  const exportedPackage = JSON.parse(strFromU8(zipFiles['package.json']!)) as {
    scripts?: { build?: string };
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  expect(exportedPackage.scripts?.build).toBeTruthy();
  expect(exportedPackage.dependencies?.react).toBeTruthy();
  const exportedRequestScreen = strFromU8(zipFiles['src/screens/RequestIntakeTriage.tsx']!);
  const exportedButtonSource = strFromU8(zipFiles['src/components/Button.tsx']!);
  expect(exportedRequestScreen).toContain(
    'title={"Example only. No request or handover is recorded."}'
  );
  expect(exportedRequestScreen).toContain(
    'helperText={"Example only. This preview does not store requests or handovers or sync after outages."}'
  );
  expect(exportedButtonSource).toContain('aria-describedby={descriptionReferences}');
  expect(exportedButtonSource).toContain('{helperText}</p>');

  const workbenchWidth = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(workbenchWidth.document).toBeLessThanOrEqual(workbenchWidth.viewport);
  const report = {
    brief: exactBrief,
    route: page.url(),
    viewport: page.viewportSize(),
    directions: snapshots,
    selectedProjectId,
    editPersistedAcrossReload: true,
    manifestExportMatchesSavedProject: true,
    standaloneZipFiles: Object.keys(zipFiles).sort(),
    standalonePackageScripts: exportedPackage.scripts,
    standaloneExportDisclosures: {
      recordRequestHelperText: true,
      recordRequestTitle: true,
      buttonHelperTextAccessibleDescription: true,
    },
    screenshots: [directionScreenshot, workbenchScreenshot].map((file) =>
      path.relative(process.cwd(), file)
    ),
    runtime,
    widthChecks: { compose: desktopWidth, workbench: workbenchWidth },
  };
  writeFileSync(
    path.join(evidenceDirectory, `community-emergency-response-${testInfo.project.name}.json`),
    `${JSON.stringify(report, null, 2)}\n`
  );

  expect(runtime.consoleErrors).toEqual([]);
  expect(runtime.uncaughtExceptions).toEqual([]);
  expect(runtime.failedRequests).toEqual([]);
  expect(runtime.httpErrors).toEqual([]);
});
