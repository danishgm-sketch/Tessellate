import { z } from 'zod';
import { PartialDesignDNASchema } from './dna.js';

export const ResourceTypeSchema = z.enum([
  'primitive',
  'component',
  'section',
  'block',
  'page',
  'flow',
  'effect',
  'background',
  'typography',
  'motion',
  'data-visualization',
  'ai-pattern',
  'state',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const ResourceStatusSchema = z.enum(['draft', 'experimental', 'verified', 'verified-gold', 'deprecated']);
export type ResourceStatus = z.infer<typeof ResourceStatusSchema>;

export const CreatorRefSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  handle: z.string().min(1),
  url: z.string().url().optional(),
});
export type CreatorRef = z.infer<typeof CreatorRefSchema>;

export const ProvenanceSchema = z.object({
  origin: z.enum(['tessellate', 'community', 'open-source', 'sponsored']),
  originalUrl: z.string().url().optional(),
  originalRepository: z.string().optional(),
  originalAuthor: z.string().optional(),
  derivative: z.boolean(),
  derivativeNotes: z.string().optional(),
  aiAssistance: z.enum(['none', 'assisted', 'substantial']).default('none'),
});
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const LicenseInfoSchema = z.object({
  spdx: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url().optional(),
  redistributionVerified: z.boolean(),
  attributionRequired: z.boolean(),
  attributionText: z.string().optional(),
});
export type LicenseInfo = z.infer<typeof LicenseInfoSchema>;

export const DependencySpecSchema = z.object({
  package: z.string().min(1),
  range: z.string().min(1),
  kind: z.enum(['runtime', 'peer', 'dev']),
  optional: z.boolean().optional(),
  reason: z.string().optional(),
});
export type DependencySpec = z.infer<typeof DependencySpecSchema>;

export const ResourceFileSpecSchema = z.object({
  path: z.string().min(1),
  kind: z.enum(['component', 'style', 'utility', 'asset', 'fixture', 'type']),
  required: z.boolean(),
});
export type ResourceFileSpec = z.infer<typeof ResourceFileSpecSchema>;

export const RegistrySpecSchema = z.object({
  name: z.string().min(1),
  dependencies: z.array(z.string()).default([]),
  devDependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
});
export type RegistrySpec = z.infer<typeof RegistrySpecSchema>;

export const PreviewSpecSchema = z.object({
  component: z.string().min(1),
  defaultProps: z.record(z.string(), z.unknown()).optional(),
  viewport: z.number().int().positive().optional(),
});
export type PreviewSpec = z.infer<typeof PreviewSpecSchema>;

export const SlotTypeSchema = z.enum([
  'text',
  'rich-text',
  'image',
  'video',
  'icon',
  'action',
  'items',
  'data',
  'component',
  'number',
  'boolean',
]);
export type SlotType = z.infer<typeof SlotTypeSchema>;

export const SlotSpecSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: SlotTypeSchema,
  required: z.boolean(),
  description: z.string().optional(),
  defaultValue: z.unknown().optional(),
  constraints: z.record(z.string(), z.unknown()).optional(),
});
export type SlotSpec = z.infer<typeof SlotSpecSchema>;

export const VariantSpecSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  dnaOverrides: PartialDesignDNASchema.optional(),
  props: z.record(z.string(), z.unknown()).optional(),
});
export type VariantSpec = z.infer<typeof VariantSpecSchema>;

export const WeightedTagSchema = z.object({
  tag: z.string().min(1),
  weight: z.number().int().min(0).max(100),
});
export type WeightedTag = z.infer<typeof WeightedTagSchema>;

export const ResourceIntentSchema = z.object({
  summary: z.string().min(1),
  idealFor: z.array(z.string()).default([]),
  avoidFor: z.array(z.string()).default([]),
  jobs: z.array(z.string()).default([]),
  contentRequirements: z.array(z.string()).default([]),
  notes: z.array(z.string()).optional(),
});
export type ResourceIntent = z.infer<typeof ResourceIntentSchema>;

export const InteractionDNASchema = z.object({
  interactionDensity: z.number().int().min(0).max(100),
  motionIntensity: z.number().int().min(0).max(100),
  keyboardComplexity: z.enum(['low', 'medium', 'high']),
  hoverDependency: z.enum(['none', 'optional', 'significant']),
  directManipulation: z.boolean(),
  gestureSupport: z.boolean().optional(),
});
export type InteractionDNA = z.infer<typeof InteractionDNASchema>;

