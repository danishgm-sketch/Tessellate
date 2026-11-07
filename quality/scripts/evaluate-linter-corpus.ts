import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { lintDirectoryOrFiles } from '../../packages/linter/src/index.js';

const root = process.cwd();
const patterns = [
  'apps/site/src/**/*.{tsx,jsx,ts,js,css}',
  'apps/preview/src/**/*.{tsx,jsx,ts,js,css}',
  'packages/workbench/src/**/*.{tsx,jsx,ts,js,css}',
  'resources/**/*.{tsx,jsx,ts,js,css}',
];
const report = await lintDirectoryOrFiles(
  patterns.map((pattern) => path.join(root, pattern).replaceAll('\\', '/'))
);
const byRule = Object.fromEntries(
  [...new Set(report.issues.map((issue) => issue.ruleId))].sort().map((ruleId) => {
    const issues = report.issues.filter((issue) => issue.ruleId === ruleId);
    const seenFiles = new Set<string>();
    const fileSample = issues
      .filter((issue) => {
        if (seenFiles.has(issue.file)) return false;
        seenFiles.add(issue.file);
        return true;
      })
      .slice(0, 20);
    return [
      ruleId,
      {
        count: issues.length,
        files: new Set(issues.map((issue) => issue.file)).size,
        examples: issues.slice(0, 100),
        oneFindingPerFileSample: fileSample,
      },
    ];
  })
);
const result = {
  generatedAt: new Date().toISOString(),
  corpus: {
    paths: patterns,
    purpose:
      'Read-only baseline over production React/TypeScript application and canonical resource source.',
  },
  totals: {
    files: report.fileCount,
    issues: report.issues.length,
    errors: report.errorCount,
    warnings: report.warningCount,
    information: report.infoCount,
    automaticFixesOffered: report.issues.filter((issue) => issue.fix !== undefined).length,
  },
  byRule,
};
const phase = process.argv.includes('--after') ? 'after' : 'before';
const outputPath = path.join(root, `quality/evidence/step-28/${phase}/linter-corpus-report.json`);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
process.stdout.write(
  `${JSON.stringify({ outputPath, totals: result.totals, rules: Object.keys(byRule) }, null, 2)}\n`
);
