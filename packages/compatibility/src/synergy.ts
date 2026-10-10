import type { ResourceManifest } from '@tessellate/schemas';
import type { ResourceRelationshipGraph } from './relationship-graph.js';

export interface SynergyEvaluationInput {
  candidate: ResourceManifest;
  surroundingResources: ResourceManifest[];
  graph?: ResourceRelationshipGraph;
  currentArchetype?: string;
}

export interface SynergyResult {
  score: number; // 0–100, where 50 is neutral
  reasons: string[];
}

/**
 * Calculates composition synergy between a candidate resource and surrounding resources.
 * Returns score 0–100 (50 is neutral baseline).
 */
export function calculateCompositionSynergy(input: SynergyEvaluationInput): SynergyResult {
  const { candidate, surroundingResources, currentArchetype } = input;
  const reasons: string[] = [];

  if (surroundingResources.length === 0) {
    return { score: 50, reasons: ['No surrounding resources; neutral synergy baseline.'] };
  }

  let delta = 0;
  const surroundingIds = new Set(surroundingResources.map((r) => r.id));
  const surroundingSlugs = new Set(surroundingResources.map((r) => r.slug));
  const surroundingFamilies = new Set(
    surroundingResources
      .map((r) => r.relationships.find((rel) => rel.type === 'SAME_FAMILY')?.target)
      .filter((t): t is string => Boolean(t))
  );

  // 1. Evaluate Candidate's Outgoing Relationships
  for (const rel of candidate.relationships) {
    const isTargetPresent = surroundingIds.has(rel.target) || surroundingSlugs.has(rel.target);

    switch (rel.type) {
      case 'WORKS_WITH':
        if (isTargetPresent) {
          delta += 15 * (rel.strength ?? 1.0);
          reasons.push(`Declares WORKS_WITH active resource '${rel.target}' (+15).`);
        }
        break;

      case 'SAME_FAMILY':
        if (isTargetPresent || surroundingFamilies.has(rel.target)) {
          delta += 12 * (rel.strength ?? 1.0);
          reasons.push(`Belongs to SAME_FAMILY '${rel.target}' (+12).`);
        }
        break;

      case 'REQUIRES':
        if (isTargetPresent) {
          delta += 20 * (rel.strength ?? 1.0);
          reasons.push(`Required dependency '${rel.target}' is present (+20).`);
        } else {
          delta -= 35;
          reasons.push(`Declared REQUIRES '${rel.target}' which is not in active resources (-35).`);
        }
        break;

      case 'CONTRASTS_WITH':
        if (isTargetPresent) {
          delta += 8 * (rel.strength ?? 1.0);
          reasons.push(`Intentional aesthetic contrast with '${rel.target}' (+8).`);
        }
        break;

      case 'AVOID_FOR':
        if (isTargetPresent) {
          delta -= 50;
          reasons.push(`Declared AVOID_FOR active resource '${rel.target}' (-50).`);
        } else if (currentArchetype && rel.target.toLowerCase() === currentArchetype.toLowerCase()) {
          delta -= 40;
          reasons.push(`Declared AVOID_FOR archetype '${currentArchetype}' (-40).`);
        }
        break;

      case 'GOOD_FOR':
        if (currentArchetype && rel.target.toLowerCase() === currentArchetype.toLowerCase()) {
          delta += 10;
          reasons.push(`Declared GOOD_FOR current archetype '${currentArchetype}' (+10).`);
        }
        break;

      default:
        break;
    }
  }

  // 2. Evaluate Surrounding Resources' Relationships toward Candidate
  for (const surrounding of surroundingResources) {
    for (const rel of surrounding.relationships) {
      const isCandidateTarget = rel.target === candidate.id || rel.target === candidate.slug;
      if (!isCandidateTarget) continue;

      if (rel.type === 'WORKS_WITH') {
        delta += 15 * (rel.strength ?? 1.0);
        reasons.push(`Active '${surrounding.name}' declares WORKS_WITH candidate (+15).`);
      } else if (rel.type === 'AVOID_FOR') {
        delta -= 50;
        reasons.push(`Active '${surrounding.name}' declares AVOID_FOR candidate (-50).`);
      }
    }
  }

  // Baseline 50 + delta clamped to [0, 100]
  const finalScore = Math.max(0, Math.min(100, Math.round(50 + delta)));
  return {
    score: finalScore,
    reasons,
  };
}
