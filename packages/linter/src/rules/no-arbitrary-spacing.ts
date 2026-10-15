import type { LintRule, LintIssue } from '../types.js';

export const noArbitrarySpacingRule: LintRule = {
  id: 'no-arbitrary-spacing',
  description: 'Disallows non-standard arbitrary spacing classes (e.g. p-[17px], gap-[29px]) in favor of Design DNA grid units.',
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

      // Suggest nearest multiple of 4
      const nearestMultiple = Math.round(pxVal / 4) * 4;
      const prefix = fullMatch.split('-[')[0];
      const replacement = `${prefix}-[${nearestMultiple}px]`;

      issues.push({
        ruleId: 'no-arbitrary-spacing',
        severity: 'warning',
        message: `Irregular arbitrary spacing "${fullMatch}" breaks Design DNA 4px baseline grid. Suggest "${replacement}".`,
        file: filePath,
        line,
        column,
        snippet: fullMatch,
        fix: {
          replacement,
          startIndex: match.index,
          endIndex: match.index + fullMatch.length,
        },
      });
    }

    return issues;
  },
};
