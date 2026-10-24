/* global process */
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(evidenceDir, '../../..');
const packageDir = path.join(repoRoot, 'packages/cli');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tess CLI installed package-'));
const installDir = path.join(tempRoot, 'consumer');
const results = [];

function run(command, args, options = {}) {
  const executable =
    command === 'npm' ? (process.platform === 'win32' ? process.execPath : 'npm') : command;
  const executableArgs =
    command === 'npm' && process.platform === 'win32'
      ? [path.resolve(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'), ...args]
      : args;
  const result = spawnSync(executable, executableArgs, {
    cwd: options.cwd || tempRoot,
    encoding: 'utf8',
    timeout: 60_000,
  });
  if (result.error) throw result.error;
  return result;
}

function runTess(...args) {
  const result = run(
    process.execPath,
    [path.join(installDir, 'node_modules/@tessellate/cli/dist/index.cjs'), ...args],
    {
      cwd: installDir,
    }
  );
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  results.push({
    command: `tess ${args.join(' ')}`,
    status: result.status,
    output: output.trim().slice(0, 480),
  });
  if (result.status === 0)
    assert.equal(
      result.stderr || '',
      '',
      `successful command wrote to stderr: tess ${args.join(' ')}`
    );
  return { ...result, output };
}

try {
  const build = run(process.execPath, [path.join(packageDir, 'scripts/build.mjs')], {
    cwd: repoRoot,
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);

  const pack = run('npm', ['pack', packageDir, '--pack-destination', tempRoot, '--ignore-scripts']);
  assert.equal(pack.status, 0, pack.stderr || pack.stdout);
  const tarball = fs.readdirSync(tempRoot).find((name) => name.endsWith('.tgz'));
  assert.ok(tarball, 'npm pack should produce an installable tarball');

  fs.mkdirSync(installDir, { recursive: true });
  const install = run('npm', [
    'install',
    '--prefix',
    installDir,
    '--no-save',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    path.join(tempRoot, tarball),
  ]);
  assert.equal(install.status, 0, install.stderr || install.stdout);

  const packageJsonPath = path.join(installDir, 'node_modules/@tessellate/cli/package.json');
  const installedPackage = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assert.deepEqual(
    Object.keys(installedPackage.dependencies || {}).sort(),
    ['typescript'],
    'runtime package may include the TypeScript parser but must not depend on workspace packages'
  );
  assert.equal(installedPackage.dependencies.typescript, '^5.7.3');
  assert.ok(
    fs.existsSync(path.join(installDir, 'node_modules/@tessellate/cli/dist/data/catalog.json'))
  );

  let result = runTess('--version');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /0\.1\.0/);

  result = runTess('--help');
  assert.equal(result.status, 0, result.output);
  assert.equal((result.output.match(/\[Beta\]/g) || []).length, 4);
  for (const command of ['ingest', 'lint', 'gate', 'create-resource'])
    assert.match(result.output, new RegExp(command));

  result = runTess('init');
  assert.equal(result.status, 0, result.output);
  assert.ok(fs.existsSync(path.join(installDir, 'tessellate.json')));

  result = runTess('doctor');
  assert.equal(result.status, 0, result.output);

  result = runTess('search', 'button');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /Button \(button\)/);

  result = runTess('view', 'button');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /Button \(@tess\/button\)/);

  const registryDir = path.join(installDir, 'apps/site/public/r');
  fs.mkdirSync(registryDir, { recursive: true });
  fs.writeFileSync(
    path.join(registryDir, 'cli-smoke-resource.json'),
    JSON.stringify({
      name: 'cli-smoke-resource',
      type: 'registry:component',
      title: 'CLI Smoke Resource',
      files: [
        { path: 'cli-smoke-resource.tsx', type: 'registry:component', content: 'export const CliSmokeResource = () => null;' },
      ],
      dependencies: [],
      devDependencies: [],
    })
  );
  result = runTess('add', 'cli-smoke-resource');
  assert.equal(result.status, 0, result.output);
  assert.ok(fs.existsSync(path.join(installDir, 'components/ui/cli-smoke-resource.tsx')));

  const projectPath = path.join(installDir, 'project.json');
  result = runTess(
    'compose',
    'Employee onboarding and people operations for a 500-person company',
    '--name',
    'People',
    '--output',
    projectPath
  );
  assert.equal(result.status, 0, result.output);
  assert.ok(fs.existsSync(projectPath));
  const composed = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
  assert.ok(composed.screens.length > 0, 'compose must instantiate planned screens');
  assert.match(
    JSON.stringify(composed),
    /resourceRef/,
    'compose must select real catalogue resources'
  );

  result = runTess('validate', projectPath);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /Valid ProjectManifest/);

  const exportDir = path.join(installDir, 'exported-project');
  result = runTess('export', projectPath, '--output', exportDir);
  assert.equal(result.status, 0, result.output);
  assert.ok(fs.existsSync(path.join(exportDir, 'package.json')));

  const sourceDir = path.join(installDir, 'src');
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(
    path.join(sourceDir, 'App.tsx'),
    'export function App() { return <main><h1>People</h1></main>; }'
  );
  result = runTess('lint', path.join(sourceDir, 'App.tsx'));
  assert.equal(result.status, 0, result.output);
  result = runTess('ingest', sourceDir, '--output', path.join(installDir, 'ingested.json'));
  assert.equal(result.status, 0, result.output);
  assert.ok(fs.existsSync(path.join(installDir, 'ingested.json')));

  result = runTess(
    'create-resource',
    '--slug',
    'cli-smoke-scaffold',
    '--name',
    'CLI Smoke Scaffold'
  );
  assert.equal(result.status, 0, result.output);
  assert.ok(
    fs.existsSync(path.join(installDir, 'resources/primitives/cli-smoke-scaffold/resource.json'))
  );

  const gateFixture = path.join(installDir, 'resources/primitives/button');
  fs.cpSync(path.join(repoRoot, 'resources/primitives/button'), gateFixture, { recursive: true });
  result = runTess('gate', gateFixture, '--format', 'json');
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /"overallStatus": "approved"/);

  const report = {
    package: '@tessellate/cli@0.1.0',
    packedAndInstalledOutsideMonorepo: true,
    installMode: 'npm local tarball; offline; no repository node_modules; no runtime dependencies',
    commands: results,
    commandCount: results.length,
    status: 'passed',
  };
  const reportPath =
    process.env.TESS_CLI_REPORT_PATH || path.join(evidenceDir, 'installed-package-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
