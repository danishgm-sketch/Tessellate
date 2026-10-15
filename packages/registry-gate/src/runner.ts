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
      ? '🟢 **GATE PASSED — APPROVED FOR REGISTRY**'
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
### Tessellate Component Registry Quality Gate Audit

${badge}
**Resource:** \`${report.resourceSlug}\` (${report.resourceName})
**Quality Score:** **${report.totalScore}%** (${report.passedChecks}/${report.checks.length} passed, ${report.failedChecks} failed, ${report.warningChecks} warnings)

| Check | Status | Score | Details | Remediation |
| :--- | :---: | :---: | :--- | :--- |
${rows}

> **Summary:** ${report.summary}
`.trim();
}

export async function runRegistryGate(resourceDir: string): Promise<RegistryGateReport> {
  const dir = path.resolve(resourceDir);

  // 1. Locate manifest file
  const manifestCandidates = ['manifest.json', 'resource.json'];
  let manifestData: unknown = null;
  let foundManifestPath = '';

  for (const f of manifestCandidates) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      foundManifestPath = p;
      try {
        manifestData = JSON.parse(fs.readFileSync(p, 'utf-8'));
      } catch {
        manifestData = { parseError: true };
      }
      break;
    }
  }

  // 2. Read source code files (.tsx, .jsx, .ts)
  let allCode = '';
  let componentCode = '';
  let totalBytes = 0;
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.endsWith('.tsx') || f.endsWith('.jsx') || (f.endsWith('.ts') && !f.endsWith('.d.ts'))) {
        const fullPath = path.join(dir, f);
        const content = fs.readFileSync(fullPath, 'utf-8');
        allCode += `\n// File: ${f}\n` + content;
        totalBytes += fs.statSync(fullPath).size;

        const isSecondaryFixture =
          f.toLowerCase().includes('preview') ||
          f.toLowerCase().includes('fixture') ||
          f.toLowerCase().includes('test') ||
          f.toLowerCase().includes('story');

        if (!isSecondaryFixture || f.toLowerCase() === 'index.tsx') {
          componentCode += `\n// File: ${f}\n` + content;
        }
      }
    }
  }

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

  // Check 5: Reduced Motion (component code)
  checks.push(checkReducedMotionGate(componentCode));

  // Check 6: Security Isolation (all source code)
  checks.push(checkSecurityIsolationGate(allCode));

  // Check 7: Bundle Budget (all source code)
  checks.push(checkBundleBudgetGate(allCode, totalBytes));

  // Check 8: License & Provenance
  checks.push(checkLicenseProvenanceGate(manifest));

  // 4. Compute metrics
  const passedChecks = checks.filter((c) => c.status === 'pass').length;
  const failedChecks = checks.filter((c) => c.status === 'fail').length;
  const warningChecks = checks.filter((c) => c.status === 'warn').length;

  const totalScore = Math.round(
    checks.reduce((acc, c) => acc + c.score, 0) / checks.length
  );

  const overallStatus =
    failedChecks > 0 ? 'rejected' : totalScore >= 80 ? 'approved' : 'needs-review';

  const resourceSlug = manifest?.slug || path.basename(dir);
  const resourceName = manifest?.name || resourceSlug;

  const summary =
    overallStatus === 'approved'
      ? `Resource "${resourceName}" passed all 8 security, accessibility, and design hygiene quality gates.`
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
