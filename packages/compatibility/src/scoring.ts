import type {
  ResourceManifest,
  DesignDNA,
  PartialDesignDNA,
} from '@tessellate/schemas';
import type { CompositionGrammar } from './grammars.js';
import { calculateDnaFitScore } from './dna-distance.js';
import { calculateCompositionSynergy } from './synergy.js';
import { calculateDiversityAdjustment } from './diversity.js';
import { evaluateResourcePerformance } from './performance-aggregate.js';
import { evaluateAccessibility } from './accessibility-model.js';

export interface ScoreWeights {
  intentFit: 0.24;
  dnaFit: 0.18;
  structuralFit: 0.12;
  technicalFit: 0.10;
  accessibility: 0.08;
  performance: 0.08;
  responsiveFit: 0.06;
  synergy: 0.05;
  quality: 0.04;
  novelty: 0.03;
  diversity: 0.02;
}

export const CANONICAL_SCORE_WEIGHTS: ScoreWeights = {
  intentFit: 0.24,
  dnaFit: 0.18,
  structuralFit: 0.12,
  technicalFit: 0.10,
  accessibility: 0.08,
  performance: 0.08,
  responsiveFit: 0.06,
  synergy: 0.05,
  quality: 0.04,
  novelty: 0.03,
  diversity: 0.02,
};

export interface CompatibilityScoringInput {
  candidate: ResourceManifest;
  targetDna: DesignDNA | PartialDesignDNA;
  semanticRole: string;
  grammar?: CompositionGrammar;
  surroundingResources?: ResourceManifest[];
  currentArchetype?: string;
  accessibilityFloor?: 'A' | 'AA' | 'AAA';
  noveltyPreferenceScore?: number; // 0–100, default: 50
  targetWidth?: number;
}

export interface SubScoreBreakdown {
  intentFit: number;
  dnaFit: number;
  structuralFit: number;
  technicalFit: number;
  accessibility: number;
  performance: number;
  responsiveFit: number;
  synergy: number;
  quality: number;
  novelty: number;
  diversity: number;
}

export interface CompatibilityScoreResult {
  totalScore: number; // 0–100 rounded to 1 decimal place
  breakdown: SubScoreBreakdown;
  rationale: string[];
}

/**
 * Computes exact 11-part weighted compatibility score for a resource according to COMPOSITION_ENGINE.md Section 11.
 */
export function calculateCompatibilityScore(
  input: CompatibilityScoringInput
): CompatibilityScoreResult {
  const {
    candidate,
    targetDna,
    semanticRole,
    grammar,
    surroundingResources = [],
    currentArchetype,
    accessibilityFloor = 'AA',
    noveltyPreferenceScore = 50,
  } = input;

  const rationale: string[] = [];

  // 1. Intent Fit (24%)
  let intentFit = 50;
  if (currentArchetype) {
    const archLower = currentArchetype.toLowerCase();
    if (candidate.intent.idealFor.some((a) => a.toLowerCase() === archLower)) {
      intentFit += 30;
      rationale.push(`Candidate explicitly idealFor archetype '${currentArchetype}'.`);
    }
  }
  if (candidate.intent.jobs.some((j) => j.toLowerCase().includes(semanticRole.toLowerCase()))) {
    intentFit += 20;
    rationale.push(`Candidate declared jobs align with role '${semanticRole}'.`);
  }
  intentFit = Math.min(100, Math.max(0, intentFit));

  // 2. Design DNA Fit (18%)
  type FlexibleCandidate = ResourceManifest & {
    dna?: PartialDesignDNA;
    category?: string;
    styling?: string | { strategy?: string };
  };
  const candFlex = candidate as FlexibleCandidate;
  const candidateDna = candFlex.visualDNA ?? candFlex.dna ?? {};
  const dnaFit = calculateDnaFitScore(targetDna, candidateDna, { role: semanticRole });

  // 3. Structural Fit (12%)
  let structuralFit = 60;
  if (grammar) {
    const categories = candFlex.categories ?? (candFlex.category ? [candFlex.category] : []);
    if (categories.some((c: string) => grammar.candidateCategories.includes(c))) {
      structuralFit += 20;
    }
    if (grammar.requiredRoles.includes(semanticRole) || grammar.allowedRoles.includes(semanticRole)) {
      structuralFit += 20;
    }
  }
  structuralFit = Math.min(100, Math.max(0, structuralFit));

  // 4. Technical Fit (10%)
  let technicalFit = 80;
  if (candidate.framework === 'react') technicalFit += 10;
  const stylingVal = candFlex.styling;
  const stylingStr = typeof stylingVal === 'string'
    ? stylingVal
    : (stylingVal as { strategy?: string } | undefined)?.strategy ?? '';
  if (stylingStr.includes('tailwind')) technicalFit += 10;
  technicalFit = Math.min(100, Math.max(0, technicalFit));

  // 5. Accessibility (8%)
  const a11yResult = evaluateAccessibility({
    resource: candidate,
    requiredFloor: accessibilityFloor,
    accessibilityPriority: targetDna.accessibilityPriority ?? 50,
  });
  const accessibility = a11yResult.score;

  // 6. Performance (8%)
  const perfResult = evaluateResourcePerformance(
    candidate,
    targetDna.performancePriority ?? 50
  );
  const performance = perfResult.score;

  // 7. Responsive Fit (6%)
  let responsiveFit = 70;
  if (candidate.responsive.verifiedWidths.includes(360) && candidate.responsive.verifiedWidths.includes(1440)) {
    responsiveFit += 25;
  }
  if (candidate.responsive.breakpointStrategies && candidate.responsive.breakpointStrategies.length > 0) {
    responsiveFit += 5;
  }
  responsiveFit = Math.min(100, Math.max(0, responsiveFit));

  // 8. Composition Synergy (5%)
  const synergyResult = calculateCompositionSynergy({
    candidate,
    surroundingResources,
    currentArchetype,
  });
  const synergy = synergyResult.score;

  // 9. Quality Score (4%)
  const quality = candidate.quality.overall;

  // 10. Novelty Preference (3%)
  const novelty = Math.min(100, Math.max(0, noveltyPreferenceScore));

  // 11. Diversity Adjustment (2%)
  const diversityResult = calculateDiversityAdjustment({
    candidate,
    chosenResources: surroundingResources,
  });
  const diversity = diversityResult.score;

  // Aggregate weighted score
  const totalScoreRaw =
    CANONICAL_SCORE_WEIGHTS.intentFit * intentFit +
    CANONICAL_SCORE_WEIGHTS.dnaFit * dnaFit +
    CANONICAL_SCORE_WEIGHTS.structuralFit * structuralFit +
    CANONICAL_SCORE_WEIGHTS.technicalFit * technicalFit +
    CANONICAL_SCORE_WEIGHTS.accessibility * accessibility +
    CANONICAL_SCORE_WEIGHTS.performance * performance +
    CANONICAL_SCORE_WEIGHTS.responsiveFit * responsiveFit +
    CANONICAL_SCORE_WEIGHTS.synergy * synergy +
    CANONICAL_SCORE_WEIGHTS.quality * quality +
    CANONICAL_SCORE_WEIGHTS.novelty * novelty +
    CANONICAL_SCORE_WEIGHTS.diversity * diversity;

  const totalScore = Math.max(0, Math.min(100, Math.round(totalScoreRaw * 10) / 10));

  return {
    totalScore,
    breakdown: {
      intentFit,
      dnaFit,
      structuralFit,
      technicalFit,
      accessibility,
      performance,
      responsiveFit,
      synergy,
      quality,
      novelty,
      diversity,
    },
    rationale,
  };
}
