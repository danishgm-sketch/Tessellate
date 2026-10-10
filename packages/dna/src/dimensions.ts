import {
  DESIGN_DNA_NUMERIC_KEYS,
  type DesignDNANumericKey,
  type DesignDNA,
  type PartialDesignDNA,
  DesignDNASchema,
} from '@tessellate/schemas';

export {
  DESIGN_DNA_NUMERIC_KEYS,
  type DesignDNANumericKey,
  type DesignDNA,
  type PartialDesignDNA,
  DesignDNASchema,
};

export type DimensionGroup =
  | 'personality'
  | 'composition'
  | 'visual'
  | 'motion'
  | 'density'
  | 'priority';

export interface DimensionMetadata {
  key: DesignDNANumericKey;
  label: string;
  description: string;
  group: DimensionGroup;
  min: number;
  max: number;
  defaultValue: number;
}

export const DIMENSIONS_METADATA: Record<DesignDNANumericKey, DimensionMetadata> = {
  professionalism: {
    key: 'professionalism',
    label: 'Professionalism',
    description: 'Degree of formality, institutional polish, and structural discipline.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 70,
  },
  playfulness: {
    key: 'playfulness',
    label: 'Playfulness',
    description: 'Whimsy, lighthearted interaction patterns, and energetic visual tone.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 20,
  },
  luxury: {
    key: 'luxury',
    label: 'Luxury',
    description: 'Generous whitespace, premium materials, high craft, and aspirational restraint.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 30,
  },
  warmth: {
    key: 'warmth',
    label: 'Warmth',
    description: 'Human approachability, organic rounding, soft contrast, and inviting tone.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 40,
  },
  technicality: {
    key: 'technicality',
    label: 'Technicality',
    description: 'Scientific precision, monospace accents, data fidelity, and tool-like aesthetic.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 60,
  },
  editorial: {
    key: 'editorial',
    label: 'Editorial',
    description: 'Magazine-like storytelling, prominent typography hierarchy, and reading rhythm.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 40,
  },
  futurism: {
    key: 'futurism',
    label: 'Futurism',
    description: 'Forward-looking aesthetic, luminous accents, cyber/spatial cues, and modern edge.',
    group: 'personality',
    min: 0,
    max: 100,
    defaultValue: 30,
  },
  visualAmbition: {
    key: 'visualAmbition',
    label: 'Visual Ambition',
    description: 'Expressive surface design budget, from essential clarity to experimental spectacle.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 40,
  },
  structuralCreativity: {
    key: 'structuralCreativity',
    label: 'Structural Creativity',
    description: 'Information architecture freedom, from familiar conventions to inventive layouts.',
    group: 'composition',
    min: 0,
    max: 100,
    defaultValue: 30,
  },
  density: {
    key: 'density',
    label: 'Density',
    description: 'Information compactness and component tightness.',
    group: 'density',
    min: 0,
    max: 100,
    defaultValue: 50,
  },
  whitespace: {
    key: 'whitespace',
    label: 'Whitespace',
    description: 'Breathing room, margins, and negative space allocation.',
    group: 'composition',
    min: 0,
    max: 100,
    defaultValue: 60,
  },
  contrast: {
    key: 'contrast',
    label: 'Contrast',
    description: 'Value separation between foreground elements, text, and canvas backgrounds.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 70,
  },
  colourfulness: {
    key: 'colourfulness',
    label: 'Colourfulness',
    description: 'Chroma saturation, palette breadth, and chromatic accents across surfaces.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 35,
  },
  curvature: {
    key: 'curvature',
    label: 'Curvature',
    description: 'Corner radius progression from crisp rectangular edges to pill shapes.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 40,
  },
  depth: {
    key: 'depth',
    label: 'Depth',
    description: 'Elevation, multi-layer shadows, surface bevels, and atmospheric layering.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 30,
  },
  motion: {
    key: 'motion',
    label: 'Motion',
    description: 'Overall animation intensity, transition durations, and interface movement.',
    group: 'motion',
    min: 0,
    max: 100,
    defaultValue: 40,
  },
  motionPlayfulness: {
    key: 'motionPlayfulness',
    label: 'Motion Playfulness',
    description: 'Spring physics, overshoot, bounce, and kinetic micro-delight vs linear precision.',
    group: 'motion',
    min: 0,
    max: 100,
    defaultValue: 20,
  },
  typographicExpression: {
    key: 'typographicExpression',
    label: 'Typographic Expression',
    description: 'Hero scale variance, display font character, and custom typographic weight.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 45,
  },
  imageryIntensity: {
    key: 'imageryIntensity',
    label: 'Imagery Intensity',
    description: 'Dependence on photography, illustrations, and visual assets.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 35,
  },
  videoIntensity: {
    key: 'videoIntensity',
    label: 'Video Intensity',
    description: 'Use of looping video backgrounds, motion previews, and cinematic media.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 10,
  },
  threeDIntensity: {
    key: 'threeDIntensity',
    label: '3D Intensity',
    description: 'Spatial objects, WebGL canvasses, and simulated 3D depth.',
    group: 'visual',
    min: 0,
    max: 100,
    defaultValue: 0,
  },
  dataDensity: {
    key: 'dataDensity',
    label: 'Data Density',
    description: 'Concentration of tables, charts, metrics, and quantitative summaries.',
    group: 'density',
    min: 0,
    max: 100,
    defaultValue: 45,
  },
  interactionDensity: {
    key: 'interactionDensity',
    label: 'Interaction Density',
    description: 'Action targets, shortcuts, quick controls, and interactive widgets per view.',
    group: 'density',
    min: 0,
    max: 100,
    defaultValue: 50,
  },
  asymmetry: {
    key: 'asymmetry',
    label: 'Asymmetry',
    description: 'Intentional imbalance, broken grids, and off-axis visual weight.',
    group: 'composition',
    min: 0,
    max: 100,
    defaultValue: 15,
  },
  conversionIntensity: {
    key: 'conversionIntensity',
    label: 'Conversion Intensity',
    description: 'Prominence of calls-to-action, pricing indicators, and activation incentives.',
    group: 'priority',
    min: 0,
    max: 100,
    defaultValue: 40,
  },
  trust: {
    key: 'trust',
    label: 'Trust & Credibility',
    description: 'Security emphasis, compliance cues, social proof, and stability signals.',
    group: 'priority',
    min: 0,
    max: 100,
    defaultValue: 75,
  },
  accessibilityPriority: {
    key: 'accessibilityPriority',
    label: 'Accessibility Priority',
    description: 'Contrast floor, keyboard focus visual prominence, and reduced-motion enforcement.',
    group: 'priority',
    min: 0,
    max: 100,
    defaultValue: 80,
  },
  performancePriority: {
    key: 'performancePriority',
    label: 'Performance Priority',
    description: 'Weight budget, lazy loading strictness, and low-complexity asset choices.',
    group: 'priority',
    min: 0,
    max: 100,
    defaultValue: 80,
  },
};

