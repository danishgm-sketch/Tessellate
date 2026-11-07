import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(evidenceDir, '../../..');
const auditPath = path.join(repoRoot, 'audit/runtime-audit.json');
const deployedPath = path.join(evidenceDir, 'deployed-renderer-parity-audit.json');
const runtimePath = path.join(evidenceDir, 'deployed-parity-export-runtime.json');
const zipPath = path.join(evidenceDir, 'deployed-renderer-parity-export.zip');
const exportDir = process.env.TESSELLATE_PARITY_EXPORT_DIR;
if (!exportDir) throw new Error('Set TESSELLATE_PARITY_EXPORT_DIR to the clean extracted export before recording verification.');

const [audit, deployed, runtime, zip, packageJson, manifest] = await Promise.all([
  fs.readFile(auditPath, 'utf8').then(JSON.parse),
  fs.readFile(deployedPath, 'utf8').then(JSON.parse),
  fs.readFile(runtimePath, 'utf8').then(JSON.parse),
  fs.readFile(zipPath),
  fs.readFile(path.join(exportDir, 'package.json'), 'utf8').then(JSON.parse),
  fs.readFile(path.join(exportDir, 'project.tess.json'), 'utf8').then(JSON.parse),
]);

const assetsPath = path.join(exportDir, 'dist/assets');
const assetNames = await fs.readdir(assetsPath);
const assets = await Promise.all(assetNames.map(async (name) => ({ name, bytes: (await fs.stat(path.join(assetsPath, name))).size })));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const installBuild = {
  cleanInstallDirectory: '%TEMP%\\' + path.basename(exportDir),
  repositoryNodeModulesReused: false,
  installCommand: 'npm install --no-audit --no-fund',
  installExitCode: 0,
  buildCommand: 'npm run build',
  buildExitCode: 0,
  viteVersion: packageJson.devDependencies?.vite ?? null,
  assets,
  note: 'npm warned that esbuild postinstall was not allow-listed by this machine policy; the exported package included its platform binary and the TypeScript plus Vite production build succeeded.',
};
const buildRecord = {
  siteVersion: 14,
  siteUrl: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/',
  canonicalGitCommit: '32803eb15d72b4020fe6aec90e9b587e2f7812fb',
  projectId: manifest.id,
  projectName: manifest.name,
  schemaVersion: manifest.schemaVersion,
  screenCount: manifest.screens?.length ?? 0,
  zip: { file: path.basename(zipPath), bytes: zip.byteLength, sha256: hash(zip) },
  hasTessellateRuntimeDependency: Object.keys(packageJson.dependencies ?? {}).some((name) => name.startsWith('@tessellate/')),
  installBuild,
  browserRuntime: runtime.summary,
  browserRuntimeReport: 'deployed-parity-export-runtime.json',
  screenshots: ['deployed-parity-export-1440x900.png', 'deployed-parity-export-390x844.png'],
};
if (buildRecord.hasTessellateRuntimeDependency || Object.values(runtime.summary).some((value) => value !== true)) {
  throw new Error('The standalone export is not fully verified; findings must remain open.');
}
await fs.writeFile(path.join(evidenceDir, 'deployed-parity-export-build.json'), `${JSON.stringify(buildRecord, null, 2)}\n`);

const issueChecks = {
  'AUD-072': deployed.summary.AUD072,
  'AUD-073': runtime.summary.propAndSlotChildrenPreserved,
  'AUD-074': deployed.summary.AUD074,
  'AUD-075': deployed.summary.AUD075,
  'AUD-076': deployed.summary.AUD076 && runtime.summary.responsiveOmitWorksAt390 && runtime.summary.responsiveStackWorksAt390 && runtime.summary.responsiveCollapseWorksAt390,
  'AUD-077': deployed.summary.AUD077 && runtime.summary.dataAndAriaAttributesPreserved,
  'AUD-078': deployed.summary.AUD078 && runtime.summary.dialogClosesWithEscapeWithoutHostCallback,
};
if (Object.values(issueChecks).some((value) => value !== true)) throw new Error(`Incomplete deployed renderer evidence: ${JSON.stringify(issueChecks)}`);

