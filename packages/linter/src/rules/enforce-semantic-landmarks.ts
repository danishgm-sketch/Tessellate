import type { LintRule, LintIssue } from '../types.js';

export const enforceSemanticLandmarksRule: LintRule = {
  id: 'enforce-semantic-landmarks',
  description: 'Ensures page or layout components declare semantic HTML landmarks (<main>, <header>, <nav>).',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];

    // Only apply to page, layout, or screen files
    const isPageOrLayout = /page\.(?:tsx|jsx)|layout\.(?:tsx|jsx)|Screen\.(?:tsx|jsx)/i.test(filePath);
    if (!isPageOrLayout) return issues;

    const hasMain = /<main[\s>]|role=["']main["']/i.test(code);
    if (!hasMain) {
      issues.push({
        ruleId: 'enforce-semantic-landmarks',
        severity: 'warning',
        message: 'Page component is missing a <main> landmark or role="main". Required for screen readers and WCAG AA/AAA.',
        file: filePath,
        line: 1,
        column: 1,
      });
    }

    return issues;
  },
};
