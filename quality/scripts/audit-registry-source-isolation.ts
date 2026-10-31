import * as path from 'node:path';
import { discoverResources } from '../../packages/catalog/src/discovery.js';
import { runRegistryGate } from '../../packages/registry-gate/src/index.js';

const resourceDirectories = discoverResources(path.resolve('resources')).map(({ dir }) => dir);
const reports = [];

for (let index = 0; index < resourceDirectories.length; index += 4) {
  reports.push(
    ...(await Promise.all(
      resourceDirectories.slice(index, index + 4).map((directory) => runRegistryGate(directory))
    ))
  );
}

const checks = reports.map((report) => ({
  slug: report.resourceSlug,
  check: report.checks.find((item) => item.id === 'security-isolation'),
}));
const failures = checks
  .filter(({ check }) => check?.status === 'fail')
  .map(({ slug, check }) => ({ slug, details: check?.details ?? 'Missing isolation check.' }));

console.log(
  JSON.stringify(
    {
      capturedAt: new Date().toISOString(),
      resourcesScanned: reports.length,
      securityIsolation: {
        pass: checks.filter(({ check }) => check?.status === 'pass').length,
        warn: checks.filter(({ check }) => check?.status === 'warn').length,
        fail: failures.length,
      },
      failures,
    },
    null,
    2
  )
);

if (reports.length !== resourceDirectories.length || failures.length > 0) {
  process.exitCode = 1;
}
