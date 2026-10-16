import { z } from 'zod';
import { PartialDesignDNASchema } from './dna.js';
import { SchemaVersionSchema } from './version.js';

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
}).strict();
export type CreatorRef = z.infer<typeof CreatorRefSchema>;

export const ProvenanceSchema = z.object({
  origin: z.enum(['tessellate', 'community', 'open-source', 'sponsored']),
  originalUrl: z.string().url().optional(),
  originalRepository: z.string().optional(),
  originalAuthor: z.string().optional(),
  derivative: z.boolean(),
  derivativeNotes: z.string().optional(),
  aiAssistance: z.enum(['none', 'assisted', 'substantial']).default('none'),
}).strict();
export type Provenance = z.infer<typeof ProvenanceSchema>;

export const LicenseInfoSchema = z.object({
  spdx: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url().optional(),
  redistributionVerified: z.boolean(),
  attributionRequired: z.boolean(),
  attributionText: z.string().optional(),
}).strict();
export type LicenseInfo = z.infer<typeof LicenseInfoSchema>;

export const DependencySpecSchema = z.object({
  package: z.string().min(1),
  range: z.string().min(1),
  kind: z.enum(['runtime', 'peer', 'dev']),
  optional: z.boolean().optional(),
  reason: z.string().optional(),
}).strict();
export type DependencySpec = z.infer<typeof DependencySpecSchema>;

export const ResourceFileSpecSchema = z.object({
  path: z.string().min(1),
  kind: z.enum(['component', 'style', 'utility', 'asset', 'fixture', 'type']),
  required: z.boolean(),
}).strict();
export type ResourceFileSpec = z.infer<typeof ResourceFileSpecSchema>;

export const RegistrySpecSchema = z.object({
  name: z.string().min(1),
  dependencies: z.array(z.string()).default([]),
  devDependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
}).strict();
export type RegistrySpec = z.infer<typeof RegistrySpecSchema>;

export const PreviewSpecSchema = z.object({
  component: z.string().min(1),
  defaultProps: z.record(z.string(), z.unknown()).optional(),
  viewport: z.number().int().positive().optional(),
}).strict();
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
}).strict();
export type SlotSpec = z.infer<typeof SlotSpecSchema>;

export const VariantSpecSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  dnaOverrides: PartialDesignDNASchema.optional(),
  props: z.record(z.string(), z.unknown()).optional(),
}).strict();
export type VariantSpec = z.infer<typeof VariantSpecSchema>;

export const WeightedTagSchema = z.object({
  tag: z.string().min(1),
  weight: z.number().int().min(0).max(100),
}).strict();
export type WeightedTag = z.infer<typeof WeightedTagSchema>;

export const ResourceIntentSchema = z.object({
  summary: z.string().min(1),
  idealFor: z.array(z.string()).default([]),
  avoidFor: z.array(z.string()).default([]),
  jobs: z.array(z.string()).default([]),
  contentRequirements: z.array(z.string()).default([]),
  notes: z.array(z.string()).optional(),
}).strict();
export type ResourceIntent = z.infer<typeof ResourceIntentSchema>;

export const InteractionDNASchema = z.object({
  interactionDensity: z.number().int().min(0).max(100),
  motionIntensity: z.number().int().min(0).max(100),
  keyboardComplexity: z.enum(['low', 'medium', 'high']),
  hoverDependency: z.enum(['none', 'optional', 'significant']),
  directManipulation: z.boolean(),
  gestureSupport: z.boolean().optional(),
}).strict();
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
}).strict();
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
}).strict();
export type BreakpointStrategy = z.infer<typeof BreakpointStrategySchema>;

export const ResponsiveSpecSchema = z.object({
  verifiedWidths: z.array(z.number().int().positive()).min(1),
  defaultStrategy: ResponsiveStrategySchema,
  breakpointStrategies: z.array(BreakpointStrategySchema).optional(),
}).strict();
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
}).strict();
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
}).strict();
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
}).strict();
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
}).strict();
export type ResourceRelationship = z.infer<typeof ResourceRelationshipSchema>;

export const CompatibilitySpecSchema = z.object({
  requiredContext: z.array(z.string()).optional(),
  forbiddenContext: z.array(z.string()).optional(),
}).strict();
export type CompatibilitySpec = z.infer<typeof CompatibilitySpecSchema>;

export const ResourceRefSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  version: z.string().min(1),
}).strict();
export type ResourceRef = z.infer<typeof ResourceRefSchema>;

export const ResourceManifestSchema = z.object({
  schemaVersion: SchemaVersionSchema,
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
}).strict();

export type ResourceManifest = z.infer<typeof ResourceManifestSchema>;
