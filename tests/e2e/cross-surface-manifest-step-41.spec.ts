import { test, expect, type Page, type TestInfo } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { ProjectManifestSchema } from '../../packages/schemas/src/index.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cliSource = path.join(repoRoot, 'packages/cli/src/bin.ts');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const mcpRequire = createRequire(path.join(repoRoot, 'packages/mcp/package.json'));
const exporterRequire = createRequire(path.join(repoRoot, 'packages/exporter/package.json'));
const { strFromU8, unzipSync } = exporterRequire('fflate') as {
  strFromU8(input: Uint8Array): string;
  unzipSync(input: Uint8Array): Record<string, Uint8Array>;
};

type McpResult = {
  isError?: boolean;
  content: Array<{ type: string; text?: string }>;
};

type McpClientLike = {
  connect(transport: unknown): Promise<void>;
  callTool(request: { name: string; arguments: Record<string, unknown> }): Promise<McpResult>;
  close(): Promise<void>;
};

type StdioTransportLike = {
  stderr?: { on(event: 'data', listener: (chunk: Buffer | string) => void): void };
};

function makeMcpClient() {
  const { Client } = mcpRequire('@modelcontextprotocol/sdk/client/index.js') as {
    Client: new (
      clientInfo: { name: string; version: string },
      options: { capabilities: Record<string, never> },
    ) => McpClientLike;
  };
  const { StdioClientTransport } = mcpRequire(
    '@modelcontextprotocol/sdk/client/stdio.js',
  ) as {
    StdioClientTransport: new (options: {
      command: string;
      args: string[];
      cwd: string;
      stderr: 'pipe';
    }) => StdioTransportLike;
  };

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [tsxCli, path.join(repoRoot, 'packages/mcp/src/index.ts')],
    cwd: repoRoot,
    stderr: 'pipe',
  });
  const client = new Client({ name: 'tessellate-cross-surface-e2e', version: '1.0.0' }, {
    capabilities: {},
  });

  return { client, transport };
}

function runCli(...args: string[]) {
  return spawnSync(process.execPath, [tsxCli, cliSource, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    timeout: 30_000,
    windowsHide: true,
  });
}

function listFiles(root: string, prefix = ''): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of fs.readdirSync(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix.replaceAll(path.sep, '/'), entry.name);
    if (entry.isDirectory()) {
      Object.assign(files, listFiles(root, relative));
    } else {
      files[relative] = fs.readFileSync(path.join(root, relative), 'utf8');
    }
  }
  return files;
}

async function exportManifestFromWorkbench(page: Page, testInfo: TestInfo) {
  const brief =
    'Build a professional but playful employee experience platform for a 500-person technology company. The marketing site should feel warm and energetic, while the application itself should feel professional, fast and trustworthy. Make the dashboard refined, make onboarding playful, keep settings conservative.';

  await page.goto('/compose');
  await expect(page.getByTestId('catalog-status')).toContainText('Catalogue ready');
  await page.locator('#description').fill(brief);
  await page.locator('#feel').fill('professional but playful');
  await page.getByRole('button', { name: 'Refined', exact: true }).click();
  await page.getByRole('button', { name: 'Radical', exact: true }).click();
  await page.getByTestId('compose-submit-btn').click();
  await expect(page.getByText('Inferred Product Architecture', { exact: true })).toBeVisible();
  const directionC = page.getByTestId('direction-card-03');
  await expect(directionC).toBeVisible();
  await directionC.getByTestId('open-workbench-dir-03').click();
  await page.waitForURL(/\/workbench\?project=/);
  await expect(page.getByTestId('top-toolbar')).toBeVisible();

  const manifestPath = testInfo.outputPath(`direction-c-${testInfo.project.name}.tess.json`);
  await page.getByTestId('export-button').click();
  const downloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPending;
  await download.saveAs(manifestPath);
  return {
    manifestPath,
    manifest: ProjectManifestSchema.parse(JSON.parse(fs.readFileSync(manifestPath, 'utf8'))),
  };
}