export const LayoutWidthSchema = z.enum(['narrow', 'content', 'wide', 'full']);
export type LayoutWidth = z.infer<typeof LayoutWidthSchema>;

export const LayoutDNASchema = z.object({
  density: z.number().int().min(0).max(100),
  whitespace: z.number().int().min(0).max(100),
  asymmetry: z.number().int().min(0).max(100),
  preferredWidths: z.array(LayoutWidthSchema).min(1),
  layoutFamilies: z.array(z.string()).default([]),
  supportsSticky: z.boolean().optional(),
  supportsOverlap: z.boolean().optional(),
});
export type LayoutDNA = z.infer<typeof LayoutDNASchema>;

export const ResponsiveStrategySchema = z.enum([
  'compress',
  'stack',
  'collapse',
  'transform',
  'substitute',
  'omit-nonessential',
]);
export type ResponsiveStrategy = z.infer<typeof ResponsiveStrategySchema>;

export const BreakpointStrategySchema = z.object({
  maxWidth: z.number().int().positive(),
  strategy: ResponsiveStrategySchema,
  substituteResourceId: z.string().optional(),
  notes: z.string().optional(),
});
export type BreakpointStrategy = z.infer<typeof BreakpointStrategySchema>;

export const ResponsiveSpecSchema = z.object({
  verifiedWidths: z.array(z.number().int().positive()).min(1),
  defaultStrategy: ResponsiveStrategySchema,
  breakpointStrategies: z.array(BreakpointStrategySchema).optional(),
});
export type ResponsiveSpec = z.infer<typeof ResponsiveSpecSchema>;

export const AccessibilitySpecSchema = z.object({
  levelTarget: z.enum(['none', 'A', 'AA', 'AAA']),
  keyboardVerified: z.boolean(),
  screenReaderSemantics: z.boolean(),
  reducedMotionVerified: z.boolean(),
  contrastTokenCompatible: z.boolean(),
  focusVisible: z.boolean(),
  dragKeyboardAlternative: z.boolean().optional(),
  knownLimitations: z.array(z.string()).optional(),
});
export type AccessibilitySpec = z.infer<typeof AccessibilitySpecSchema>;

export const PerformanceCostSchema = z.enum(['none', 'tiny', 'low', 'medium', 'high']);
export type PerformanceCost = z.infer<typeof PerformanceCostSchema>;

export const PerformanceSpecSchema = z.object({
  jsCost: PerformanceCostSchema,
  gpuCost: z.enum(['none', 'low', 'medium', 'high']),
  mediaCost: z.enum(['none', 'low', 'medium', 'high']),
  runtimeComplexity: z.enum(['low', 'medium', 'high']),
  lazyRecommended: z.boolean(),
  continuousAnimation: z.boolean(),
  notes: z.array(z.string()).optional(),
});
export type PerformanceSpec = z.infer<typeof PerformanceSpecSchema>;

const qualityScore = z.number().int().min(0).max(100);

export const QualitySpecSchema = z.object({
  overall: qualityScore,
  accessibility: qualityScore,
  responsive: qualityScore,
  performance: qualityScore,
  codeQuality: qualityScore,
  composability: qualityScore,
  visualCraft: qualityScore,
  dependencyCleanliness: qualityScore,
  documentation: qualityScore,
});
export type QualitySpec = z.infer<typeof QualitySpecSchema>;

export const RelationshipTypeSchema = z.enum([
  'WORKS_WITH',
  'CONTRASTS_WITH',
  'ALTERNATIVE_TO',
  'REPLACES',
  'EXTENDS',
  'REQUIRES',
  'BELONGS_TO',
  'GOOD_FOR',
  'AVOID_FOR',
  'SAME_FAMILY',
  'MOBILE_ALTERNATIVE',
  'LOW_COST_ALTERNATIVE',
  'HIGH_AMBITION_ALTERNATIVE',
]);
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

export const ResourceRelationshipSchema = z.object({
  type: RelationshipTypeSchema,
  target: z.string().min(1),
  strength: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});
export type ResourceRelationship = z.infer<typeof ResourceRelationshipSchema>;

export const CompatibilitySpecSchema = z.object({
  requiredContext: z.array(z.string()).optional(),
  forbiddenContext: z.array(z.string()).optional(),
});
export type CompatibilitySpec = z.infer<typeof CompatibilitySpecSchema>;

export const ResourceRefSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  version: z.string().min(1),
});
export type ResourceRef = z.infer<typeof ResourceRefSchema>;

