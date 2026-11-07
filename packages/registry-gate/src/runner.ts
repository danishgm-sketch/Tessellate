import * as fs from 'node:fs';
import * as path from 'node:path';
import type { GateCheckResult, RegistryGateReport } from './types.js';
import { checkSchemaValidity } from './checks/schema-check.js';
import { checkTokenHygiene } from './checks/token-hygiene-check.js';
import { checkAccessibilityGate } from './checks/a11y-gate-check.js';
import { checkResponsiveGate } from './checks/responsive-gate-check.js';
import { checkReducedMotionGate } from './checks/reduced-motion-check.js';
import { checkSecurityIsolationGate } from './checks/isolation-check.js';
import { checkBundleBudgetGate } from './checks/bundle-budget-check.js';
import { checkLicenseProvenanceGate } from './checks/license-provenance-check.js';

export function formatReportMarkdown(report: RegistryGateReport): string {
  const badge =
    report.overallStatus === 'approved'
      ? '🟢 **STATIC CHECKS PASSED — READY FOR HUMAN REVIEW**'
      : report.overallStatus === 'rejected'
        ? '🔴 **GATE FAILED — REJECTED**'
        : '🟡 **NEEDS REVIEW**';

  const rows = report.checks
    .map((c) => {
      const statusIcon = c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌';
      return `| ${statusIcon} ${c.name} | \`${c.status.toUpperCase()}\` | ${c.score}/100 | ${c.details} | ${c.remediation || '—'} |`;
    })
    .join('\n');

  return `
### Tessellate Registry ${report.checks.length}-Check Static Contribution Gate

${badge}
**Resource:** \`${report.resourceSlug}\` (${report.resourceName})
**Quality Score:** **${report.totalScore}%** (${report.passedChecks}/${report.checks.length} passed, ${report.failedChecks} failed, ${report.warningChecks} warnings)

| Check | Status | Score | Details | Remediation |
| :--- | :---: | :---: | :--- | :--- |
${rows}

> **Summary:** ${report.summary}
`.trim();
}

const skippedSourceDirectories = new Set([
  '.git',
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
]);
const sourceExtensions = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.css']);
const maxScannedFileBytes = 1024 * 1024;
const maxScannedSourceBytes = 2 * 1024 * 1024;
const maxScannedFiles = 512;

interface InspectedSourceFile {
  relativePath: string;
  code: string;
  sizeBytes: number;
}

function isSupportSource(relativePath: string): boolean {
  const segments = relativePath.toLowerCase().split('/');
  const supportDirectories = new Set([
    '__tests__',
    'test',
    'tests',
    'stories',
    'fixtures',
    'previews',
  ]);
  if (segments.slice(0, -1).some((segment) => supportDirectories.has(segment))) return true;
  return /(?:^|[.-])(?:test|spec|stories|story|preview|fixture)(?:[.-]|$)/i.test(
    path.basename(relativePath)
  );
}

function inspectSourceTree(resourceDir: string): {
  files: InspectedSourceFile[];
  violations: string[];
  sourceBytes: number;
} {
  const files: InspectedSourceFile[] = [];
  const violations: string[] = [];
  let scannedBytes = 0;
  const visit = (directory: string) => {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      violations.push(
        `Resource source directory could not be inspected: ${path.relative(resourceDir, directory) || '.'} (${error instanceof Error ? error.message : 'read failure'})`
      );
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory() && skippedSourceDirectories.has(entry.name.toLowerCase())) continue;
      const absolutePath = path.join(directory, entry.name);
      const relativePath = path.relative(resourceDir, absolutePath).replaceAll('\\', '/');
      if (entry.isSymbolicLink()) {
        violations.push(
          `Resource source tree contains an unaudited symbolic link: ${relativePath}`
        );
        continue;
      }
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (
        !entry.isFile() ||
        !sourceExtensions.has(path.extname(entry.name).toLowerCase()) ||
        entry.name.toLowerCase().endsWith('.d.ts')
      )
        continue;
      try {
        const sizeBytes = fs.lstatSync(absolutePath).size;
        scannedBytes += sizeBytes;
        if (
          files.length >= maxScannedFiles ||
          sizeBytes > maxScannedFileBytes ||
          scannedBytes > maxScannedSourceBytes
        ) {
          violations.push(
            `Resource source exceeds safe inspection limits at ${relativePath} (file cap ${maxScannedFileBytes} bytes; tree cap ${maxScannedSourceBytes} bytes; file cap ${maxScannedFiles}).`
          );
          continue;
        }
        const code = fs.readFileSync(absolutePath, 'utf-8');
        files.push({ relativePath, code, sizeBytes });
      } catch (error) {
        violations.push(
          `Resource source could not be inspected: ${relativePath} (${error instanceof Error ? error.message : 'read failure'})`
        );
      }
    }
  };
  try {
    const root = fs.lstatSync(resourceDir);
    if (root.isSymbolicLink()) {
      violations.push('Resource root is a symbolic link and cannot be safely inspected.');
    } else if (!root.isDirectory()) {
      violations.push('Resource root is not a directory.');
    } else {
      visit(resourceDir);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      violations.push(
        `Resource root could not be inspected (${error instanceof Error ? error.message : 'read failure'}).`
      );
    }
  }
  return { files, violations, sourceBytes: scannedBytes };
}