test('UI Direction C manifest validates and exports identically through CLI and MCP', async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  const { manifest, manifestPath } = await exportManifestFromWorkbench(page, testInfo);
  expect(manifest.id).toBeTruthy();
  expect(manifest.screens.map((screen) => screen.name)).toEqual(
    expect.arrayContaining(['Team Overview', 'Onboarding', 'Settings & Policies']),
  );

  const cliValidation = runCli('validate', manifestPath);
  expect(cliValidation.error?.message ?? '').toBe('');
  expect(cliValidation.status, cliValidation.stderr || cliValidation.stdout).toBe(0);
  expect(cliValidation.stdout).toContain(`Valid ProjectManifest: ${manifest.name}`);

  const cliOutputDir = testInfo.outputPath(`cli-export-${testInfo.project.name}`);
  const cliExport = runCli('export', manifestPath, '--output', cliOutputDir);
  expect(cliExport.error?.message ?? '').toBe('');
  expect(cliExport.status, cliExport.stderr || cliExport.stdout).toBe(0);
  const cliFiles = listFiles(cliOutputDir);
  expect(cliFiles['project.tess.json']).toBeTruthy();
  expect(ProjectManifestSchema.parse(JSON.parse(cliFiles['project.tess.json']!))).toEqual(manifest);

  await page.getByTestId('export-button').click();
  const zipPending = page.waitForEvent('download');
  await page.getByTestId('export-zip-btn').click();
  const zipDownload = await zipPending;
  const zipPath = testInfo.outputPath(`workbench-export-${testInfo.project.name}.zip`);
  await zipDownload.saveAs(zipPath);
  const zipContents = unzipSync(fs.readFileSync(zipPath));
  const workbenchFiles = Object.fromEntries(
    Object.entries(zipContents)
      .filter(([file]) => !file.endsWith('/'))
      .map(([file, contents]) => [file, strFromU8(contents)]),
  );
  expect(workbenchFiles).toEqual(cliFiles);

  const { client, transport } = makeMcpClient();
  let mcpStderr = '';
  transport.stderr?.on('data', (chunk) => { mcpStderr += chunk.toString(); });
  try {
    await client.connect(transport);
    const invoke = async (name: string, args: Record<string, unknown>) => {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError, `${name} rejected the UI-exported manifest`).not.toBe(true);
      const text = result.content.find((part) => part.type === 'text')?.text;
      expect(text).toBeTruthy();
      return JSON.parse(text!) as Record<string, unknown>;
    };

    const mcpValidation = await invoke('validate_project', { manifest });
    expect(mcpValidation.valid).toBe(true);

    const mcpExport = await invoke('export_project_code', { manifest, target: 'vite' }) as {
      target: string;
      fileCount: number;
      files: Record<string, string>;
    };
    expect(mcpExport.target).toBe('vite');
    expect(mcpExport.fileCount).toBe(Object.keys(cliFiles).length);
    expect(mcpExport.files).toEqual(cliFiles);

    const mutation = await invoke('mutate_screen_ast', {
      manifest,
      action: 'adjust_dna',
      dnaDelta: { playfulness: 74 },
    }) as { success: boolean; manifest: unknown };
    expect(mutation.success).toBe(true);
    const agentEditedManifest = ProjectManifestSchema.parse(mutation.manifest);
    expect(agentEditedManifest.designDNA.playfulness).toBe(74);
    const agentEditedManifestPath = testInfo.outputPath(
      `mcp-edited-${testInfo.project.name}.tess.json`,
    );
    fs.writeFileSync(agentEditedManifestPath, JSON.stringify(agentEditedManifest, null, 2));

    const editedCliValidation = runCli('validate', agentEditedManifestPath);
    expect(editedCliValidation.status, editedCliValidation.stderr || editedCliValidation.stdout).toBe(0);
    expect(editedCliValidation.stdout).toContain('Valid ProjectManifest');
    const editedCliOutput = testInfo.outputPath(`mcp-edited-cli-${testInfo.project.name}`);
    const editedCliExport = runCli(
      'export',
      agentEditedManifestPath,
      '--output',
      editedCliOutput,
    );
    expect(editedCliExport.status, editedCliExport.stderr || editedCliExport.stdout).toBe(0);
    const editedCliFiles = listFiles(editedCliOutput);
    const editedMcpValidation = await invoke('validate_project', { manifest: agentEditedManifest });
    expect(editedMcpValidation.valid).toBe(true);
    const editedMcpExport = await invoke('export_project_code', {
      manifest: agentEditedManifest,
      target: 'vite',
    }) as { target: string; fileCount: number; files: Record<string, string> };
    expect(editedMcpExport.target).toBe('vite');
    expect(editedMcpExport.fileCount).toBe(Object.keys(editedCliFiles).length);
    expect(editedMcpExport.files).toEqual(editedCliFiles);

    let ingestionEvidence: Record<string, unknown> | undefined;
    if (testInfo.project.name === 'sites-chromium') {
      const ingestRoot = testInfo.outputPath('ingest-source');
      const sourcePath = path.join(ingestRoot, 'src', 'App.tsx');
      const source =
        'export default function App() { return <main><h1>People workspace</h1><button>Open directory</button></main>; }\n';
      fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
      fs.writeFileSync(sourcePath, source);

      const ingestion = runCli(
        'ingest',
        ingestRoot,
        '--output',
        'ingested.tess.json',
        '--name',
        'People Workspace',
      );
      expect(ingestion.status, ingestion.stderr || ingestion.stdout).toBe(0);
      const ingestedPath = path.join(ingestRoot, 'ingested.tess.json');
      const ingestedManifest = ProjectManifestSchema.parse(
        JSON.parse(fs.readFileSync(ingestedPath, 'utf8')),
      );
      expect(ingestedManifest.screens.length).toBeGreaterThan(0);
      expect(fs.readFileSync(sourcePath, 'utf8')).toBe(source);

      const ingestedCliValidation = runCli('validate', ingestedPath);
      expect(ingestedCliValidation.status, ingestedCliValidation.stderr || ingestedCliValidation.stdout).toBe(0);
      const ingestedCliOutput = testInfo.outputPath('ingested-cli-export');
      const ingestedCliExport = runCli('export', ingestedPath, '--output', ingestedCliOutput);
      expect(ingestedCliExport.status, ingestedCliExport.stderr || ingestedCliExport.stdout).toBe(0);
      const ingestedCliFiles = listFiles(ingestedCliOutput);
      const ingestedMcpValidation = await invoke('validate_project', { manifest: ingestedManifest });
      expect(ingestedMcpValidation.valid).toBe(true);
      const ingestedMcpExport = await invoke('export_project_code', {
        manifest: ingestedManifest,
        target: 'vite',
      }) as { target: string; fileCount: number; files: Record<string, string> };
      expect(ingestedMcpExport.target).toBe('vite');
      expect(ingestedMcpExport.files).toEqual(ingestedCliFiles);
      ingestionEvidence = {
        inputSourceBytes: Buffer.byteLength(source),
        sourcePreserved: true,
        inferredScreens: ingestedManifest.screens.map((screen) => screen.name),
        cliValidation: 'valid',
        mcpValidation: 'valid',
        cliMcpExportFilesMatchExactly: true,
        exportedFiles: ingestedMcpExport.fileCount,
        capabilityTier: 'Beta; source behavior and business logic are not inferred',
      };
    }

    expect(mcpStderr.trim()).toBe('');

    const evidence = {
      route: '/compose -> /workbench',
      viewport: testInfo.project.use.viewport,
      direction: 'C',
      manifestId: manifest.id,
      manifestName: manifest.name,
      screenNames: manifest.screens.map((screen) => screen.name),
      manifestBytes: fs.statSync(manifestPath).size,
      workbench: { zipFiles: Object.keys(workbenchFiles).length },
      cli: { validation: 'valid', exportedFiles: Object.keys(cliFiles).length },
      mcp: { validation: 'valid', exportedFiles: mcpExport.fileCount },
      generatedFilesMatchExactly: true,
      mcpMutation: {
        action: 'adjust_dna',
        designDNAPlayfulness: agentEditedManifest.designDNA.playfulness,
        cliValidation: 'valid',
        mcpValidation: 'valid',
        cliAndMcpFilesMatchExactly: true,
        exportedFiles: editedMcpExport.fileCount,
      },
      ingestion: ingestionEvidence,
      consoleErrors,
      pageErrors,
      failedRequests,
      httpErrors,
    };
    const evidencePath = testInfo.outputPath('ui-cli-mcp-manifest-parity.json');
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    await testInfo.attach('ui-cli-mcp-manifest-parity.json', {
      path: evidencePath,
      contentType: 'application/json',
    });
    await page.screenshot({ path: testInfo.outputPath('direction-c-workbench.png'), fullPage: true });
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(httpErrors).toEqual([]);
  } finally {
    await client.close();
  }
});

