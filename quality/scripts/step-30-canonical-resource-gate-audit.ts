import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runRegistryGate } from '../../packages/registry-gate/src/index.js';
import { isGoldResource } from '../../packages/catalog/src/gold.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const resourceRoot = path.join(repositoryRoot, 'resources');
const goldOnly = process.argv.includes('--gold-only');
const evidencePath = path.join(
  repositoryRoot,
  `quality/evidence/step-30/${goldOnly ? 'gold-resource-gate' : 'canonical-resource-gate'}.json`
);
const skippedDirectories = new Set(['.git', 'node_modules', 'dist', 'build']);

function findResourceDirectories(directory: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && skippedDirectories.has(entry.name.toLowerCase())) continue;
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    if (fs.existsSync(path.join(child, 'manifest.json'))) results.push(child);
    else results.push(...findResourceDirectories(child));
  }
  return results;
}

async function main(): Promise<void> {
  const allResourceDirectories = findResourceDirectories(resourceRoot).sort();
  const resourceDirectories = goldOnly
    ? allResourceDirectories.filter((directory) => isGoldResource(path.basename(directory)))
    : allResourceDirectories;
  const failures = [];
  const checkStatusCounts: Record<string, Record<string, number>> = {};

  for (const directory of resourceDirectories) {
    const report = await runRegistryGate(directory);
    for (const check of report.checks) {
      const statuses = (checkStatusCounts[check.id] ??= {});
      statuses[check.status] = (statuses[check.status] ?? 0) + 1;
    }
    if (report.overallStatus !== 'approved') {
      failures.push({
        resource: path.relative(resourceRoot, directory).replaceAll('\\', '/'),
        status: report.overallStatus,
        score: report.totalScore,
        checks: report.checks
          .filter((check) => check.status !== 'pass')
          .map(({ id, status, details }) => ({ id, status, details })),
      });
    }
  }

  const evidence = {
    capturedAt: new Date().toISOString(),
    gateName: `8-Check Static Registry Contribution Gate${goldOnly ? ' (Gold resources)' : ''}`,
    resourcesAudited: resourceDirectories.length,
    approved: resourceDirectories.length - failures.length,
    rejectedOrNeedsReview: failures.length,
    checkStatusCounts,
    failures,
  };
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(
    JSON.stringify(
      {
        gateName: evidence.gateName,
        resourcesAudited: evidence.resourcesAudited,
        approved: evidence.approved,
        rejectedOrNeedsReview: evidence.rejectedOrNeedsReview,
        checkStatusCounts: evidence.checkStatusCounts,
      },
      null,
      2
    )
  );

  if (process.argv.includes('--strict') && failures.length > 0) {
    throw new Error(
      `${failures.length} resource(s) failed or need review under the registry contribution gate.`
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
