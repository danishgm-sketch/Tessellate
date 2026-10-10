import type { ResourceManifest } from '@tessellate/schemas';

export interface DiversityEvaluationInput {
  candidate: ResourceManifest;
  chosenResources: ResourceManifest[];
}

export interface DiversityResult {
  score: number; // 0–100
  penalty: number; // 0–100
  notes: string[];
}

/**
 * Evaluates candidate resource against already chosen resources to penalize unhealthy repetition
 * of creator, visual family, layout patterns, and motion styles.
 */
export function calculateDiversityAdjustment(input: DiversityEvaluationInput): DiversityResult {
  const { candidate, chosenResources } = input;
  const notes: string[] = [];

  if (chosenResources.length === 0) {
    return { score: 100, penalty: 0, notes: ['First selected resource; no diversity penalties.'] };
  }

  let totalPenalty = 0;

  // 1. Creator Repetition
  const getCreatorName = (r: ResourceManifest): string => {
    return (
      r.creator?.displayName ??
      r.creator?.handle ??
      r.provenance?.originalAuthor ??
      'unknown'
    ).toLowerCase();
  };

  const candidateCreator = getCreatorName(candidate);
  const sameCreatorCount = chosenResources.filter(
    (r) => getCreatorName(r) === candidateCreator
  ).length;

  if (sameCreatorCount >= 3) {
    totalPenalty += 20;
    notes.push(`High creator repetition: '${candidateCreator}' already used ${sameCreatorCount} times (-20).`);
  } else if (sameCreatorCount === 2) {
    totalPenalty += 10;
    notes.push(`Moderate creator repetition: '${candidateCreator}' already used twice (-10).`);
  }

  // 2. Visual Family Repetition
  const candidateFamily = candidate.relationships.find((r) => r.type === 'SAME_FAMILY')?.target;
  if (candidateFamily) {
    const sameFamilyCount = chosenResources.filter((r) =>
      r.relationships.some((rel) => rel.type === 'SAME_FAMILY' && rel.target === candidateFamily)
    ).length;

    // A deliberate system of 2-3 matching parts is okay, but exceeding 4 creates visual monotony
    if (sameFamilyCount >= 4) {
      totalPenalty += 25;
      notes.push(`Visual family over-concentration: '${candidateFamily}' used ${sameFamilyCount} times (-25).`);
    } else if (sameFamilyCount >= 2) {
      totalPenalty += 8;
      notes.push(`Visual family repetition: '${candidateFamily}' count is ${sameFamilyCount} (-8).`);
    }
  }

  // 3. Layout Repetition
  type ResourceWithLayout = ResourceManifest & {
    layoutDNA?: { layoutFamilies?: string[] };
    layout?: { layoutFamilies?: string[] };
    visualDNA?: { motionPersonality?: string };
    dna?: { motionPersonality?: string };
  };

  const candFlex = candidate as ResourceWithLayout;
  const candidateLayouts = new Set(
    candFlex.layoutDNA?.layoutFamilies ??
    candFlex.layout?.layoutFamilies ??
    []
  );
  let layoutOverlapCount = 0;
  for (const chosen of chosenResources) {
    const chosenFlex = chosen as ResourceWithLayout;
    const chosenLayouts =
      chosenFlex.layoutDNA?.layoutFamilies ??
      chosenFlex.layout?.layoutFamilies ??
      [];
    for (const lf of chosenLayouts) {
      if (candidateLayouts.has(lf)) {
        layoutOverlapCount++;
      }
    }
  }

  if (layoutOverlapCount >= 3) {
    totalPenalty += 15;
    notes.push(`Layout family redundancy: overlapping layouts used ${layoutOverlapCount} times (-15).`);
  }

  // 4. Motion Repetition
  const candidateMotion =
    candFlex.visualDNA?.motionPersonality ??
    candFlex.dna?.motionPersonality;
  if (candidateMotion) {
    const sameMotionCount = chosenResources.filter((r) => {
      const chosenFlex = r as ResourceWithLayout;
      const motion =
        chosenFlex.visualDNA?.motionPersonality ??
        chosenFlex.dna?.motionPersonality;
      return motion === candidateMotion;
    }).length;
    if (sameMotionCount >= 4) {
      totalPenalty += 10;
      notes.push(`Motion personality saturation: '${candidateMotion}' used ${sameMotionCount} times (-10).`);
    }
  }

  const clampedPenalty = Math.min(100, totalPenalty);
  const finalScore = Math.max(0, 100 - clampedPenalty);

  return {
    score: finalScore,
    penalty: clampedPenalty,
    notes,
  };
}
