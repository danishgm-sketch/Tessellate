import { z } from 'zod';
import { DesignDNASchema, PartialDesignDNASchema } from './dna.js';
import { ResourceRefSchema, type ResourceRef } from './resource.js';
import { ProductModelSchema, ScreenGraphSchema, ProjectConstraintsSchema } from './product.js';

export const NodeLocksSchema = z.object({
  node: z.boolean().optional(),
  structure: z.boolean().optional(),
  content: z.boolean().optional(),
  style: z.boolean().optional(),
  motion: z.boolean().optional(),
  media: z.boolean().optional(),
  responsive: z.boolean().optional(),
  dna: z.boolean().optional(),
});
export type NodeLocks = z.infer<typeof NodeLocksSchema>;

export const NodeTypeSchema = z.enum(['section', 'block', 'component', 'element', 'layout']);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export type ProjectNode = {
  id: string;
  nodeType: NodeType;
  semanticRole: string;
  resourceRef?: ResourceRef;
  variant?: string;
  children: ProjectNode[];
  slots: Record<string, unknown>;
  props: Record<string, unknown>;
  dnaOverrides?: z.infer<typeof PartialDesignDNASchema>;
  tokenOverrides?: Record<string, string | number>;
  responsiveOverrides?: Record<string, unknown>;
  locks?: NodeLocks;
};

export type ProjectNodeInput = {
  id: string;
  nodeType: NodeType;
  semanticRole: string;
  resourceRef?: ResourceRef;
  variant?: string;
  children?: ProjectNodeInput[];
  slots?: Record<string, unknown>;
  props?: Record<string, unknown>;
  dnaOverrides?: z.infer<typeof PartialDesignDNASchema>;
  tokenOverrides?: Record<string, string | number>;
  responsiveOverrides?: Record<string, unknown>;
  locks?: NodeLocks;
};

export const ProjectNodeSchema: z.ZodType<ProjectNode, z.ZodTypeDef, ProjectNodeInput> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    nodeType: NodeTypeSchema,
    semanticRole: z.string().min(1),
    resourceRef: ResourceRefSchema.optional(),
    variant: z.string().optional(),
    children: z.array(ProjectNodeSchema).default([]),
    slots: z.record(z.string(), z.unknown()).default({}),
    props: z.record(z.string(), z.unknown()).default({}),
    dnaOverrides: PartialDesignDNASchema.optional(),
    tokenOverrides: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    responsiveOverrides: z.record(z.string(), z.unknown()).optional(),
    locks: NodeLocksSchema.optional(),
  })
);

export const ProjectScreenSchema = z.object({
  id: z.string().min(1),
  screenNodeId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  rootNode: ProjectNodeSchema,
});
export type ProjectScreen = z.infer<typeof ProjectScreenSchema>;

export const NavigationItemSchema = z.object({
  label: z.string().min(1),
  targetScreenId: z.string().min(1),
  icon: z.string().optional(),
});
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

export const NavigationModelSchema = z.object({
  model: z.string().min(1),
  primaryItems: z.array(NavigationItemSchema).default([]),
  secondaryItems: z.array(NavigationItemSchema).optional(),
});
export type NavigationModel = z.infer<typeof NavigationModelSchema>;

export const BrandDNASchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
});
export type BrandDNA = z.infer<typeof BrandDNASchema>;

export const ProjectAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  url: z.string().min(1),
  size: z.number().int().positive().optional(),
});
export type ProjectAsset = z.infer<typeof ProjectAssetSchema>;

export const LockSpecSchema = z.object({
  targetNodeId: z.string().min(1),
  lockTypes: z.array(z.enum(['node', 'structure', 'content', 'style', 'motion', 'media', 'responsive', 'dna'])),
  reason: z.string().optional(),
});
export type LockSpec = z.infer<typeof LockSpecSchema>;

export const HistoryMetaSchema = z.object({
  totalOperations: z.number().int().nonnegative().default(0),
  headRevision: z.number().int().nonnegative().default(0),
});
export type HistoryMeta = z.infer<typeof HistoryMetaSchema>;

export const ExportSettingsSchema = z.object({
  framework: z.literal('react').default('react'),
  styling: z.literal('tailwind').default('tailwind'),
  includeTypes: z.boolean().default(true),
  target: z.string().default('vite-react-tailwind'),
});
export type ExportSettings = z.infer<typeof ExportSettingsSchema>;

export const DesignDirectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rationale: z.string().min(1),
  designDNA: DesignDNASchema,
  screenGraph: ScreenGraphSchema,
  navigationModel: NavigationModelSchema,
  layoutGrammarFamily: z.string().min(1),
  representativeResources: z.array(ResourceRefSchema).default([]),
  seed: z.string().min(1),
});
export type DesignDirection = z.infer<typeof DesignDirectionSchema>;

export const ProjectManifestSchema = z.object({
  schemaVersion: z.string().min(1),
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  catalogVersion: z.string().min(1),
  seed: z.string().min(1),
  productModel: ProductModelSchema,
  designDNA: DesignDNASchema,
  brand: BrandDNASchema.optional(),
  constraints: ProjectConstraintsSchema,
  screenGraph: ScreenGraphSchema,
  screens: z.array(ProjectScreenSchema).default([]),
  navigation: NavigationModelSchema,
  assets: z.array(ProjectAssetSchema).default([]),
  locks: z.array(LockSpecSchema).default([]),
  historyMeta: HistoryMetaSchema,
  exportSettings: ExportSettingsSchema,
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