/**
 * Resource contract v2 (Phase 30). A v2 resource renders the client's content from typed props, styles
 * itself only with semantic token utilities, declares its loading/empty/error states, and is only
 * "verified" once a named human has reviewed it after the automated checks pass (D-040).
 */
export const PropTypeSchema = z.enum(['string', 'number', 'boolean', 'enum', 'string[]', 'object', 'object[]', 'callback', 'node']);
export type PropType = z.infer<typeof PropTypeSchema>;

export const PropSpecSchema = z.object({
  name: z.string().regex(/^[a-z][A-Za-z0-9]*$/, 'prop names are camelCase'),
  type: PropTypeSchema,
  required: z.boolean().default(false),
  description: z.string().min(1),
  enumValues: z.array(z.string()).optional(),
  /** Composition content key this prop receives (heading, description, items, rows, columns, brand …). */
  content: z.string().optional(),
});
export type PropSpec = z.infer<typeof PropSpecSchema>;

export const ResourceStatesSchema = z.object({
  loading: z.boolean(),
  empty: z.boolean(),
  error: z.boolean(),
});
export type ResourceStates = z.infer<typeof ResourceStatesSchema>;

export const StylingContractSchema = z.object({
  /** True when the component uses only semantic token utilities (checked by audit:resource-tokens). */
  tokenOnly: z.boolean(),
  /** Animated resources must honour prefers-reduced-motion. */
  reducedMotion: z.enum(['not-animated', 'respected']),
});
export type StylingContract = z.infer<typeof StylingContractSchema>;

export const ResourceReviewSchema = z.object({
  reviewer: z.string().min(1),
  reviewedAt: z.string().datetime(),
  notes: z.string().optional(),
});
export type ResourceReview = z.infer<typeof ResourceReviewSchema>;

export const ResourceManifestSchema = z.object({
  schemaVersion: z.string().min(1),
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  version: z.string().min(1),
  status: ResourceStatusSchema,
  description: z.string().min(1),
  resourceType: ResourceTypeSchema,
  categories: z.array(z.string()).min(1),
  roles: z.array(z.string()).min(1),
  purposes: z.array(z.string()).min(1),
  productArchetypes: z.array(WeightedTagSchema).default([]),
  creator: CreatorRefSchema,
  provenance: ProvenanceSchema,
  license: LicenseInfoSchema,
  framework: z.literal('react'),
  language: z.literal('typescript'),
  styling: z.literal('tailwind'),
  dependencies: z.array(DependencySpecSchema).default([]),
  files: z.array(ResourceFileSpecSchema).min(1),
  registry: RegistrySpecSchema,
  preview: PreviewSpecSchema,
  slots: z.array(SlotSpecSchema).default([]),
  variants: z.array(VariantSpecSchema).default([]),
  tags: z.array(z.string()).default([]),
  intent: ResourceIntentSchema,
  visualDNA: PartialDesignDNASchema,
  dnaRelevance: z.record(z.string(), z.number().min(0).max(1)).optional(),
  interactionDNA: InteractionDNASchema,
  layoutDNA: LayoutDNASchema,
  responsive: ResponsiveSpecSchema,
  accessibility: AccessibilitySpecSchema,
  performance: PerformanceSpecSchema,
  complexity: z.enum(['low', 'medium', 'high']),
  customizability: z.enum(['low', 'medium', 'high']),
  compatibility: CompatibilitySpecSchema,
  relationships: z.array(ResourceRelationshipSchema).default([]),
  quality: QualitySpecSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  /** 2 for resources that meet contract v2 (props, states, token-only styling). */
  contractVersion: z.union([z.literal(1), z.literal(2)]).optional(),
  props: z.array(PropSpecSchema).optional(),
  states: ResourceStatesSchema.optional(),
  stylingContract: StylingContractSchema.optional(),
  review: ResourceReviewSchema.optional(),
}).superRefine((m, ctx) => {
  if ((m.status === 'verified' || m.status === 'verified-gold') && !m.review) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['review'], message: 'a verified resource needs a named human reviewer (D-040)' });
  }
  if (m.contractVersion === 2) {
    for (const key of ['props', 'states', 'stylingContract'] as const) {
      if (!m[key]) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `contract v2 resources must declare ${key}` });
    }
    if (m.stylingContract && !m.stylingContract.tokenOnly) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stylingContract', 'tokenOnly'], message: 'contract v2 resources must be token-only' });
    }
  }
});

export type ResourceManifest = z.infer<typeof ResourceManifestSchema>;
