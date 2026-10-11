import {
  DESIGN_DNA_NUMERIC_KEYS,
  type DesignDNANumericKey,
  type DesignDNA,
  type PartialDesignDNA,
} from '@tessellate/schemas';

export interface DnaDistanceOptions {
  role?: string;
  customWeights?: Partial<Record<DesignDNANumericKey, number>>;
}

/**
 * Role-specific dimension relevance multipliers.
 * For example, motion matters heavily for an animated hero, while dataDensity matters for tables.
 */
export const ROLE_DIMENSION_WEIGHTS: Record<string, Partial<Record<DesignDNANumericKey, number>>> = {
  hero: {
    visualAmbition: 2.0,
    structuralCreativity: 1.8,
    typographicExpression: 1.8,
    imageryIntensity: 1.6,
    motion: 1.6,
    motionPlayfulness: 1.5,
    editorial: 1.4,
  },
  'data-table': {
    dataDensity: 2.5,
    density: 2.0,
    technicality: 1.8,
    contrast: 1.5,
    whitespace: 1.4,
    playfulness: 0.2,
    imageryIntensity: 0.1,
  },
  chart: {
    dataDensity: 2.2,
    technicality: 1.8,
    contrast: 1.6,
    motion: 1.2,
    imageryIntensity: 0.1,
  },
  navigation: {
    professionalism: 1.8,
    trust: 1.6,
    density: 1.5,
    visualAmbition: 1.2,
    motion: 0.8,
  },
  conversion: {
    conversionIntensity: 2.5,
    trust: 2.0,
    visualAmbition: 1.5,
    contrast: 1.5,
  },
  card: {
    curvature: 1.5,
    depth: 1.5,
    whitespace: 1.4,
    density: 1.4,
  },
};

/**
 * Calculates normalized DNA distance (0–100) between two DesignDNA instances.
 * 0 = identical DNA
 * 100 = completely opposite DNA
 */
export function calculateDnaDistance(
  targetDna: DesignDNA | PartialDesignDNA,
  candidateDna: DesignDNA | PartialDesignDNA,
  options?: DnaDistanceOptions
): number {
  const roleWeights = options?.role ? ROLE_DIMENSION_WEIGHTS[options.role] ?? {} : {};
  const customWeights = options?.customWeights ?? {};

  let weightedSquaredSum = 0;
  let totalWeight = 0;

  for (const key of DESIGN_DNA_NUMERIC_KEYS) {
    const valA = targetDna[key];
    const valB = candidateDna[key];

    const numA = typeof valA === 'number' ? valA : typeof valA === 'string' && !isNaN(Number(valA)) ? Number(valA) : undefined;
    const numB = typeof valB === 'number' ? valB : typeof valB === 'string' && !isNaN(Number(valB)) ? Number(valB) : undefined;

    // If neither specifies the dimension or has valid numeric value, distance is 0 for this dimension
    if (numA === undefined && numB === undefined) continue;

    const actualA = numA ?? 50;
    const actualB = numB ?? 50;

    const baseWeight = 1.0;
    const roleWeight = roleWeights[key] ?? 1.0;
    const customWeight = customWeights[key] ?? 1.0;
    const weight = baseWeight * roleWeight * customWeight;

    const diff = actualA - actualB;
    weightedSquaredSum += weight * (diff * diff);
    totalWeight += weight;
  }

  const numericDistance = totalWeight > 0 ? Math.sqrt(weightedSquaredSum / totalWeight) : 0;

  // Categorical adjustments
  let categoricalPenalty = 0;
  let categoricalComparisons = 0;

  if (targetDna.visualMode && candidateDna.visualMode) {
    categoricalComparisons++;
    if (targetDna.visualMode !== candidateDna.visualMode && targetDna.visualMode !== 'adaptive') {
      categoricalPenalty += 20;
    }
  }

  if (targetDna.geometryFamily && candidateDna.geometryFamily) {
    categoricalComparisons++;
    if (targetDna.geometryFamily !== candidateDna.geometryFamily) {
      categoricalPenalty += 12;
    }
  }

  if (targetDna.motionPersonality && candidateDna.motionPersonality) {
    categoricalComparisons++;
    if (targetDna.motionPersonality !== candidateDna.motionPersonality) {
      categoricalPenalty += 10;
    }
  }

  const combinedDistance =
    categoricalComparisons > 0
      ? numericDistance * 0.8 + (categoricalPenalty / categoricalComparisons) * 0.2
      : numericDistance;

  return Math.max(0, Math.min(100, Math.round(combinedDistance * 10) / 10));
}

/**
 * Converts DNA distance to a compatibility fit score (0–100).
 * 100 = perfect match, 0 = no match.
 */
export function calculateDnaFitScore(
  targetDna: DesignDNA | PartialDesignDNA,
  candidateDna: DesignDNA | PartialDesignDNA,
  options?: DnaDistanceOptions
): number {
  const distance = calculateDnaDistance(targetDna, candidateDna, options);
  return Math.max(0, Math.min(100, Math.round((100 - distance) * 10) / 10));
}
