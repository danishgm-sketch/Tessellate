import type { LintRule, LintIssue } from '../types.js';

export const enforceAccessibleContrastRule: LintRule = {
  id: 'enforce-accessible-contrast',
  description: 'Flags low-contrast text and background combinations that violate WCAG AAA (7:1).',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];

    // Common low-contrast anti-patterns
    const antiPatterns = [
      {
        regex: /text-(?:zinc|slate|gray|neutral)-(?:300|400)\s+[^"'>]*bg-(?:white|slate-50|gray-50)/g,
        message: 'Low contrast detected: light gray text on white/light background violates WCAG AAA.',
      },
      {
        regex: /text-(?:zinc|slate|gray|neutral)-(?:500|600)\s+[^"'>]*bg-(?:black|slate-950|gray-900)/g,
        message: 'Low contrast detected: dark gray text on black/dark background violates WCAG AAA.',
      },
    ];

    for (const pattern of antiPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.regex.exec(code)) !== null) {
        const linesUpToMatch = code.slice(0, match.index).split('\n');
        const line = linesUpToMatch.length;
        const column = linesUpToMatch[linesUpToMatch.length - 1]!.length + 1;

        issues.push({
          ruleId: 'enforce-accessible-contrast',
          severity: 'error',
          message: pattern.message,
          file: filePath,
          line,
          column,
          snippet: match[0],
        });
      }
    }

    return issues;
  },
};
