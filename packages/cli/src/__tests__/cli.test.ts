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
  runInterpret,
  runExport,
  runCreateResource,
  loadConfig,
} from '../index.js';
import { physioInterpretationFixture } from '@tessellate/schemas';

const repoRoot = path.resolve(__dirname, '../../../..');

function writeInterpretation(dir: string): string {
  const file = path.join(dir, 'interpretation.json');
  fs.writeFileSync(file, JSON.stringify(physioInterpretationFixture));
  return file;
}

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
    expect(fs.existsSync(path.join(tempDir, 'components/ui/button/index.tsx'))).toBe(true);

    // 3. A second resource installs alongside the first instead of overwriting it.
    const second = await runAdd('badge', { cwd: tempDir, registryDir });
    expect(second.success).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'components/ui/badge/index.tsx'))).toBe(true);
    expect(fs.readFileSync(path.join(tempDir, 'components/ui/button/index.tsx'), 'utf-8')).toContain('Button');

    // 4. Re-adding without --overwrite is reported as a failure and writes nothing.
    const again = await runAdd('button', { cwd: tempDir, registryDir });
    expect(again.success).toBe(false);
    expect(again.error).toBe('File conflict');
  });

  it('tess add: distinguishes an unreachable registry from a missing resource', async () => {
    const result = await runAdd('button', { cwd: tempDir, registry: 'http://127.0.0.1:9/r' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Registry unreachable');
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

  it('tess compose --from: composes a reviewed interpretation into a validated ProjectManifest', async () => {
    const outPath = path.join(tempDir, 'composed-project.json');
    const manifest = await runCompose(undefined, {
      name: 'Physio Booking',
      from: writeInterpretation(tempDir),
      output: outPath,
      cwd: repoRoot,
    });

    expect(manifest.name).toBe('Physio Booking');
    expect(manifest.productModel.productArchetypes[0]?.tag).toBe('healthcare-clinic');
    expect(manifest.screens.length).toBeGreaterThan(3);
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('tess compose --from: rejects an invalid interpretation file with its path', async () => {
    const bad = path.join(tempDir, 'bad.json');
    fs.writeFileSync(bad, JSON.stringify({ kind: 'interpretation' }));
    await expect(runCompose(undefined, { from: bad, cwd: repoRoot })).rejects.toThrow(/not a valid interpretation/);
  });

  it('tess interpret: fails loudly when the intelligence service is unreachable (no fallback)', async () => {
    const offline = (() => Promise.reject(new TypeError('fetch failed'))) as unknown as typeof fetch;
    await expect(runInterpret('A booking platform for physiotherapy clinics', { api: 'http://127.0.0.1:9', queue: { fetchImpl: offline } })).rejects.toThrow(
      /could not reach/,
    );
    await expect(runCompose('A booking platform for physiotherapy clinics', { api: 'http://127.0.0.1:9', queue: { fetchImpl: offline }, cwd: repoRoot })).rejects.toThrow(
      /could not reach/,
    );
  });

  it('tess export: generates complete Vite + React + Tailwind source code tree', async () => {
    // 1. Compose project
    const manifestPath = path.join(tempDir, 'project.json');
    await runCompose(undefined, {
      name: 'Physio Booking',
      from: writeInterpretation(tempDir),
      output: manifestPath,
      cwd: repoRoot,
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
});
