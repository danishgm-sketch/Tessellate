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

import { isGoldResource } from '@tessellate/catalog/gold';

function computeIntentFitScore(
  candidate: ResourceManifest,
  currentArchetype?: string,
  semanticRole?: string
): { score: number; notes: string[] } {
  let score = 50;
  const notes: string[] = [];

  if (currentArchetype) {
    const archNorm = currentArchetype.toLowerCase().trim();
    const archTokens = archNorm.split(/[-_\s]+/).filter((t) => t.length > 2);

    // 1. Check candidate.productArchetypes with weights
    let archetypeMatchBonus = 0;
    if (candidate.productArchetypes && candidate.productArchetypes.length > 0) {
      for (const pa of candidate.productArchetypes) {
        const paTag = pa.tag.toLowerCase();
        if (paTag === archNorm) {
          archetypeMatchBonus = Math.max(archetypeMatchBonus, (pa.weight / 100) * 35);
          notes.push(`Direct archetype match on '${pa.tag}' (weight ${pa.weight}).`);
        } else if (archTokens.some((tok) => paTag.includes(tok) || tok.includes(paTag))) {
          archetypeMatchBonus = Math.max(archetypeMatchBonus, (pa.weight / 100) * 25);
          notes.push(`Partial archetype token match on '${pa.tag}'.`);
        }
      }
    }

    // 2. Check candidate.intent.idealFor phrases
    let idealForBonus = 0;
    if (candidate.intent && candidate.intent.idealFor) {
      for (const ideal of candidate.intent.idealFor) {
        const idealNorm = ideal.toLowerCase();
        if (idealNorm === archNorm) {
          idealForBonus = Math.max(idealForBonus, 30);
          notes.push(`Candidate explicitly idealFor archetype '${currentArchetype}'.`);
        } else {
          const idealTokens = idealNorm.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
          const overlap = archTokens.filter((tok) => idealTokens.includes(tok));
          if (overlap.length > 0) {
            idealForBonus = Math.max(idealForBonus, 15 + overlap.length * 5);
            notes.push(`Archetype overlap with idealFor context: "${ideal}".`);
          }
        }
      }
    }

    // 3. Check candidate.tags
    let tagBonus = 0;
    if (candidate.tags && candidate.tags.length > 0) {
      const tagMatches = candidate.tags.filter((t) => {
        const tNorm = t.toLowerCase();
        return tNorm === archNorm || archTokens.some((tok) => tNorm.includes(tok));
      });
      if (tagMatches.length > 0) {
        tagBonus = Math.min(15, tagMatches.length * 5);
        notes.push(`Tags match archetype context: [${tagMatches.join(', ')}].`);
      }
    }

    // 4. Check avoidFor penalty
    let avoidPenalty = 0;
    if (candidate.intent && candidate.intent.avoidFor) {
      for (const avoid of candidate.intent.avoidFor) {
        const avoidNorm = avoid.toLowerCase();
        if (avoidNorm === archNorm || archTokens.some((tok) => avoidNorm.includes(tok))) {
          avoidPenalty = 40;
          notes.push(`Archetype conflicts with avoidFor context: "${avoid}".`);
          break;
        }
      }
    }

    score += Math.max(archetypeMatchBonus, idealForBonus) + tagBonus - avoidPenalty;
  }

  // Check semantic role alignment
  if (semanticRole) {
    const roleNorm = semanticRole.toLowerCase();
    const roleTokens = roleNorm.split(/[-_\s]+/).filter((t) => t.length > 2);

    let roleBonus = 0;
    if (candidate.roles && candidate.roles.some((r) => r.toLowerCase() === roleNorm)) {
      roleBonus += 20;
      notes.push(`Candidate explicitly declares role '${semanticRole}'.`);
    } else if (candidate.roles && candidate.roles.some((r) => roleTokens.some((t) => r.toLowerCase().includes(t)))) {
      roleBonus += 12;
      notes.push(`Candidate declared roles partially match '${semanticRole}'.`);
    }

    if (candidate.intent && candidate.intent.jobs) {
      const jobMatches = candidate.intent.jobs.filter((j) => {
        const jNorm = j.toLowerCase();
        return jNorm.includes(roleNorm) || roleTokens.some((t) => jNorm.includes(t));
      });
      if (jobMatches.length > 0) {
        roleBonus += 15;
        notes.push(`Candidate declared jobs align with role '${semanticRole}'.`);
      }
    }

    score += Math.min(30, roleBonus);
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    notes,
  };
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
  const intentResult = computeIntentFitScore(candidate, currentArchetype, semanticRole);
  const intentFit = intentResult.score;
  rationale.push(...intentResult.notes);

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
  let performance = perfResult.score;
  if ((targetDna.performancePriority ?? 50) >= 75) {
    const isHeavy =
      candidate.performance.gpuCost === 'high' ||
      candidate.performance.jsCost === 'high' ||
      (candidate.tags ?? []).some((t) => ['webgl', '3d', 'particles', 'simulation'].includes(t.toLowerCase()));
    if (isHeavy) {
      performance = Math.max(0, performance - 35);
      rationale.push('Heavy resource penalized under high performance priority.');
    }
  }

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
  let totalScoreRaw =
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

  // Gold 40 Preference
  const isGold =
    isGoldResource(candidate.slug) ||
    candidate.status === 'verified-gold' ||
    (candidate.tags ?? []).includes('verified-gold');
  if (isGold) {
    totalScoreRaw += 5;
    rationale.push('Gold 40 verified resource preferred for core fidelity (+5).');
  }

  // Accessibility floor enforcement
  if (!a11yResult.meetsFloor) {
    totalScoreRaw *= 0.5;
    rationale.push(`Failed required accessibility floor (${accessibilityFloor}); overall score penalized.`);
  }

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