test('opens a CLI-composed manifest in Workbench and exports its edited project', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  const manifestPath = testInfo.outputPath('cli-composed.tess.json');
  const compose = runCli(
    'compose',
    'Build an employee directory and onboarding workspace for a technology company.',
    '--name',
    'CLI Employee Experience',
    '--output',
    manifestPath,
  );
  expect(compose.status, compose.stderr || compose.stdout).toBe(0);
  const sourceManifest = ProjectManifestSchema.parse(
    JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
  );

  await page.goto('/workbench');
  await expect(page.getByTestId('top-toolbar')).toBeVisible();
  const originalProjectName = (await page.getByTestId('top-toolbar').locator('button').first().innerText()).trim();
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('import-manifest-btn')).toBeVisible();
  const importMenuAxe = await new AxeBuilder({ page }).include('[data-testid="export-menu"]').analyze();
  expect(importMenuAxe.violations).toEqual([]);

  const malformedPath = testInfo.outputPath('malformed.tess.json');
  fs.writeFileSync(malformedPath, '{ malformed');
  const chooserPending = page.waitForEvent('filechooser');
  await page.getByTestId('import-manifest-btn').focus();
  await page.getByTestId('import-manifest-btn').press('Enter');
  await (await chooserPending).setFiles(malformedPath);
  await expect(page.getByRole('alert')).toContainText('Manifest import failed');
  await expect(page.getByTestId('top-toolbar').locator('button').first()).toContainText(originalProjectName);

  const validChooserPending = page.waitForEvent('filechooser');
  await page.getByTestId('import-manifest-btn').click();
  await (await validChooserPending).setFiles(manifestPath);

  await expect(
    page.getByTestId('top-toolbar').getByRole('button', {
      name: sourceManifest.name,
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByTestId('manifest-import-status')).toContainText('CLI Employee Experience');
  const screenshotPath = testInfo.outputPath('cli-workbench-import.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  if (testInfo.project.name.includes('mobile')) {
    await page
      .getByRole('navigation', { name: 'Mobile Workbench' })
      .getByRole('button', { name: 'Inspect', exact: true })
      .click();
  }
  await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
  const playfulness = page.getByRole('slider', { name: 'Playfulness' });
  await playfulness.focus();
  await playfulness.press('Home');
  for (let step = 0; step < 74; step += 1) await playfulness.press('ArrowRight');
  await expect(playfulness).toHaveValue('74');

  await page.getByTestId('export-button').click();
  const duplicateChooserPending = page.waitForEvent('filechooser');
  await page.getByTestId('import-manifest-btn').click();
  await (await duplicateChooserPending).setFiles(manifestPath);
  await expect(page.getByRole('alert')).toContainText('already uses ID');
  await expect(playfulness).toHaveValue('74');

  const downloadPending = page.waitForEvent('download');
  await page.getByTestId('export-manifest-btn').click();
  const download = await downloadPending;
  const editedPath = testInfo.outputPath('cli-workbench-edited.tess.json');
  await download.saveAs(editedPath);
  const editedManifest = ProjectManifestSchema.parse(
    JSON.parse(fs.readFileSync(editedPath, 'utf8')),
  );
  expect(editedManifest.id).toBe(sourceManifest.id);
  expect(editedManifest.designDNA.playfulness).toBe(74);

  const cliValidation = runCli('validate', editedPath);
  expect(cliValidation.status, cliValidation.stderr || cliValidation.stdout).toBe(0);
  const evidence = {
    route: 'CLI compose -> Workbench open -> DNA edit -> manifest export -> CLI validate',
    viewport: testInfo.project.use.viewport,
    projectIdPreserved: editedManifest.id === sourceManifest.id,
    importedName: editedManifest.name,
    playfulnessAfterVisibleEdit: editedManifest.designDNA.playfulness,
    cliValidation: 'valid',
    screenshot: screenshotPath,
    consoleErrors,
    pageErrors,
    failedRequests,
    httpErrors,
  };
  const evidencePath = testInfo.outputPath('cli-workbench-roundtrip.json');
  fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
  await testInfo.attach('cli-workbench-roundtrip.json', { path: evidencePath, contentType: 'application/json' });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(httpErrors).toEqual([]);
  expect(evidence.projectIdPreserved).toBe(true);
});

