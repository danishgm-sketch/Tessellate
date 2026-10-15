import { lintDirectoryOrFiles, formatPrettyReport, formatSarifReport, type LintReport } from '@tessellate/linter';

export interface CliLintOptions {
  fix?: boolean;
  format?: 'pretty' | 'json' | 'sarif';
}

export async function runLint(
  targetPath = '.',
  options: CliLintOptions = {}
): Promise<LintReport> {
  const pattern = targetPath.endsWith('.tsx') || targetPath.endsWith('.jsx') || targetPath.endsWith('.ts')
    ? targetPath
    : `${targetPath.replace(/\/$/, '')}/**/*.{tsx,jsx,ts,css}`;

  const report = await lintDirectoryOrFiles([pattern], { fix: options.fix });

  if (options.format === 'sarif') {
    console.log(formatSarifReport(report));
  } else if (options.format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatPrettyReport(report));
  }

  return report;
}
