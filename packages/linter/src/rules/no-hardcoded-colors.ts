import type { LintRule, LintIssue } from '../types.js';

export const noHardcodedColorsRule: LintRule = {
  id: 'no-hardcoded-colors',
  description: 'Disallow hardcoded hex and rgb color values in favor of Design DNA semantic tokens.',
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

      let replacement = fullMatch;
      if (fullMatch.startsWith('bg-[')) {
        replacement = 'bg-[var(--tess-surface-secondary,#F2EFE9)]';
      } else if (fullMatch.startsWith('text-[')) {
        replacement = 'text-[var(--tess-ink,#111217)]';
      } else if (fullMatch.startsWith('border-[')) {
        replacement = 'border-[var(--tess-hairline,#D9D6CF)]';
      }

      issues.push({
        ruleId: 'no-hardcoded-colors',
        severity: 'warning',
        message: `Hardcoded color "${fullMatch}" detected. Replace with Design DNA semantic variable.`,
        file: filePath,
        line,
        column,
        snippet: fullMatch,
        fix: {
          replacement,
          startIndex: index,
          endIndex: index + fullMatch.length,
        },
      });
    }

    return issues;
  },
};
