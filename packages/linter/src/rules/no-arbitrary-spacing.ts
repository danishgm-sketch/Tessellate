import type { LintRule, LintIssue } from '../types.js';

export const noArbitrarySpacingRule: LintRule = {
  id: 'no-arbitrary-spacing',
  description:
    'Flags off-grid integer-pixel Tailwind spacing classes; only small changes to non-zero grid values receive an automatic fix.',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];
    const arbitrarySpacingRegex = /\b(?:p|m|gap|px|py|pl|pr|pt|pb|mx|my|ml|mr|mt|mb)-\[(\d+)px\]/g;

    let match: RegExpExecArray | null;
    while ((match = arbitrarySpacingRegex.exec(code)) !== null) {
      const fullMatch = match[0];
      const pxVal = parseInt(match[1]!, 10);

      // Multiples of 4 are acceptable (4, 8, 12, 16, 24, 32, 48, 64)
      if (pxVal % 4 === 0) continue;

      const linesUpToMatch = code.slice(0, match.index).split('\n');
      const line = linesUpToMatch.length;
      const column = linesUpToMatch[linesUpToMatch.length - 1]!.length + 1;

      // Never turn a positive spacing value into zero or make a larger guess.
      const nearestMultiple = Math.round(pxVal / 4) * 4;
      const prefix = fullMatch.split('-[')[0];
      const replacement = `${prefix}-[${nearestMultiple}px]`;
      const safeFix = nearestMultiple >= 4 && Math.abs(nearestMultiple - pxVal) <= 1;

      issues.push({
        ruleId: 'no-arbitrary-spacing',
        severity: 'warning',
        message: safeFix
          ? `Off-grid spacing "${fullMatch}" is one pixel from the nearest non-zero 4px grid value "${replacement}".`
          : `Off-grid spacing "${fullMatch}" needs a human layout decision; no automatic replacement is safe.`,
        file: filePath,
        line,
        column,
        snippet: fullMatch,
        ...(safeFix
          ? {
              fix: {
                replacement,
                startIndex: match.index,
                endIndex: match.index + fullMatch.length,
              },
            }
          : {}),
      });
    }

    return issues;
  },
};