test('opens an MCP-composed manifest in Workbench and returns the edited project through CLI and MCP', async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const { client, transport } = makeMcpClient();
  let serverStderr = '';
  transport.stderr?.on('data', (chunk) => { serverStderr += chunk.toString(); });
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: Array<{ url: string; error: string | null }> = [];
  const httpErrors: Array<{ url: string; status: number }> = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? null }),
  );
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });

  try {
    await client.connect(transport);
    const composeResult = await client.callTool({
      name: 'compose_screen',
      arguments: {
        prompt: 'Build a professional employee experience platform with people, onboarding and conservative settings.',
        name: 'MCP Employee Workspace',
        feel: 'professional but playful',
        visualAmbition: 68,
        structuralCreativity: 65,
        targetDevices: ['desktop', 'tablet', 'mobile'],
        seed: 'step-41-mcp-workbench-roundtrip',
        direction: 'C',
      },
    });
    expect(composeResult.isError).not.toBe(true);
    const composedText = composeResult.content.find((part) => part.type === 'text')?.text;
    expect(composedText).toBeTruthy();
    const sourceManifest = ProjectManifestSchema.parse(JSON.parse(composedText!));
    const sourcePath = testInfo.outputPath('mcp-composed.tess.json');
    fs.writeFileSync(sourcePath, JSON.stringify(sourceManifest, null, 2));

    await page.goto('/workbench');
    await expect(page.getByTestId('top-toolbar')).toBeVisible();
    await page.getByTestId('export-button').click();
    const axe = await new AxeBuilder({ page }).include('[data-testid="export-menu"]').analyze();
    expect(axe.violations).toEqual([]);
    const chooserPending = page.waitForEvent('filechooser');
    await page.getByTestId('import-manifest-btn').click();
    await (await chooserPending).setFiles(sourcePath);
    await expect(
      page.getByTestId('top-toolbar').getByRole('button', {
        name: sourceManifest.name,
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByTestId('manifest-import-status')).toContainText(sourceManifest.name);

    const screenshotPath = testInfo.outputPath('mcp-workbench-import.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    if (testInfo.project.name.includes('mobile')) {
      await page
        .getByRole('navigation', { name: 'Mobile Workbench' })
        .getByRole('button', { name: 'Inspect', exact: true })
        .click();
    }
    await page.getByTestId('right-inspector').getByRole('button', { name: 'Intent', exact: true }).click();
    const playfulness = page.getByRole('slider', { name: 'Playfulness' });
    await playfulness.focus();
    await playfulness.press('Home');
    for (let step = 0; step < 71; step += 1) await playfulness.press('ArrowRight');
    await expect(playfulness).toHaveValue('71');

    await page.getByTestId('export-button').click();
    const downloadPending = page.waitForEvent('download');
    await page.getByTestId('export-manifest-btn').click();
    const download = await downloadPending;
    const editedPath = testInfo.outputPath('mcp-workbench-edited.tess.json');
    await download.saveAs(editedPath);
    const editedManifest = ProjectManifestSchema.parse(
      JSON.parse(fs.readFileSync(editedPath, 'utf8')),
    );
    expect(editedManifest.id).toBe(sourceManifest.id);
    expect(editedManifest.designDNA.playfulness).toBe(71);

    const cliValidation = runCli('validate', editedPath);
    expect(cliValidation.status, cliValidation.stderr || cliValidation.stdout).toBe(0);
    const validationResult = await client.callTool({
      name: 'validate_project',
      arguments: { manifest: editedManifest },
    });
    expect(validationResult.isError).not.toBe(true);
    const validationPayload = JSON.parse(
      validationResult.content.find((part) => part.type === 'text')?.text ?? 'null',
    ) as { valid: boolean };
    expect(validationPayload.valid).toBe(true);

    const evidence = {
      route: 'MCP compose -> Workbench import -> visible DNA edit -> CLI/MCP validation',
      viewport: testInfo.project.use.viewport,
      projectIdPreserved: editedManifest.id === sourceManifest.id,
      importedName: editedManifest.name,
      playfulnessAfterVisibleEdit: editedManifest.designDNA.playfulness,
      cliValidation: 'valid',
      mcpValidation: validationPayload.valid,
      screenshot: screenshotPath,
      consoleErrors,
      pageErrors,
      failedRequests,
      httpErrors,
    };
    const evidencePath = testInfo.outputPath('mcp-workbench-roundtrip.json');
    fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
    await testInfo.attach('mcp-workbench-roundtrip.json', {
      path: evidencePath,
      contentType: 'application/json',
    });
    expect(serverStderr.trim()).toBe('');
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
    expect(httpErrors).toEqual([]);
  } finally {
    await client.close();
  }
});
