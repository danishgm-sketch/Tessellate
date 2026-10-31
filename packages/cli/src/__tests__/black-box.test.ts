import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const cliSource = fileURLToPath(new URL('../bin.ts', import.meta.url));
const repoRoot = path.resolve(path.dirname(cliSource), '../../..');
const tsxCli = path.join(repoRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const tempDirs: string[] = [];

// Every case starts a fresh TypeScript CLI process; allow for cold starts on CI hosts.
vi.setConfig({ testTimeout: 15_000 });

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tess cli black box-'));
  tempDirs.push(dir);
  return dir;
}

function runCliWithEnv(cwd: string, env: NodeJS.ProcessEnv, ...args: string[]) {
  return spawnSync(process.execPath, [tsxCli, cliSource, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 30_000,
    env,
  });
}

function runCli(cwd: string, ...args: string[]) {
  return runCliWithEnv(cwd, process.env, ...args);
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('CLI black-box workflows', () => {
  it('composes and validates a ProjectManifest from a clean project directory', () => {
    const cwd = makeTempDir();
    const manifest = path.join(cwd, 'employee.json');
    const compose = runCli(
      repoRoot,
      'compose',
      'An employee onboarding and people platform for a technology company',
      '--name',
      'People Operations',
      '--output',
      manifest
    );

    expect(compose.status, compose.stderr || compose.stdout).toBe(0);
    expect(fs.existsSync(manifest)).toBe(true);

    const validate = runCli(repoRoot, 'validate', manifest);
    expect(validate.status, validate.stderr || validate.stdout).toBe(0);
    expect(validate.stderr + validate.stdout).toContain('Valid ProjectManifest');
    const composedManifest = JSON.parse(fs.readFileSync(manifest, 'utf8')) as {
      screens: Array<{ rootNode: { resourceRef?: { slug: string }; children: Array<unknown> } }>;
    };
    expect(composedManifest.screens.length).toBeGreaterThan(0);
    expect(JSON.stringify(composedManifest)).toContain('resourceRef');

    const repeatedPath = path.join(cwd, 'employee-repeat.json');
    const repeated = runCli(
      repoRoot,
      'compose',
      'An employee onboarding and people platform for a technology company',
      '--name',
      'People Operations',
      '--output',
      repeatedPath
    );
    expect(repeated.status, repeated.stderr || repeated.stdout).toBe(0);
    const repeatedManifest = JSON.parse(
      fs.readFileSync(repeatedPath, 'utf8')
    ) as typeof composedManifest;
    expect(repeatedManifest.screens).toEqual(composedManifest.screens);
  }, 60_000);

  it('returns a failing process status for malformed manifests', () => {
    const cwd = makeTempDir();
    const manifest = path.join(cwd, 'invalid.json');
    fs.writeFileSync(manifest, JSON.stringify({ schemaVersion: '1.0.0', screens: [] }));

    const result = runCli(cwd, 'validate', manifest);
    expect(result.status, result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/Validation failed|Unknown manifest|must be/i);
  });

  it('does not treat a missing export input as a successful command', () => {
    const result = runCli(makeTempDir(), 'export', 'missing-project.json');
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toContain('ProjectManifest file not found');
  });

  it('reports offline catalogue failure instead of disguising it as zero search results', () => {
    const cwd = makeTempDir();
    fs.writeFileSync(
      path.join(cwd, 'tessellate.json'),
      JSON.stringify({ registry: 'http://127.0.0.1:1/r' })
    );

    const result = runCli(cwd, 'search', 'button');
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/catalogue.*(unavailable|load)|offline/i);
  });

  it('explains when registry security policy blocks a resource lookup', () => {
    const cwd = makeTempDir();
    fs.writeFileSync(
      path.join(cwd, 'tessellate.json'),
      JSON.stringify({ registry: 'http://127.0.0.1:1/r' })
    );

    const result = runCli(cwd, 'add', 'missing-resource');
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/must use HTTPS|private or local registry targets are blocked/i);
  });

  it('reports the local-registry security block from the actual CLI process', () => {
    const cwd = makeTempDir();
    fs.writeFileSync(path.join(cwd, 'tessellate.json'), JSON.stringify({
      version: '0.1.0',
      registry: 'https://127.0.0.1:65535/r',
      componentsDir: 'components/ui',
      tokensPath: 'styles/tokens.css',
      tailwindVersion: '4',
    }));

    const result = runCliWithEnv(
      cwd,
      { ...process.env, TESS_ALLOW_PRIVATE_REGISTRY: '' },
      'add',
      'button'
    );
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/private or local registry targets are blocked/i);
    expect(fs.existsSync(path.join(cwd, 'components'))).toBe(false);
  });

  it('rejects path-like resource slugs before local lookup or registry access', () => {
    const cwd = makeTempDir();
    const result = runCli(cwd, 'add', '../../outside-file');
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/invalid resource slug/i);
  });

  it('fails closed when project config points add output outside the project', () => {
    const cwd = makeTempDir();
    const escapedDir = `${cwd}-outside`;
    fs.writeFileSync(path.join(cwd, 'tessellate.json'), JSON.stringify({
      componentsDir: `../${path.basename(escapedDir)}`,
    }));

    try {
      const result = runCli(cwd, 'add', 'button');
      expect(result.status, result.stderr + result.stdout).not.toBe(0);
      expect(result.stderr + result.stdout).toMatch(/componentsDir.*inside the project/i);
      expect(fs.existsSync(escapedDir)).toBe(false);
    } finally {
      fs.rmSync(escapedDir, { recursive: true, force: true });
    }
  });

  it('returns failure status when the registry gate rejects a resource', () => {
    const cwd = makeTempDir();
    const result = runCli(cwd, 'gate', cwd, '--format', 'json');
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/"overallStatus":\s*"(rejected|needs-review)"/);
  });

  it('rejects unresolved programmatic navigation through the real registry-gate CLI', () => {
    const cwd = makeTempDir();
    fs.copyFileSync(
      path.join(repoRoot, 'resources', 'primitives', 'button', 'manifest.json'),
      path.join(cwd, 'manifest.json')
    );
    fs.writeFileSync(
      path.join(cwd, 'index.tsx'),
      [
        'export function SafeButton() {',
        '  return <button className="w-full focus-visible:ring-2">Save</button>;',
        '}',
        'function navigate(destination: string) {',
        '  window.location.assign(destination);',
        '}',
      ].join('\n'),
      'utf8'
    );

    const result = runCli(cwd, 'gate', cwd, '--format', 'json');

    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    const report = JSON.parse(result.stdout) as {
      overallStatus: string;
      checks: Array<{ id: string; status: string; details: string }>;
    };
    const security = report.checks.find((check) => check.id === 'security-isolation');
    expect(report.overallStatus).toBe('rejected');
    expect(security?.status).toBe('fail');
    expect(security?.details).toMatch(/programmatic navigation|location/i);
  });

  it('rejects popup navigation through the real registry-gate CLI', () => {
    const cwd = makeTempDir();
    fs.copyFileSync(
      path.join(repoRoot, 'resources', 'primitives', 'button', 'manifest.json'),
      path.join(cwd, 'manifest.json')
    );
    fs.writeFileSync(
      path.join(cwd, 'index.tsx'),
      'export function UnsafePopup(destination: string) { window.open(destination, "_blank"); return <button>Open</button>; }',
      'utf8'
    );

    const result = runCli(cwd, 'gate', cwd, '--format', 'json');

    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    const report = JSON.parse(result.stdout) as {
      overallStatus: string;
      checks: Array<{ id: string; status: string; details: string }>;
    };
    const security = report.checks.find((check) => check.id === 'security-isolation');
    expect(report.overallStatus).toBe('rejected');
    expect(security?.status).toBe('fail');
    expect(security?.details).toMatch(/programmatic navigation/i);
  });

  it('rejects scripted anchor navigation through the real registry-gate CLI', () => {
    const cwd = makeTempDir();
    fs.copyFileSync(
      path.join(repoRoot, 'resources', 'primitives', 'button', 'manifest.json'),
      path.join(cwd, 'manifest.json')
    );
    fs.writeFileSync(
      path.join(cwd, 'index.tsx'),
      [
        'const anchor = document.createElement("a");',
        'anchor.href = destination;',
        'anchor.click();',
      ].join('\n'),
      'utf8'
    );

    const result = runCli(cwd, 'gate', cwd, '--format', 'json');

    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    const report = JSON.parse(result.stdout) as {
      overallStatus: string;
      checks: Array<{ id: string; status: string; details: string }>;
    };
    const security = report.checks.find((check) => check.id === 'security-isolation');
    expect(report.overallStatus).toBe('rejected');
    expect(security?.status).toBe('fail');
    expect(security?.details).toMatch(/programmatic navigation/i);
  });

  it('returns failure status for linter errors while allowing warning-only findings', () => {
    const cwd = makeTempDir();
    const source = path.join(cwd, 'LowContrast.tsx');
    fs.writeFileSync(source, '<p className="text-gray-400 bg-white">Unreadable</p>');

    const result = runCli(cwd, 'lint', source);
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toContain('enforce-accessible-contrast');
  });

  it('does not rewrite authored colors or round spacing down to zero with lint --fix', () => {
    const cwd = makeTempDir();
    const source = path.join(cwd, 'BrandSpacing.tsx');
    fs.writeFileSync(source, '<div className="bg-[#2547E8] p-[17px] mb-[1px]" />');

    const result = runCli(cwd, 'lint', source, '--fix');
    const fixed = fs.readFileSync(source, 'utf8');
    expect(result.status, result.stderr + result.stdout).toBe(0);
    expect(fixed).toContain('bg-[#2547E8]');
    expect(fixed).toContain('p-[16px]');
    expect(fixed).toContain('mb-[1px]');
    expect(result.stdout).not.toContain('All Design DNA & accessibility checks pass');
  });

  it('fails safely on malformed project configuration instead of silently using defaults', () => {
    const cwd = makeTempDir();
    fs.writeFileSync(path.join(cwd, 'tessellate.json'), '{ invalid json');

    const result = runCli(cwd, 'doctor');
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(
      /tessellate\.json.*(parse|invalid)|invalid.*configuration/i
    );
  });

  it('does not write a misleading empty project when ingest has no React source files', () => {
    const cwd = makeTempDir();
    const manifest = path.join(cwd, 'imported.json');

    const result = runCli(cwd, 'ingest', cwd, '--output', manifest);
    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/no .*\.tsx.*\.jsx|no React source/i);
    expect(fs.existsSync(manifest)).toBe(false);
  });

  it('keeps create-resource output inside resources when given a traversal category', () => {
    const cwd = makeTempDir();
    const result = runCli(cwd, 'create-resource', '--slug', 'safe-check', '--category', '..');

    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(
      /invalid resource category|inside the resources directory/i
    );
    expect(fs.existsSync(path.join(cwd, 'safe-check'))).toBe(false);
  });

  it('does not present an unpublished resource scaffold as installable', () => {
    const cwd = makeTempDir();
    const result = runCli(cwd, 'create-resource', '--slug', 'unreviewed-card', '--name', 'Unreviewed Card');

    expect(result.status, result.stderr || result.stdout).toBe(0);
    const resourceDir = path.join(cwd, 'resources/primitives/unreviewed-card');
    const manifest = JSON.parse(fs.readFileSync(path.join(resourceDir, 'resource.json'), 'utf8')) as {
      status: string;
    };
    const readme = fs.readFileSync(path.join(resourceDir, 'README.md'), 'utf8');

    expect(manifest.status).toBe('draft');
    expect(readme).toMatch(/not registered in the Tessellate catalogue/i);
    expect(readme).toMatch(/test accessibility and responsive behavior/i);
    expect(readme).not.toMatch(/tess add|shadcn@latest add/i);
  });

  it('rejects empty generated slugs before creating output directories', () => {
    const cwd = makeTempDir();
    const result = runCli(cwd, 'create-resource', '--slug', '!!!');

    expect(result.status, result.stderr + result.stdout).not.toBe(0);
    expect(result.stderr + result.stdout).toContain('Resource slug must contain');
    expect(fs.existsSync(path.join(cwd, 'resources'))).toBe(false);
  });

  it('emits valid TypeScript for unusual resource names and comment delimiters', () => {
    const cwd = makeTempDir();
    const result = runCli(
      cwd,
      'create-resource',
      '--slug',
      'quoted-resource',
      '--name',
      "123 O'Brien Resource",
      '--description',
      'Helpful UI */\n*/ export const injected = true; /**'
    );
    expect(result.status, result.stderr + result.stdout).toBe(0);

    const source = fs.readFileSync(
      path.join(cwd, 'resources/primitives/quoted-resource/index.tsx'),
      'utf8'
    );
    const output = ts.transpileModule(source, {
      reportDiagnostics: true,
      compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
    });
    expect(output.diagnostics ?? []).toEqual([]);
    expect(source).toContain('export function Resource123OBrienResource');
    expect(source).toContain('children || "123 O\'Brien Resource"');
  });
});
