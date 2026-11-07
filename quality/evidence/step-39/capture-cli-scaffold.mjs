/* global console, process */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = process.cwd();
const cliPath = path.join(repoRoot, 'packages/cli/dist/index.cjs');
const tempRoot = path.resolve(os.tmpdir());
const tempDirectory = await fsMkdtempWithin(tempRoot);
const manifestRelative = path.join('resources', 'primitives', 'draft-scaffold-evidence', 'resource.json');

function runCli(args) {
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: tempDirectory,
    encoding: 'utf8',
    timeout: 30_000,
  });
  return {
    args,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error?.message ?? null,
  };
}

async function fsMkdtempWithin(root) {
  const { mkdtemp } = await import('node:fs/promises');
  const directory = await mkdtemp(path.join(root, 'tess-cli-audit-'));
  if (!directory.startsWith(`${root}${path.sep}`)) throw new Error('Temporary directory escaped the OS temp root.');
  return directory;
}

try {
  const create = runCli(['create-resource', '--slug', 'draft-scaffold-evidence', '--name', 'Draft Scaffold Evidence']);
  const manifestPath = path.join(tempDirectory, manifestRelative);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const validate = runCli(['validate', manifestRelative]);
  const source = await readFile(path.join(path.dirname(manifestPath), 'index.tsx'), 'utf8');
  const readme = await readFile(path.join(path.dirname(manifestPath), 'README.md'), 'utf8');
  const evidence = {
    capturedAt: new Date().toISOString(),
    cliPath,
    workingDirectory: 'fresh OS temporary directory, outside the repository',
    create,
    validate,
    manifest: {
      status: manifest.status,
      description: manifest.description,
      creator: manifest.creator,
      provenance: manifest.provenance,
      license: manifest.license,
      verifiedWidths: manifest.responsive.verifiedWidths,
      accessibility: manifest.accessibility,
      quality: manifest.quality,
    },
    generatedSource: source,
    generatedReadme: readme,
    assertions: {
      created: create.status === 0,
      schemaValidation: validate.status === 0,
      unregisteredDraft: manifest.status === 'draft' && readme.includes('not registered in the Tessellate catalogue'),
      provenanceUnresolved: manifest.provenance.origin === 'unknown' && manifest.provenance.derivative === 'unknown' && manifest.provenance.aiAssistance === 'unknown',
      redistributionUnverified: manifest.license.spdx === 'NOASSERTION' && manifest.license.redistributionVerified === false,
      noResponsiveWidthsClaimed: manifest.responsive.verifiedWidths.length === 0,
      accessibilityNotCertified: manifest.accessibility.levelTarget === 'none' && !manifest.accessibility.keyboardVerified && !manifest.accessibility.screenReaderSemantics,
      noInstallClaim: !/tess add|shadcn@latest add/.test(readme),
    },
  };
  const outputDirectory = path.resolve(repoRoot, 'quality/evidence/step-39/after/cli');
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, 'draft-scaffold.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ output: path.join(outputDirectory, 'draft-scaffold.json'), assertions: evidence.assertions }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
