import type { ResourceManifest } from '@tessellate/schemas';

export interface AccessibilityEvaluationInput {
  resource: ResourceManifest;
  requiredFloor?: 'A' | 'AA' | 'AAA';
  accessibilityPriority?: number; // 0–100
}

export interface AccessibilityResult {
  score: number; // 0–100
  meetsFloor: boolean;
  notes: string[];
}

const LEVEL_WEIGHTS: Record<string, number> = {
  none: 10,
  A: 60,
  AA: 85,
  AAA: 100,
};

/**
 * Evaluates accessibility score and floor satisfaction for a candidate resource.
 */
export function evaluateAccessibility(input: AccessibilityEvaluationInput): AccessibilityResult {
  const { resource, requiredFloor = 'AA', accessibilityPriority = 50 } = input;
  const spec = resource.accessibility;
  const notes: string[] = [];

  const resourceRank = LEVEL_WEIGHTS[spec.levelTarget] ?? 20;
  const requiredRank = LEVEL_WEIGHTS[requiredFloor] ?? 85;
  const meetsFloor = resourceRank >= requiredRank;

  let score = LEVEL_WEIGHTS[spec.levelTarget] ?? 50;

  if (spec.keyboardVerified) {
    score += 5;
  } else {
    score -= 15;
    notes.push('Keyboard navigation unverified (-15).');
  }

  if (spec.focusVisible) {
    score += 5;
  } else {
    score -= 10;
    notes.push('Visible focus state missing or unverified (-10).');
  }

  if (spec.reducedMotionVerified) {
    score += 5;
  } else if (accessibilityPriority >= 70) {
    score -= 10;
    notes.push('Reduced motion unverified under elevated accessibility priority (-10).');
  }

  if (spec.contrastTokenCompatible) {
    score += 5;
  } else {
    score -= 15;
    notes.push('Contrast token compatibility unverified (-15).');
  }

  if (spec.screenReaderSemantics) {
    score += 5;
  }

  // Weight with manifest quality accessibility score
  let blendedScore = Math.max(0, Math.min(100, Math.round(score * 0.6 + resource.quality.accessibility * 0.4)));

  if (!meetsFloor) {
    blendedScore = Math.min(blendedScore, 20);
    notes.push(`Fails required accessibility floor (${requiredFloor}). Score heavily penalized.`);
  }

  return {
    score: blendedScore,
    meetsFloor,
    notes,
  };
}