/**
 * Baseline default Design DNA:
 * A calm, accessible, high-performance foundation adhering strictly to DesignDNASchema.
 */
export const DEFAULT_DESIGN_DNA: DesignDNA = {
  professionalism: 70,
  playfulness: 20,
  luxury: 30,
  warmth: 40,
  technicality: 60,
  editorial: 40,
  futurism: 30,
  visualAmbition: 40,
  structuralCreativity: 30,
  density: 50,
  whitespace: 60,
  contrast: 70,
  colourfulness: 35,
  curvature: 40,
  depth: 30,
  motion: 40,
  motionPlayfulness: 20,
  typographicExpression: 45,
  imageryIntensity: 35,
  videoIntensity: 10,
  threeDIntensity: 0,
  dataDensity: 45,
  interactionDensity: 50,
  asymmetry: 15,
  conversionIntensity: 40,
  trust: 75,
  accessibilityPriority: 80,
  performancePriority: 80,

  primaryArchetype: 'b2b-saas',
  visualMode: 'light',
  geometryFamily: 'curved',
  navigationModel: 'classic-app-sidebar',
  responsivePhilosophy: 'desktop-dense-mobile-focused',
  contentTone: 'calm',
  primaryStack: 'react-tailwind',
  motionPersonality: 'calm-precision',
  typographyPersonality: 'geist-system',
  surfacePersonality: 'subtle-contrast',
};

/**
 * Clamps a single numeric score to an integer between 0 and 100.
 */
export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Checks whether a key is a valid Design DNA numeric key.
 */
export function isDesignDNANumericKey(key: string): key is DesignDNANumericKey {
  return (DESIGN_DNA_NUMERIC_KEYS as readonly string[]).includes(key);
}

/**
 * Clamps all numeric fields in a partial DNA object to 0-100 integers.
 */
export function clampPartialDNA(partial: PartialDesignDNA): PartialDesignDNA {
  const result: PartialDesignDNA = { ...partial };
  for (const key of DESIGN_DNA_NUMERIC_KEYS) {
    if (typeof result[key] === 'number') {
      result[key] = clampScore(result[key] as number);
    }
  }
  return result;
}

/**
 * Validates a candidate DNA against canonical DesignDNASchema, clamping scores first.
 */
export function validateAndNormalizeDNA(input: unknown): DesignDNA {
  if (typeof input === 'object' && input !== null) {
    const clamped = clampPartialDNA(input as PartialDesignDNA);
    return DesignDNASchema.parse({ ...DEFAULT_DESIGN_DNA, ...clamped });
  }
  return DesignDNASchema.parse(DEFAULT_DESIGN_DNA);
}
