import { z } from 'zod';
import { SchemaVersionSchema } from './version.js';
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
}).strict();
export type NodeLocks = z.infer<typeof NodeLocksSchema>;

export const LOCK_TYPES = [
  'node',
  'structure',
  'content',
  'style',
  'motion',
  'media',
  'responsive',
  'dna',
] as const;
export const LockTypeSchema = z.enum(LOCK_TYPES);
export type LockTypeName = z.infer<typeof LockTypeSchema>;

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
  }).strict()
);

export const ProjectScreenSchema = z.object({
  id: z.string().min(1),
  screenNodeId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  rootNode: ProjectNodeSchema,
}).strict();
export type ProjectScreen = z.infer<typeof ProjectScreenSchema>;

export const NavigationItemSchema = z.object({
  label: z.string().min(1),
  targetScreenId: z.string().min(1),
  icon: z.string().optional(),
}).strict();
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

export const NavigationModelSchema = z.object({
  model: z.string().min(1),
  primaryItems: z.array(NavigationItemSchema).default([]),
  secondaryItems: z.array(NavigationItemSchema).optional(),
}).strict();
export type NavigationModel = z.infer<typeof NavigationModelSchema>;

export const BrandDNASchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  fontHeading: z.string().optional(),
  fontBody: z.string().optional(),
}).strict();
export type BrandDNA = z.infer<typeof BrandDNASchema>;

export const ProjectAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mimeType: z.string().min(1),
  url: z.string().min(1),
  size: z.number().int().positive().optional(),
}).strict();
export type ProjectAsset = z.infer<typeof ProjectAssetSchema>;

export const LockSpecSchema = z.object({
  targetNodeId: z.string().min(1),
  lockTypes: z.array(LockTypeSchema).min(1),
  reason: z.string().optional(),
}).strict();
export type LockSpec = z.infer<typeof LockSpecSchema>;

export const HistoryMetaSchema = z.object({
  totalOperations: z.number().int().nonnegative().default(0),
  headRevision: z.number().int().nonnegative().default(0),
}).strict();
export type HistoryMeta = z.infer<typeof HistoryMetaSchema>;

export const ExportTargetSchema = z.enum([
  'vite-react-tailwind',
  'nextjs',
  'expo',
  'swiftui',
  'tokens',
]);
export type ExportTarget = z.infer<typeof ExportTargetSchema>;

export const ExportSettingsSchema = z.object({
  framework: z.literal('react').default('react'),
  styling: z.literal('tailwind').default('tailwind'),
  includeTypes: z.boolean().default(true),
  target: ExportTargetSchema.default('vite-react-tailwind'),
}).strict();
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
}).strict();
export type DesignDirection = z.infer<typeof DesignDirectionSchema>;

const ProjectManifestBaseSchema = z.object({
  schemaVersion: SchemaVersionSchema,
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
}).strict();

export const ProjectManifestSchema = ProjectManifestBaseSchema.superRefine((manifest, context) => {
  const projectScreenIds = new Set<string>();
  const projectScreenNodeIds = new Set<string>();
  const projectSlugs = new Set<string>();
  const graphScreenIds = new Set(
    manifest.screenGraph.groups.flatMap((group) => group.screens.map((screen) => screen.id))
  );
  const projectNodeIds = new Set<string>();

  const visitNode = (node: ProjectNode, path: (string | number)[]) => {
    if (projectNodeIds.has(node.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...path, 'id'],
        message: `Duplicate project node ID: ${node.id}.`,
      });
    }
    projectNodeIds.add(node.id);
    node.children.forEach((child, index) => visitNode(child, [...path, 'children', index]));
  };

  manifest.screens.forEach((screen, index) => {
    if (projectScreenIds.has(screen.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['screens', index, 'id'],
        message: `Duplicate project screen ID: ${screen.id}.`,
      });
    }
    projectScreenIds.add(screen.id);

    if (projectScreenNodeIds.has(screen.screenNodeId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['screens', index, 'screenNodeId'],
        message: `Duplicate screen graph reference: ${screen.screenNodeId}.`,
      });
    }
    projectScreenNodeIds.add(screen.screenNodeId);
    if (!graphScreenIds.has(screen.screenNodeId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['screens', index, 'screenNodeId'],
        message: `Screen graph node ${screen.screenNodeId} is not present in the project screen graph.`,
      });
    }

    if (projectSlugs.has(screen.slug)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['screens', index, 'slug'],
        message: `Duplicate project screen slug: ${screen.slug}.`,
      });
    }
    projectSlugs.add(screen.slug);
    visitNode(screen.rootNode, ['screens', index, 'rootNode']);
  });

  const checkNavigationItems = (items: NavigationItem[] | undefined, path: (string | number)[]) => {
    items?.forEach((item, index) => {
      if (!projectScreenIds.has(item.targetScreenId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path, index, 'targetScreenId'],
          message: `Navigation target ${item.targetScreenId} is not a project screen.`,
        });
      }
    });
  };
  checkNavigationItems(manifest.navigation.primaryItems, ['navigation', 'primaryItems']);
  checkNavigationItems(manifest.navigation.secondaryItems, ['navigation', 'secondaryItems']);

  manifest.locks.forEach((lock, index) => {
    if (!projectNodeIds.has(lock.targetNodeId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locks', index, 'targetNodeId'],
        message: `Lock target ${lock.targetNodeId} is not a project node.`,
      });
    }
  });
});

export type ProjectManifest = z.infer<typeof ProjectManifestSchema>;
