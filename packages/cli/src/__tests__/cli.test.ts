import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  runInit,
  runSearch,
  runView,
  runAdd,
  runValidate,
  runDoctor,
  runCompose,
  runExport,
  runCreateResource,
  runLint,
  runIngest,
  runGate,
  loadConfig,
} from '../index.js';

describe('Phase 17 — @tessellate/cli Test Suite', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-cli-test-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('tess init: initializes config and semantic tokens stylesheet', async () => {
    const result = await runInit({
      cwd: tempDir,
      componentsDir: 'src/components/ui',
      tokensPath: 'src/styles/tokens.css',
    });

    expect(fs.existsSync(result.configPath)).toBe(true);
    expect(fs.existsSync(result.tokensPath)).toBe(true);
    expect(fs.existsSync(result.componentsDir)).toBe(true);

    const config = loadConfig(tempDir);
    expect(config.componentsDir).toBe('src/components/ui');
    expect(config.tokensPath).toBe('src/styles/tokens.css');

    const tokensContent = fs.readFileSync(result.tokensPath, 'utf-8');
    expect(tokensContent).toContain('--tess-canvas');
    expect(tokensContent).toContain('--tess-ink');
    expect(tokensContent).toContain('--tess-cobalt');
  });

  it('tess search: searches catalogue items with query and category filters', async () => {
    const results = await runSearch('button', { cwd: path.resolve(__dirname, '../../../..') });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((r) => r.slug.includes('button'))).toBe(true);
  });

  it('tess view: displays details of an existing catalogue resource', async () => {
    const resource = await runView('button', { cwd: path.resolve(__dirname, '../../../..') });
    expect(resource).not.toBeNull();
    expect(resource?.slug).toBe('button');
    expect(resource?.name).toBe('Button');
  });

  it('tess add: installs component into configured components directory', async () => {
    // 1. Initialize project in tempDir
    await runInit({ cwd: tempDir, componentsDir: 'components/ui' });

    // 2. Add button component
    const repoRoot = path.resolve(__dirname, '../../../..');
    const registryDir = path.resolve(repoRoot, 'apps/site/public/r');
    const result = await runAdd('button', { cwd: tempDir, registryDir });

    expect(result.success).toBe(true);
    expect(result.item?.name).toBe('button');
    expect(fs.existsSync(path.join(tempDir, 'components/ui/index.tsx'))).toBe(true);
  });

  it('tess validate: validates ResourceManifest and catches invalid JSON', async () => {
    const repoRoot = path.resolve(__dirname, '../../../..');
    const manifestPath = path.join(repoRoot, 'resources', 'primitives', 'button', 'manifest.json');

    const result = await runValidate(manifestPath);
    expect(result.valid).toBe(true);
    expect(result.type).toBe('resource');

    // Test invalid manifest
    const invalidPath = path.join(tempDir, 'invalid.json');
    fs.writeFileSync(invalidPath, JSON.stringify({ resourceType: 'invalid-type' }), 'utf-8');
    const invalidResult = await runValidate(invalidPath);
    expect(invalidResult.valid).toBe(false);
  });

  it('tess doctor: diagnoses local development environment', async () => {
    const diagnostic = await runDoctor(tempDir);
    expect(diagnostic.nodeVersion).toBeDefined();
    expect(typeof diagnostic.hasConfig).toBe('boolean');
  });

  it('tess compose: deterministically composes ProjectManifest from brief', async () => {
    const outPath = path.join(tempDir, 'composed-project.json');
    const manifest = await runCompose('Enterprise SaaS analytics dashboard with telemetry metrics', {
      name: 'Telemetry Hub',
      archetype: 'saas',
      output: outPath,
      cwd: tempDir,
    });

    expect(manifest.name).toBe('Telemetry Hub');
    expect(manifest.productModel).toBeDefined();
    expect(manifest.screenGraph).toBeDefined();
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('tess export: generates complete Vite + React + Tailwind source code tree', async () => {
    // 1. Compose project
    const manifestPath = path.join(tempDir, 'project.json');
    await runCompose('Minimal documentation portal', {
      name: 'Docs Portal',
      archetype: 'docs',
      output: manifestPath,
      cwd: tempDir,
    });

    // 2. Export project
    const exportOut = path.join(tempDir, 'exported-app');
    const result = await runExport(manifestPath, {
      output: exportOut,
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(result.writtenCount).toBeGreaterThan(3);
    expect(fs.existsSync(path.join(exportOut, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(exportOut, 'vite.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(exportOut, 'src/App.tsx'))).toBe(true);
  });

  it('tess create-resource: contribution wizard scaffolds fully valid resource', async () => {
    const result = await runCreateResource({
      slug: 'metric-badge',
      name: 'Metric Badge',
      category: 'primitives',
      type: 'primitive',
      author: 'Antigravity Test Suite',
      description: 'Compact metric badge indicator with trend delta',
      cwd: tempDir,
    });

    expect(result.success).toBe(true);
    expect(fs.existsSync(result.manifestPath)).toBe(true);
    expect(fs.existsSync(result.indexPath)).toBe(true);
    expect(fs.existsSync(result.readmePath)).toBe(true);

    // Validate that the scaffolded manifest passes official schema validation
    const valResult = await runValidate(result.manifestPath);
    expect(valResult.valid).toBe(true);
    expect(valResult.type).toBe('resource');
  });

  it('tess lint: audits source files and outputs report', async () => {
    const testFile = path.join(tempDir, 'TestComp.tsx');
    fs.writeFileSync(
      testFile,
      'export function TestComp() { return <div className="bg-[#123456] p-[17px]">Hello</div>; }',
      'utf-8'
    );

    const report = await runLint(testFile, { fix: true });
    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.issues.some((i) => i.ruleId === 'no-hardcoded-colors')).toBe(true);

    const fixed = fs.readFileSync(testFile, 'utf-8');
    expect(fixed).toContain('var(--tess-surface-secondary');
  });

  it('tess ingest: converts source files into ProjectManifest AST', async () => {
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'Dashboard.tsx'),
      `export function Dashboard() {
        return (
          <main className="bg-slate-900 rounded-2xl p-6">
            <h1>Analytics Portal</h1>
          </main>
        );
      }`,
      'utf-8'
    );

    const outJson = path.join(tempDir, 'tessellate.project.json');
    const result = await runIngest(srcDir, {
      output: outJson,
      name: 'Imported App',
    });

    expect(result.sourceFileCount).toBe(1);
    expect(result.screens.length).toBe(1);
    expect(fs.existsSync(outJson)).toBe(true);
    expect(result.projectManifest.name).toBe('Imported App');
    expect(result.inferredDna.detectedPalette).toBe('slate');
  });

  it('tess gate: audits resource directory against Quality & Security Gate', async () => {
    const repoRoot = path.resolve(__dirname, '../../../..');
    const buttonDir = path.join(repoRoot, 'resources/primitives/button');

    const report = await runGate(buttonDir);
    expect(report.resourceSlug).toBe('button');
    expect(report.overallStatus).toBe('approved');
    expect(report.checks.length).toBe(8);
    expect(report.totalScore).toBeGreaterThanOrEqual(90);
  });
});

