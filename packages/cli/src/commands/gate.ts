import * as path from 'node:path';
import { runRegistryGate, type RegistryGateReport } from '@tessellate/registry-gate';

export interface CliGateOptions {
  format?: 'pretty' | 'json' | 'markdown';
}

export async function runGate(
  targetDir = '.',
  options: CliGateOptions = {}
): Promise<RegistryGateReport> {
  const dir = path.resolve(targetDir);
  const report = await runRegistryGate(dir);

  if (options.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
    return report;
  }

  if (options.format === 'markdown') {
    console.log(report.markdownReport);
    return report;
  }

  // Pretty terminal formatting
  console.log('\n🛡️  Tessellate Registry Quality Gate');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Resource:     ${report.resourceName} (${report.resourceSlug})`);
  console.log(`Directory:    ${dir}`);
  console.log(`Quality Score: ${report.totalScore}%`);

  const statusSymbol =
    report.overallStatus === 'approved'
      ? '🟢 APPROVED FOR REGISTRY'
      : report.overallStatus === 'rejected'
      ? '🔴 REJECTED'
      : '🟡 NEEDS REVIEW';

  console.log(`Verdict:      ${statusSymbol}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const c of report.checks) {
    const icon = c.status === 'pass' ? '✓' : c.status === 'warn' ? '⚠' : '✗';
    console.log(`  ${icon} [${c.category.padEnd(16)}] ${c.name} (${c.score}/100)`);
    if (c.status !== 'pass') {
      console.log(`    ↳ ${c.details}`);
      if (c.remediation) {
        console.log(`    ↳ Suggested: ${c.remediation}`);
      }
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${report.summary}\n`);

  return report;
}
