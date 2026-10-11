import {
  type DesignDNA,
  DesignDNASchema,
} from '@tessellate/schemas';
import { clampScore } from './dimensions.js';

export type VisualAmbitionStop =
  | 'essential'
  | 'refined'
  | 'striking'
  | 'stunning'
  | 'experimental';

export interface VisualAmbitionStopDefinition {
  stop: VisualAmbitionStop;
  index: number;
  label: string;
  rangeMin: number;
  rangeMax: number;
  defaultScore: number;
  description: string;
  targetDimensions: {
    visualAmbition: number;
    typographicExpression: number;
    motion: number;
    imageryIntensity: number;
    videoIntensity: number;
    threeDIntensity: number;
    depth: number;
  };
}

export const VISUAL_AMBITION_STOPS: Record<VisualAmbitionStop, VisualAmbitionStopDefinition> = {
  essential: {
    stop: 'essential',
    index: 0,
    label: 'Essential',
    rangeMin: 0,
    rangeMax: 20,
    defaultScore: 10,
    description:
      'Familiar composition, restrained typography, low animation, and nearly zero decorative effect budget. Clarity and speed prioritised.',
    targetDimensions: {
      visualAmbition: 10,
      typographicExpression: 15,
      motion: 10,
      imageryIntensity: 10,
      videoIntensity: 0,
      threeDIntensity: 0,
      depth: 10,
    },
  },
  refined: {
    stop: 'refined',
    index: 1,
    label: 'Refined',
    rangeMin: 21,
    rangeMax: 40,
    defaultScore: 30,
    description:
      'Sophisticated spacing/typography, subtle motion, stronger visual hierarchy, and restrained distinctive details.',
    targetDimensions: {
      visualAmbition: 30,
      typographicExpression: 35,
      motion: 25,
      imageryIntensity: 25,
      videoIntensity: 5,
      threeDIntensity: 0,
      depth: 25,
    },
  },
  striking: {
    stop: 'striking',
    index: 2,
    label: 'Striking',
    rangeMin: 41,
    rangeMax: 65,
    defaultScore: 55,
    description:
      'Expressive layout, stronger type treatment, richer motion, and controlled special effects.',
    targetDimensions: {
      visualAmbition: 55,
      typographicExpression: 55,
      motion: 50,
      imageryIntensity: 50,
      videoIntensity: 30,
      threeDIntensity: 15,
      depth: 50,
    },
  },
  stunning: {
    stop: 'stunning',
    index: 3,
    label: 'Stunning',
    rangeMin: 66,
    rangeMax: 85,
    defaultScore: 75,
    description:
      'Substantial art direction, advanced transitions, selective 3D/video/shaders, and richer narrative composition.',
    targetDimensions: {
      visualAmbition: 75,
      typographicExpression: 75,
      motion: 70,
      imageryIntensity: 75,
      videoIntensity: 60,
      threeDIntensity: 45,
      depth: 75,
    },
  },
  experimental: {
    stop: 'experimental',
    index: 4,
    label: 'Experimental',
    rangeMin: 86,
    rangeMax: 100,
    defaultScore: 95,
    description:
      'High novelty, nonstandard spatial ideas, and aggressive but purposeful motion/effects, still bound by accessibility and performance floors.',
    targetDimensions: {
      visualAmbition: 95,
      typographicExpression: 90,
      motion: 90,
      imageryIntensity: 85,
      videoIntensity: 80,
      threeDIntensity: 80,
      depth: 90,
    },
  },
};

export type StructuralCreativityStop =
  | 'familiar'
  | 'modern'
  | 'inventive'
  | 'radical'
  | 'experimental';

export interface StructuralCreativityStopDefinition {
  stop: StructuralCreativityStop;
  index: number;
  label: string;
  rangeMin: number;
  rangeMax: number;
  defaultScore: number;
  description: string;
  targetDimensions: {
    structuralCreativity: number;
    asymmetry: number;
  };
}

export const STRUCTURAL_CREATIVITY_STOPS: Record<
  StructuralCreativityStop,
  StructuralCreativityStopDefinition
