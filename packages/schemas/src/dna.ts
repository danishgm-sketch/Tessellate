import { z } from 'zod';

export const DESIGN_DNA_NUMERIC_KEYS = [
  'professionalism',
  'playfulness',
  'luxury',
  'warmth',
  'technicality',
  'editorial',
  'futurism',
  'visualAmbition',
  'structuralCreativity',
  'density',
  'whitespace',
  'contrast',
  'colourfulness',
  'curvature',
  'depth',
  'motion',
  'motionPlayfulness',
  'typographicExpression',
  'imageryIntensity',
  'videoIntensity',
  'threeDIntensity',
  'dataDensity',
  'interactionDensity',
  'asymmetry',
  'conversionIntensity',
  'trust',
  'accessibilityPriority',
  'performancePriority',
] as const;

export type DesignDNANumericKey = (typeof DESIGN_DNA_NUMERIC_KEYS)[number];

const dnaScore = z.number().int().min(0).max(100);

export const VisualModeSchema = z.enum(['light', 'dark', 'adaptive']);
export type VisualMode = z.infer<typeof VisualModeSchema>;

export const PrimaryStackSchema = z.literal('react-tailwind');
export type PrimaryStack = z.infer<typeof PrimaryStackSchema>;

export const DesignDNASchema = z.object({
  // Numeric 0–100 dimensions
  professionalism: dnaScore,
  playfulness: dnaScore,
  luxury: dnaScore,
  warmth: dnaScore,
  technicality: dnaScore,
  editorial: dnaScore,
  futurism: dnaScore,
  visualAmbition: dnaScore,
  structuralCreativity: dnaScore,
  density: dnaScore,
  whitespace: dnaScore,
  contrast: dnaScore,
  colourfulness: dnaScore,
  curvature: dnaScore,
  depth: dnaScore,
  motion: dnaScore,
  motionPlayfulness: dnaScore,
  typographicExpression: dnaScore,
  imageryIntensity: dnaScore,
  videoIntensity: dnaScore,
  threeDIntensity: dnaScore,
  dataDensity: dnaScore,
  interactionDensity: dnaScore,
  asymmetry: dnaScore,
  conversionIntensity: dnaScore,
  trust: dnaScore,
  accessibilityPriority: dnaScore,
  performancePriority: dnaScore,

  // Categorical dimensions
  primaryArchetype: z.string().min(1),
  visualMode: VisualModeSchema,
  geometryFamily: z.string().min(1),
  navigationModel: z.string().min(1),
  responsivePhilosophy: z.string().min(1),
  contentTone: z.string().min(1),
  primaryStack: PrimaryStackSchema,
  motionPersonality: z.string().min(1),
  typographyPersonality: z.string().min(1),
  surfacePersonality: z.string().min(1),
}).strict();

export type DesignDNA = z.infer<typeof DesignDNASchema>;

export const PartialDesignDNASchema = DesignDNASchema.partial();
export type PartialDesignDNA = z.infer<typeof PartialDesignDNASchema>;
