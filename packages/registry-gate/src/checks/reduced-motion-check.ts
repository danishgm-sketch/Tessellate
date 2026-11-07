import type { GateCheckResult } from '../types.js';

export function checkReducedMotionGate(code: string): GateCheckResult {
  const hasAnimation =
    /\b(?:animate-(?:spin|pulse|ping|bounce|fade|slide)|duration-\d+|transition-(?:all|transform|opacity))\b/.test(
      code
    ) ||
    /\banimation(?:Name|Duration)?\s*:\s*(?!none\b)[^;}\n]+/i.test(code) ||
    /@keyframes\s+[\w-]+/i.test(code);
  const hasMotionReduce = /\bmotion-reduce:(?:animate-none|transition-none|transform-none)\b/.test(
    code
  );
  const hasReducedMotionMediaQuery = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(
    code
  );

  if (hasAnimation && !hasMotionReduce && !hasReducedMotionMediaQuery) {
    return {
      id: 'reduced-motion',
      name: 'Reduced Motion First-Class Compliance',
      category: 'reduced-motion',
      status: 'fail',
      score: 40,
      details:
        'Component includes motion or animations without a Tailwind motion-reduce fallback or prefers-reduced-motion stylesheet rule.',
      remediation:
        'Add "motion-reduce:animate-none" or "motion-reduce:transition-none" to respect prefers-reduced-motion.',
    };
  }

  return {
    id: 'reduced-motion',
    name: 'Reduced Motion First-Class Compliance',
    category: 'reduced-motion',
    status: 'pass',
    score: 100,
    details: hasAnimation
      ? 'Animated component properly incorporates motion-reduce: fallbacks for vestibular safety.'
      : 'Component does not contain persistent motion; naturally respects reduced motion preferences.',
  };
}
