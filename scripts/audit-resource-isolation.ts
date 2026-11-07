import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRegistryGate } from '../packages/registry-gate/src/runner.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resourcesRoot = path.join(repositoryRoot, 'resources');
const expectedResourceCount = 324;
let skippedSymlinks = 0;

function findResourceDirectories(directory: string): string[] {
  const resources: string[] = [];
  const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      skippedSymlinks += 1;
      continue;
    }
    if (entry.isDirectory()) {
      resources.push(...findResourceDirectories(entryPath));
    } else if (entry.isFile() && entry.name === 'manifest.json') {
      resources.push(directory);
    }
  }

  return resources;
}

const resourceDirectories = findResourceDirectories(resourcesRoot);
const failures: Array<{ resource: string; status: string; details: string }> = [];
let passed = 0;

for (const resourceDirectory of resourceDirectories) {
  const report = await runRegistryGate(resourceDirectory);
  const isolationCheck = report.checks.find((check) => check.id === 'security-isolation');
  if (isolationCheck?.status === 'pass') {
    passed += 1;
  } else {
    failures.push({
      resource: report.resourceSlug,
      status: isolationCheck?.status ?? 'missing',
      details:
        isolationCheck?.details ?? 'Registry report did not include the security-isolation check.',
    });
  }
}

const result = {
  capturedAt: new Date().toISOString(),
  scope: 'Static registry source-isolation check; resource source is never executed.',
  resourcesRoot: path.relative(repositoryRoot, resourcesRoot),
  expectedResourceCount,
  scanned: resourceDirectories.length,
  passed,
  skippedSymlinks,
  failures,
};

console.log(JSON.stringify(result, null, 2));

const evidencePath = path.join(
  repositoryRoot,
  'quality/evidence/step-37/registry-source-isolation-latest.json'
);
mkdirSync(path.dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

if (resourceDirectories.length !== expectedResourceCount || failures.length > 0) {
  process.exitCode = 1;
}
