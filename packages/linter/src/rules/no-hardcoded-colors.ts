import type { LintRule, LintIssue } from '../types.js';

export const noHardcodedColorsRule: LintRule = {
  id: 'no-hardcoded-colors',
  description:
    'Flags Tailwind arbitrary hex-color classes for review; it does not infer the correct semantic token.',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];
    const hexPattern = /(?:bg|text|border|fill|stroke)-\[#([0-9a-fA-F]{3,8})\]/g;

    let match: RegExpExecArray | null;
    while ((match = hexPattern.exec(code)) !== null) {
      const fullMatch = match[0];
      const index = match.index;

      // Calculate line and column
      const linesUpToMatch = code.slice(0, index).split('\n');
      const line = linesUpToMatch.length;
      const column = linesUpToMatch[linesUpToMatch.length - 1]!.length + 1;

      issues.push({
        ruleId: 'no-hardcoded-colors',
        severity: 'warning',
        message: `Tailwind arbitrary color class "${fullMatch}" needs a human-selected semantic token if this value should follow Design DNA.`,
        file: filePath,
        line,
        column,
        snippet: fullMatch,
      });
    }

    return issues;
  },
};