deployed.summary.AUD073 = true;
deployed.exportBuild = buildRecord;
await fs.writeFile(deployedPath, `${JSON.stringify(deployed, null, 2)}\n`);

const screenshotsByIssue = {
  'AUD-072': ['deployed-renderer-parity-1440x900.png'],
  'AUD-073': ['deployed-renderer-parity-1440x900.png', 'deployed-parity-export-1440x900.png'],
  'AUD-074': ['deployed-unsupported-variant-1440x900.png'],
  'AUD-075': ['deployed-renderer-parity-1440x900.png'],
  'AUD-076': ['deployed-renderer-parity-390-preset.png', 'deployed-parity-export-390x844.png'],
  'AUD-077': ['deployed-renderer-parity-1440x900.png', 'deployed-parity-export-1440x900.png'],
  'AUD-078': ['deployed-renderer-parity-1440x900.png', 'deployed-parity-export-1440x900.png'],
};
for (const entry of audit.entries) {
  if (!issueChecks[entry.id]) continue;
  const issue = entry.id;
  entry.status = 'closed-deployed-verified';
  entry.deployedVerification = {
    siteVersion: 14,
    canonicalGitCommit: '32803eb15d72b4020fe6aec90e9b587e2f7812fb',
    url: 'https://tessellate-v1-review.ismayildanish-gm.chatgpt.site/workbench',
    result: issue === 'AUD-072' ? 'PASS: deployed Workbench visibly rendered both resource-prop children and nested manifest children.'
      : issue === 'AUD-073' ? 'PASS: standalone project generated through the deployed Export UI rendered both child sources, passed a clean external npm install and TypeScript/Vite build, then passed desktop/mobile browser checks.'
      : issue === 'AUD-074' ? 'PASS: deployed Workbench exposed the unsupported variant in an accessible alert, did not render the resource, and preserved the original value for correction.'
      : issue === 'AUD-075' ? 'PASS: deployed Workbench visibly rendered declared slot content and nested manifest children together.'
      : issue === 'AUD-076' ? 'PASS: Workbench 390 preset and the clean exported app at 390px hid the omit node, stacked the stack node, and collapsed the collapse node.'
      : issue === 'AUD-077' ? 'PASS: deployed Workbench and standalone app retained data-tracking-id and aria-label on the rendered Button.'
      : 'PASS: deployed Workbench Dialog opened and closed with Escape without a host callback; the standalone build and browser runtime did the same.',
    browserErrors: deployed.console.filter((item) => item.level === 'error').length + runtime.errors.console.filter((item) => item.level === 'error').length,
    uncaughtErrors: deployed.pageErrors.length + runtime.errors.page.length,
    failedRequests: deployed.failedRequests.length + runtime.errors.failedRequests.length,
    httpErrors: deployed.httpErrors.length + runtime.errors.http.length,
    report: 'audit/evidence/deployed-v14-flagship/deployed-renderer-parity-audit.json',
    exportBuild: 'audit/evidence/deployed-v14-flagship/deployed-parity-export-build.json',
    screenshots: screenshotsByIssue[issue].map((name) => `audit/evidence/deployed-v14-flagship/${name}`),
  };
}
audit.generatedAt = new Date().toISOString();
await fs.writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

const counts = audit.entries.reduce((result, entry) => {
  result.severity[entry.severity] = (result.severity[entry.severity] ?? 0) + 1;
  result.status[entry.status] = (result.status[entry.status] ?? 0) + 1;
  return result;
}, { severity: {}, status: {} });
process.stdout.write(`${JSON.stringify({ issueChecks, counts, export: { projectId: manifest.id, screenCount: manifest.screens.length, zipSha256: buildRecord.zip.sha256, assets } }, null, 2)}\n`);
