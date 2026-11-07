import * as fs from 'node:fs';
import * as path from 'node:path';
import { glob } from 'glob';
import type { LintIssue, LintReport, LinterOptions, LintRule } from './types.js';
import { noHardcodedColorsRule } from './rules/no-hardcoded-colors.js';
import { enforceAccessibleContrastRule } from './rules/enforce-accessible-contrast.js';
import { enforceSemanticLandmarksRule } from './rules/enforce-semantic-landmarks.js';
import { noArbitrarySpacingRule } from './rules/no-arbitrary-spacing.js';
import { enforceReducedMotionRule } from './rules/enforce-reduced-motion.js';
import { maskComments } from './mask-comments.js';

export const ALL_LINT_RULES: LintRule[] = [
  noHardcodedColorsRule,
  enforceAccessibleContrastRule,
  enforceSemanticLandmarksRule,
  noArbitrarySpacingRule,
  enforceReducedMotionRule,
];

/**
 * Lints a single code string, optionally applying automated fixes.
 */
export function lintSource(
  code: string,
  filePath: string,
  options: LinterOptions = {}
): { issues: LintIssue[]; fixedCode?: string } {
  const issues: LintIssue[] = [];
  const lintableCode = maskComments(code);

  for (const rule of ALL_LINT_RULES) {
    const ruleIssues = rule.check({ filePath, code: lintableCode, designDna: options.designDna });
    issues.push(...ruleIssues);
  }

  let fixedCode = code;
  if (options.fix) {
    // Sort fixes in descending order of startIndex to preserve indices during replacement
    const fixes = issues
      .filter((i) => i.fix !== undefined)
      .map((i) => i.fix!)
      .sort((a, b) => b.startIndex - a.startIndex);

    for (const fix of fixes) {
      fixedCode =
        fixedCode.slice(0, fix.startIndex) + fix.replacement + fixedCode.slice(fix.endIndex);
    }
  }

  return { issues, fixedCode: options.fix ? fixedCode : undefined };
}

/**
 * Lints an array of file patterns or directories.
 */
export async function lintDirectoryOrFiles(
  patterns: string[],
  options: LinterOptions = {}
): Promise<LintReport> {
  const filePaths = new Set<string>();

  for (const pattern of patterns) {
    if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
      filePaths.add(path.resolve(pattern));
    } else {
      const matches = await glob(pattern, {
        nodir: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.git/**'],
      });
      for (const m of matches) {
        filePaths.add(path.resolve(m));
      }
    }
  }

  const allIssues: LintIssue[] = [];
  let fileCount = 0;

  for (const filePath of filePaths) {
    if (!/\.(tsx|jsx|ts|js|css)$/.test(filePath)) continue;

    const code = fs.readFileSync(filePath, 'utf-8');
    fileCount++;

    const { issues, fixedCode } = lintSource(code, filePath, options);
    allIssues.push(...issues);

    if (options.fix && fixedCode && fixedCode !== code) {
      fs.writeFileSync(filePath, fixedCode, 'utf-8');
    }
  }

  const errorCount = allIssues.filter((i) => i.severity === 'error').length;
  const warningCount = allIssues.filter((i) => i.severity === 'warning').length;
  const infoCount = allIssues.filter((i) => i.severity === 'info').length;

  return {
    fileCount,
    errorCount,
    warningCount,
    infoCount,
    issues: allIssues,
    passed: errorCount === 0,
  };
}

/**
 * Formats report for terminal display.
 */
export function formatPrettyReport(report: LintReport): string {
  const lines: string[] = [];

  lines.push('\n🔍 Tessellate Design DNA Linter');
  lines.push('━'.repeat(50));

  if (report.issues.length === 0) {
    lines.push(
      `✨ No findings from the current heuristic rules across ${report.fileCount} file(s). Review remains necessary for computed styles, rendered contrast, keyboard behavior and assistive technology.`
    );
    return lines.join('\n');
  }

  for (const issue of report.issues) {
    const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
    lines.push(`${icon} ${issue.file}:${issue.line}:${issue.column} [${issue.ruleId}]`);
    lines.push(`   ${issue.message}`);
    if (issue.snippet) {
      lines.push(`   Snippet: "${issue.snippet}"`);
    }
    if (issue.fix) {
      lines.push(`   Suggested fix: "${issue.fix.replacement}"`);
    }
    lines.push('');
  }

  lines.push('━'.repeat(50));
  lines.push(
    `Summary: ${report.errorCount} error(s), ${report.warningCount} warning(s) across ${report.fileCount} file(s).`
  );

  return lines.join('\n');
}

/**
 * Formats report as SARIF JSON for GitHub Code Scanning annotations.
 */
export function formatSarifReport(report: LintReport): string {
  const sarif = {
    $schema:
      'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Tessellate Design DNA Linter',
            version: '0.1.0',
            rules: ALL_LINT_RULES.map((r) => ({
              id: r.id,
              shortDescription: { text: r.description },
            })),
          },
        },
        results: report.issues.map((i) => ({
          ruleId: i.ruleId,
          level: i.severity === 'error' ? 'error' : i.severity === 'warning' ? 'warning' : 'note',
          message: { text: i.message },
          locations: [
            {
              physicalLocation: {
                artifactLocation: { uri: i.file },
                region: {
                  startLine: i.line,
                  startColumn: i.column,
                },
              },
            },
          ],
        })),
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
