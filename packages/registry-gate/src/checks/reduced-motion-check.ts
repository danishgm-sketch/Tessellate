import type { GateCheckResult } from '../types.js';

export function checkReducedMotionGate(code: string): GateCheckResult {
  const hasAnimation = /\b(?:animate-(?:spin|pulse|ping|bounce|fade|slide)|duration-\d+|transition-(?:all|transform|opacity))\b/.test(code);
  const hasMotionReduce = /\bmotion-reduce:(?:animate-none|transition-none|transform-none)\b/.test(code);

  if (hasAnimation && !hasMotionReduce) {
    return {
      id: 'reduced-motion',
      name: 'Reduced Motion First-Class Compliance',
      category: 'reduced-motion',
      status: 'fail',
      score: 40,
      details: 'Component includes motion or animations without pairing with motion-reduce: modifiers.',
      remediation: 'Add "motion-reduce:animate-none" or "motion-reduce:transition-none" to respect prefers-reduced-motion.',
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
