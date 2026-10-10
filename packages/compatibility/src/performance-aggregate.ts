import type { ResourceManifest, PerformanceCost } from '@tessellate/schemas';

export interface PerformanceAggregate {
  overallScore: number; // 0–100
  totalJsWeight: number;
  totalGpuWeight: number;
  totalMediaWeight: number;
  continuousAnimationsCount: number;
  budgetPassed: boolean;
  notes: string[];
}

const COST_SCORES: Record<PerformanceCost, number> = {
  none: 0,
  tiny: 5,
  low: 15,
  medium: 35,
  high: 70,
};

const GPU_COST_SCORES: Record<string, number> = {
  none: 0,
  low: 15,
  medium: 40,
  high: 80,
};

const COMPLEXITY_SCORES: Record<string, number> = {
  low: 5,
  medium: 20,
  high: 45,
};

/**
 * Evaluates performance aggregate score and budget conformity for an individual resource or group.
 */
export function evaluateResourcePerformance(
  resource: ResourceManifest,
  performancePriority: number = 50 // 0–100
): { score: number; notes: string[] } {
  const notes: string[] = [];

  const jsPenalty = COST_SCORES[resource.performance.jsCost] ?? 15;
  const gpuPenalty = GPU_COST_SCORES[resource.performance.gpuCost] ?? 15;
  const mediaPenalty = GPU_COST_SCORES[resource.performance.mediaCost] ?? 15;
  const complexityPenalty = COMPLEXITY_SCORES[resource.performance.runtimeComplexity] ?? 15;

  let baseRawPenalty = jsPenalty * 0.4 + gpuPenalty * 0.25 + mediaPenalty * 0.2 + complexityPenalty * 0.15;

  // Strict amplification if performance priority is high (>= 80)
  if (performancePriority >= 80) {
    if (resource.performance.gpuCost === 'high' || resource.performance.gpuCost === 'medium') {
      baseRawPenalty *= 1.4;
      notes.push(`Amplified GPU penalty under high performance priority (${performancePriority}).`);
    }
    if (resource.performance.continuousAnimation) {
      baseRawPenalty += 15;
      notes.push('Continuous animation flagged under high performance priority.');
    }
  }

  // Quality performance rating from manifest provides positive foundation
  const manifestPerfQuality = resource.quality.performance;
  const calculatedScore = Math.max(0, Math.min(100, Math.round(manifestPerfQuality * 0.5 + (100 - baseRawPenalty) * 0.5)));

  return {
    score: calculatedScore,
    notes,
  };
}

/**
 * Aggregates performance budget across a whole composed screen or page.
 */
export function aggregateScreenPerformance(
  resources: ResourceManifest[],
  performancePriority: number = 50
): PerformanceAggregate {
  let totalJsWeight = 0;
  let totalGpuWeight = 0;
  let totalMediaWeight = 0;
  let continuousAnimationsCount = 0;
  let scoreSum = 0;
  const notes: string[] = [];

  for (const res of resources) {
    totalJsWeight += COST_SCORES[res.performance.jsCost] ?? 15;
    totalGpuWeight += GPU_COST_SCORES[res.performance.gpuCost] ?? 15;
    totalMediaWeight += GPU_COST_SCORES[res.performance.mediaCost] ?? 15;
    if (res.performance.continuousAnimation) {
      continuousAnimationsCount++;
    }
    const evalRes = evaluateResourcePerformance(res, performancePriority);
    scoreSum += evalRes.score;
  }

  const count = Math.max(1, resources.length);
  const avgScore = Math.round(scoreSum / count);

  // High priority budget check
  let budgetPassed = true;
  if (performancePriority >= 80) {
    if (continuousAnimationsCount > 2) {
      budgetPassed = false;
      notes.push(`Budget exceeded: ${continuousAnimationsCount} concurrent continuous animations.`);
    }
    if (totalGpuWeight > 120) {
      budgetPassed = false;
      notes.push(`Budget exceeded: aggregated GPU cost (${totalGpuWeight}) exceeds priority threshold.`);
    }
  }

  return {
    overallScore: avgScore,
    totalJsWeight,
    totalGpuWeight,
    totalMediaWeight,
    continuousAnimationsCount,
    budgetPassed,
    notes,
  };
}