> = {
  familiar: {
    stop: 'familiar',
    index: 0,
    label: 'Familiar',
    rangeMin: 0,
    rangeMax: 20,
    defaultScore: 10,
    description: 'Recognisable, conventional product structures.',
    targetDimensions: {
      structuralCreativity: 10,
      asymmetry: 10,
    },
  },
  modern: {
    stop: 'modern',
    index: 1,
    label: 'Modern',
    rangeMin: 21,
    rangeMax: 40,
    defaultScore: 30,
    description: 'Current polished patterns with mild rethinking.',
    targetDimensions: {
      structuralCreativity: 30,
      asymmetry: 20,
    },
  },
  inventive: {
    stop: 'inventive',
    index: 2,
    label: 'Inventive',
    rangeMin: 41,
    rangeMax: 65,
    defaultScore: 55,
    description: 'Noticeably different composition without harming comprehension.',
    targetDimensions: {
      structuralCreativity: 55,
      asymmetry: 40,
    },
  },
  radical: {
    stop: 'radical',
    index: 3,
    label: 'Radical',
    rangeMin: 66,
    rangeMax: 85,
    defaultScore: 75,
    description: 'Reconceptualise layouts/workflows while preserving product jobs.',
    targetDimensions: {
      structuralCreativity: 75,
      asymmetry: 65,
    },
  },
  experimental: {
    stop: 'experimental',
    index: 4,
    label: 'Experimental',
    rangeMin: 86,
    rangeMax: 100,
    defaultScore: 95,
    description:
      'Permission to explore unconventional information architecture and spatial models while respecting explicit constraints.',
    targetDimensions: {
      structuralCreativity: 95,
      asymmetry: 85,
    },
  },
};

/**
 * Maps a numeric score (0-100) to its corresponding Visual Ambition stop.
 */
export function getVisualAmbitionStop(score: number): VisualAmbitionStop {
  const clamped = clampScore(score);
  if (clamped <= 20) return 'essential';
  if (clamped <= 40) return 'refined';
  if (clamped <= 65) return 'striking';
  if (clamped <= 85) return 'stunning';
  return 'experimental';
}

/**
 * Maps a numeric score (0-100) to its corresponding Structural Creativity stop.
 */
export function getStructuralCreativityStop(score: number): StructuralCreativityStop {
  const clamped = clampScore(score);
  if (clamped <= 20) return 'familiar';
  if (clamped <= 40) return 'modern';
  if (clamped <= 65) return 'inventive';
  if (clamped <= 85) return 'radical';
  return 'experimental';
}

/**
 * Applies a Visual Ambition stop or numeric score onto a DesignDNA object.
 */
export function applyVisualAmbition(
  base: DesignDNA,
  valueOrStop: number | VisualAmbitionStop
): DesignDNA {
  const stopKey = typeof valueOrStop === 'string' ? valueOrStop : getVisualAmbitionStop(valueOrStop);
  const def = VISUAL_AMBITION_STOPS[stopKey];
  const exactScore = typeof valueOrStop === 'number' ? clampScore(valueOrStop) : def.defaultScore;

  // Linear blend between stops or exact application
  const updated = {
    ...base,
    visualAmbition: exactScore,
    typographicExpression: def.targetDimensions.typographicExpression,
    motion: def.targetDimensions.motion,
    imageryIntensity: def.targetDimensions.imageryIntensity,
    videoIntensity: def.targetDimensions.videoIntensity,
    threeDIntensity: def.targetDimensions.threeDIntensity,
    depth: def.targetDimensions.depth,
  };

  return DesignDNASchema.parse(updated);
}

/**
 * Applies a Structural Creativity stop or numeric score onto a DesignDNA object.
 */
export function applyStructuralCreativity(
  base: DesignDNA,
  valueOrStop: number | StructuralCreativityStop
): DesignDNA {
  const stopKey =
    typeof valueOrStop === 'string' ? valueOrStop : getStructuralCreativityStop(valueOrStop);
  const def = STRUCTURAL_CREATIVITY_STOPS[stopKey];
  const exactScore = typeof valueOrStop === 'number' ? clampScore(valueOrStop) : def.defaultScore;

  const updated = {
    ...base,
    structuralCreativity: exactScore,
    asymmetry: def.targetDimensions.asymmetry,
  };

  return DesignDNASchema.parse(updated);
}
