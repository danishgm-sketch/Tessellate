import type { LintRule, LintIssue } from '../types.js';
import { getStaticClassValues } from './static-class-values.js';

export const enforceReducedMotionRule: LintRule = {
  id: 'enforce-reduced-motion',
  description:
    'Flags animated Tailwind classes in literal class attributes without a same-element motion-reduce fallback; computed classes and CSS are not inspected.',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];
    const animationClassPattern =
      /\b(motion-safe:)?(animate-spin|animate-ping|animate-pulse|animate-bounce)\b/g;

    for (const classValue of getStaticClassValues(code)) {
      const fallback = /\bmotion-reduce:animate-none\b/.test(classValue.value);
      if (fallback) continue;

      let match: RegExpExecArray | null;
      while ((match = animationClassPattern.exec(classValue.value)) !== null) {
        if (match[1] === 'motion-safe:') continue;
        const fullMatch = match[2]!;
        const index = classValue.startIndex + match.index + (match[1]?.length ?? 0);
        const linesUpToMatch = code.slice(0, index).split('\n');
        const line = linesUpToMatch.length;
        const column = linesUpToMatch[linesUpToMatch.length - 1]!.length + 1;
        issues.push({
          ruleId: 'enforce-reduced-motion',
          severity: 'warning',
          message: `Animation "${fullMatch}" lacks a same-element "motion-reduce:animate-none" fallback.`,
          file: filePath,
          line,
          column,
          snippet: fullMatch,
        });
      }
    }

    return issues;
  },
};
