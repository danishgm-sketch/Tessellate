import type { DesignDNA } from '@tessellate/schemas';

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintFix {
  replacement: string;
  startIndex: number;
  endIndex: number;
}

export interface LintIssue {
  ruleId: string;
  severity: LintSeverity;
  message: string;
  file: string;
  line: number;
  column: number;
  snippet?: string;
  fix?: LintFix;
}

export interface LintReport {
  fileCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: LintIssue[];
  passed: boolean;
}

export interface LinterOptions {
  fix?: boolean;
  designDna?: DesignDNA;
  format?: 'pretty' | 'json' | 'sarif';
}

export interface LintContext {
  filePath: string;
  code: string;
  designDna?: DesignDNA;
}

export interface LintRule {
  id: string;
  description: string;
  check: (context: LintContext) => LintIssue[];
}
