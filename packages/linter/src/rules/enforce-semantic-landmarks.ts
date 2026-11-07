import type { LintRule, LintIssue } from '../types.js';

export const enforceSemanticLandmarksRule: LintRule = {
  id: 'enforce-semantic-landmarks',
  description:
    'Uses page-like filenames to flag missing main landmarks; it does not inspect the rendered accessibility tree.',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];

    const normalizedPath = filePath.replaceAll('\\', '/').toLowerCase();
    const isInRouteDirectory = /\/(?:app|pages?|routes?|screens?)\//.test(normalizedPath);
    const isNamedPageFile = /(?:^|\/)(?:page|layout|screen)\.(?:tsx|jsx)$/.test(normalizedPath);
    const isReusableComponent = /\/components?\//.test(normalizedPath);
    const isPageOrLayout = isInRouteDirectory || (isNamedPageFile && !isReusableComponent);
    if (!isPageOrLayout) return issues;

    const hasMain = /<main[\s>]|role=["']main["']/i.test(code);
    if (!hasMain) {
      issues.push({
        ruleId: 'enforce-semantic-landmarks',
        severity: 'warning',
        message:
          'This page-like file has no <main> landmark or role="main". Review whether this component owns the page main landmark.',
        file: filePath,
        line: 1,
        column: 1,
      });
    }

    return issues;
  },
};
