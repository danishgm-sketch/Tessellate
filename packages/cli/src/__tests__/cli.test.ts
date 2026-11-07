import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as http from 'node:http';
import { ProjectManifestSchema } from '@tessellate/schemas';
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

  it('refuses to let project config direct installed resources outside the project', async () => {
    const escapedDir = `${tempDir}-outside`;
    fs.writeFileSync(path.join(tempDir, 'tessellate.json'), JSON.stringify({
      version: '0.1.0',
      registry: 'https://tessellate.design/r',
      componentsDir: `../${path.basename(escapedDir)}`,
      tokensPath: 'styles/tokens.css',
      tailwindVersion: '4',
    }));
    const repoRoot = path.resolve(__dirname, '../../../..');
    const registryDir = path.resolve(repoRoot, 'apps/site/public/r');

    try {
      await expect(runAdd('button', { cwd: tempDir, registryDir })).rejects.toThrow(/componentsDir.*inside the project/);
      expect(fs.existsSync(escapedDir)).toBe(false);
    } finally {
      fs.rmSync(escapedDir, { recursive: true, force: true });
    }
  });

  it('refuses config output paths that escape through an existing directory symlink', async () => {
    const outsideDir = `${tempDir}-symlink-target`;
    fs.mkdirSync(outsideDir);
    fs.symlinkSync(outsideDir, path.join(tempDir, 'linked-components'), 'junction');
    fs.writeFileSync(path.join(tempDir, 'tessellate.json'), JSON.stringify({
      version: '0.1.0',
      registry: 'https://tessellate.design/r',
      componentsDir: 'linked-components',
      tokensPath: 'styles/tokens.css',
      tailwindVersion: '4',
    }));
    const repoRoot = path.resolve(__dirname, '../../../..');
    const registryDir = path.resolve(repoRoot, 'apps/site/public/r');

    try {
      await expect(runAdd('button', { cwd: tempDir, registryDir })).rejects.toThrow(/through a symlink/);
      expect(fs.readdirSync(outsideDir)).toEqual([]);
    } finally {
      fs.rmSync(outsideDir, { recursive: true, force: true });
    }
  });

  it('rejects registry filenames that resolve above the configured component directory', async () => {
    fs.writeFileSync(path.join(tempDir, 'tessellate.json'), JSON.stringify({
      version: '0.1.0', registry: 'https://tessellate.design/r', componentsDir: '.',
      tokensPath: 'styles/tokens.css', tailwindVersion: '4',
    }));
    const registryDir = path.join(tempDir, 'registry');
    fs.mkdirSync(registryDir);
    fs.writeFileSync(path.join(registryDir, 'unsafe.json'), JSON.stringify({
      name: 'unsafe', type: 'registry:ui', files: [{ path: '..', content: 'outside', type: 'registry:ui' }],
    }));
    await expect(runAdd('unsafe', { cwd: tempDir, registryDir, overwrite: true })).rejects.toThrow(/invalid output filename/);
  });

  it('rejects oversized remote registry responses before parsing or writing files', async () => {
    const server = http.createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end('x'.repeat(1024 * 1024 + 1));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test registry did not bind to a TCP port.');
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '1');
    fs.writeFileSync(path.join(tempDir, 'tessellate.json'), JSON.stringify({
      version: '0.1.0', registry: `http://127.0.0.1:${address.port}/r`, componentsDir: 'components/ui',
      tokensPath: 'styles/tokens.css', tailwindVersion: '4',
    }));
    try {
      const result = await runAdd('large-resource', { cwd: tempDir });
      expect(result.success).toBe(false);
      expect(fs.existsSync(path.join(tempDir, 'components'))).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it('rejects malformed remote registry records before creating the component directory', async () => {
    const server = http.createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ name: 'malformed', type: 'registry:ui', files: [] }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test registry did not bind to a TCP port.');
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '1');
    fs.writeFileSync(path.join(tempDir, 'tessellate.json'), JSON.stringify({
      version: '0.1.0', registry: `http://127.0.0.1:${address.port}/r`, componentsDir: 'components/ui',
      tokensPath: 'styles/tokens.css', tailwindVersion: '4',
    }));
    try {
      const result = await runAdd('malformed-resource', { cwd: tempDir });
      expect(result.success).toBe(false);
      expect(fs.existsSync(path.join(tempDir, 'components'))).toBe(false);
    } finally {
      vi.unstubAllEnvs();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });

  it('validates both init output paths before saving configuration', async () => {
    const outsideDir = `${tempDir}-init-symlink-target`;
    fs.mkdirSync(outsideDir);
    fs.symlinkSync(outsideDir, path.join(tempDir, 'linked-output'), 'junction');

    try {
      await expect(runInit({ cwd: tempDir, tokensPath: 'linked-output/tokens.css' })).rejects.toThrow(/through a symlink/);
      expect(fs.existsSync(path.join(tempDir, 'tessellate.json'))).toBe(false);
      expect(fs.readdirSync(outsideDir)).toEqual([]);
    } finally {
      fs.rmSync(outsideDir, { recursive: true, force: true });
    }
  });

  it('does not create new resources through a symlinked resources directory', async () => {
    const outsideDir = `${tempDir}-resource-root`;
    fs.mkdirSync(outsideDir);
    fs.symlinkSync(outsideDir, path.join(tempDir, 'resources'), 'junction');

    try {
      await expect(runCreateResource({ cwd: tempDir, slug: 'safe-resource' })).rejects.toThrow(/through a symlink/);
      expect(fs.readdirSync(outsideDir)).toEqual([]);
    } finally {
      fs.rmSync(outsideDir, { recursive: true, force: true });
    }
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
    const manifest = await runCompose(
      'Enterprise SaaS analytics dashboard with telemetry metrics',
      {
        name: 'Telemetry Hub',
        archetype: 'saas',
        output: outPath,
        cwd: path.resolve(__dirname, '../../../..'),
      }
    );

    expect(manifest.name).toBe('Telemetry Hub');
    expect(manifest.productModel).toBeDefined();
    expect(manifest.screenGraph).toBeDefined();
    expect(manifest.screens.length).toBeGreaterThan(0);
    expect(manifest.screens.some((screen) => JSON.stringify(screen).includes('resourceRef'))).toBe(
      true
    );
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('tess export: generates complete Vite + React + Tailwind source code tree', async () => {
    // 1. Compose project
    const manifestPath = path.join(tempDir, 'project.json');
    await runCompose('Minimal documentation portal', {
      name: 'Docs Portal',
      archetype: 'docs',
      output: manifestPath,
      cwd: path.resolve(__dirname, '../../../..'),
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

  it('tess create-resource: scaffolds a schema-valid resource manifest', async () => {
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

  it('tess create-resource: leaves a new scaffold unverified until a maintainer reviews it', async () => {
    const result = await runCreateResource({
      slug: 'unreviewed-card',
      name: 'Unreviewed Card',
      cwd: tempDir,
    });
    const manifest = JSON.parse(fs.readFileSync(result.manifestPath, 'utf8')) as {
      status: string;
      description: string;
      responsive: { verifiedWidths: number[] };
      accessibility: {
        levelTarget: string;
        keyboardVerified: boolean;
        screenReaderSemantics: boolean;
        reducedMotionVerified: boolean;
        focusVisible: boolean;
        knownLimitations?: string[];
      };
      quality: {
        [key: string]: number | { status: string; evidence: string[] };
        assessment: { status: string; evidence: string[] };
      };
    };
    const generatedSource = fs.readFileSync(result.indexPath, 'utf8');
    const generatedReadme = fs.readFileSync(result.readmePath, 'utf8');

    expect(result.success).toBe(true);
    expect(manifest.status).toBe('draft');
    expect(manifest.description).not.toMatch(/accessible|fully|verified/i);
    expect(manifest.responsive.verifiedWidths).toEqual([]);
    expect(manifest.accessibility).toMatchObject({
      levelTarget: 'none',
      keyboardVerified: false,
      screenReaderSemantics: false,
      reducedMotionVerified: false,
      focusVisible: false,
    });
    expect(manifest.accessibility.knownLimitations?.join(' ')).toMatch(/not been tested/i);
    expect(Object.entries(manifest.quality)
      .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
      .every(([, score]) => score === 0)).toBe(true);
    expect(manifest.quality.assessment).toEqual({ status: 'unassessed', evidence: [] });
    expect(generatedSource).not.toMatch(/hover:|focus-visible:/);
    expect(generatedReadme).toMatch(/not registered/i);
    expect(generatedReadme).toMatch(/test accessibility and responsive behavior/i);
    expect(generatedReadme).not.toMatch(/tess add|shadcn@latest add/i);
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
    expect(fixed).toContain('bg-[#123456]');
    expect(fixed).toContain('p-[16px]');
  });

  it('tess ingest: analyzes route structure without inventing product intent or changing source', async () => {
    const srcDir = path.join(tempDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'App.tsx'),
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
    expect(
      ProjectManifestSchema.safeParse(JSON.parse(fs.readFileSync(outJson, 'utf-8'))).success
    ).toBe(true);
    expect(result.projectManifest.name).toBe('Imported App');
    expect(result.inferredDna.detectedPalette).toBe('slate');
    expect(result.productIntentInferred).toBe(false);
    expect(result.projectManifest.productModel.productArchetypes).toEqual([
      { tag: 'unknown', weight: 1 },
    ]);
    expect(result.warnings.join(' ')).toMatch(/navigation behavior/);
    expect(fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8')).toContain('<main');
  });

  it('tess ingest: preserves the omitted Next.js layout limitation in the saved manifest', async () => {
    const appDir = path.join(tempDir, 'next-app', 'app');
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(
      path.join(appDir, 'page.tsx'),
      'export default function Page() { return <main><h1>People</h1></main>; }',
      'utf-8'
    );
    fs.writeFileSync(
      path.join(appDir, 'layout.tsx'),
      'export default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html>; }',
      'utf-8'
    );

    const output = path.join(tempDir, 'next-app.project.json');
    const result = await runIngest(path.dirname(appDir), { output });
    const persisted = JSON.parse(fs.readFileSync(output, 'utf-8')) as { description: string };

    expect(result.warnings.join(' ')).toMatch(/layout wrappers.*not merged/i);
    expect(persisted.description).toMatch(/Next\.js layout wrappers are not included/i);
  });

  it('tess ingest: refuses to overwrite an input source with the manifest output', async () => {
    const srcDir = path.join(tempDir, 'safe-ingest');
    fs.mkdirSync(srcDir, { recursive: true });
    const sourcePath = path.join(srcDir, 'App.tsx');
    const source = 'export function App() { return <main />; }';
    fs.writeFileSync(sourcePath, source, 'utf-8');

    await expect(runIngest(srcDir, { output: sourcePath })).rejects.toThrow(
      /Refusing to write.*source file/
    );
    expect(fs.readFileSync(sourcePath, 'utf-8')).toBe(source);
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