export async function runRegistryGate(resourceDir: string): Promise<RegistryGateReport> {
  const dir = path.resolve(resourceDir);

  // 1. Locate manifest file
  const manifestCandidates = ['manifest.json', 'resource.json'];
  let manifestData: unknown = null;

  for (const f of manifestCandidates) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      try {
        if (fs.lstatSync(p).isSymbolicLink()) {
          manifestData = null;
          break;
        }
        manifestData = JSON.parse(fs.readFileSync(p, 'utf-8'));
      } catch {
        manifestData = { parseError: true };
      }
      break;
    }
  }

  // 2. Read source code files (.tsx, .jsx, .ts)
  const inspected = inspectSourceTree(dir);
  const allCode = inspected.files
    .map(({ relativePath, code }) => `\n// File: ${relativePath}\n${code}`)
    .join('\n');
  let componentCode = inspected.files
    .filter(({ relativePath }) =>
      ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'].includes(
        path.extname(relativePath).toLowerCase()
      )
    )
    .filter(({ relativePath }) => !isSupportSource(relativePath))
    .map(({ relativePath, code }) => `\n// File: ${relativePath}\n${code}`)
    .join('\n');
  const totalBytes = inspected.sourceBytes;

  // If no standalone component file was isolated, evaluate against all code
  if (!componentCode.trim()) {
    componentCode = allCode;
  }

  // 3. Execute all gate checks
  const checks: GateCheckResult[] = [];

  // Check 1: Schema
  const schemaRes = checkSchemaValidity(manifestData);
  checks.push(schemaRes.result);
  const manifest = schemaRes.manifest;

  // Check 2: Token Hygiene (component code)
  checks.push(checkTokenHygiene(componentCode));

  // Check 3: Accessibility (component code)
  checks.push(checkAccessibilityGate(componentCode));

  // Check 4: Responsive (component code)
  checks.push(checkResponsiveGate(componentCode));

  // Check 5: Reduced Motion (component and stylesheet source)
  checks.push(checkReducedMotionGate(allCode));

  // Check 6: Security Isolation (all source code)
  checks.push(
    checkSecurityIsolationGate(
      allCode,
      inspected.violations,
      inspected.files
        .filter(({ relativePath }) =>
          ['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs'].includes(
            path.extname(relativePath).toLowerCase()
          )
        )
        .map(({ relativePath, code }) => ({ fileName: relativePath, code }))
    )
  );

  // Check 7: Bundle Budget (all source code)
  checks.push(checkBundleBudgetGate(allCode, totalBytes, manifest?.dependencies));

  // Check 8: License & Provenance
  checks.push(checkLicenseProvenanceGate(manifest));

  // 4. Compute metrics
  const passedChecks = checks.filter((c) => c.status === 'pass').length;
  const failedChecks = checks.filter((c) => c.status === 'fail').length;
  const warningChecks = checks.filter((c) => c.status === 'warn').length;

  const totalScore = Math.round(checks.reduce((acc, c) => acc + c.score, 0) / checks.length);

  const overallStatus =
    failedChecks > 0 ? 'rejected' : totalScore >= 80 ? 'approved' : 'needs-review';

  const resourceSlug = manifest?.slug || path.basename(dir);
  const resourceName = manifest?.name || resourceSlug;

  const summary =
    overallStatus === 'approved'
      ? `Resource "${resourceName}" passed all ${checks.length} static source checks; human review and runtime certification are still required.`
      : overallStatus === 'rejected'
        ? `Resource "${resourceName}" failed ${failedChecks} mandatory gate(s). Must resolve critical failures prior to merging.`
        : `Resource "${resourceName}" passed with warnings. Manual review recommended.`;

  const report: RegistryGateReport = {
    resourceSlug,
    resourceName,
    overallStatus,
    totalScore,
    passedChecks,
    failedChecks,
    warningChecks,
    checks,
    summary,
    markdownReport: '',
  };

  report.markdownReport = formatReportMarkdown(report);
  return report;
}
