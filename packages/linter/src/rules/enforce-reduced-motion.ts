import type { LintRule, LintIssue } from '../types.js';

export const enforceReducedMotionRule: LintRule = {
  id: 'enforce-reduced-motion',
  description: 'Ensures animations and transitions declare motion-reduce fallbacks for vestibulocochlear accessibility.',
  check({ filePath, code }) {
    const issues: LintIssue[] = [];

    // Check if element has animated classes but lacks motion-reduce modifiers
    const animationClassPattern = /\b(?:animate-spin|animate-ping|animate-pulse|animate-bounce)\b/g;

    let match: RegExpExecArray | null;
    while ((match = animationClassPattern.exec(code)) !== null) {
      const fullMatch = match[0];
      const hasMotionReduce = /motion-reduce:animate-none|motion-reduce:transition-none/.test(code);

      if (!hasMotionReduce) {
        const linesUpToMatch = code.slice(0, match.index).split('\n');
        const line = linesUpToMatch.length;
        const column = linesUpToMatch[linesUpToMatch.length - 1]!.length + 1;

        issues.push({
          ruleId: 'enforce-reduced-motion',
          severity: 'warning',
          message: `Animation "${fullMatch}" lacks "motion-reduce:animate-none" modifier to support prefers-reduced-motion.`,
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
