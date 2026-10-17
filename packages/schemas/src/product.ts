import { z } from 'zod';
import { WeightedTagSchema } from './resource.js';
import { SchemaVersionSchema } from './version.js';

export const DeviceTargetSchema = z.enum(['desktop', 'tablet', 'mobile']);
export type DeviceTarget = z.infer<typeof DeviceTargetSchema>;

export const ProjectConstraintsSchema = z.object({
  accessibilityFloor: z.enum(['A', 'AA', 'AAA']).default('AA'),
  performanceCeiling: z.enum(['lightweight', 'balanced', 'rich']).optional(),
  targetDevices: z.array(DeviceTargetSchema).min(1).default(['desktop', 'tablet', 'mobile']),
  allowedDependencies: z.array(z.string()).optional(),
  prohibitedDependencies: z.array(z.string()).optional(),
  requiredScreens: z.array(z.string()).optional(),
  forbiddenScreens: z.array(z.string()).optional(),
  requiredPatterns: z.array(z.string()).optional(),
  forbiddenPatterns: z.array(z.string()).optional(),
  licenseAllowlist: z.array(z.string()).optional(),
}).strict();
export type ProjectConstraints = z.infer<typeof ProjectConstraintsSchema>;

export const ProductEntitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(z.string()).optional(),
}).strict();
export type ProductEntity = z.infer<typeof ProductEntitySchema>;

export const WorkflowModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  steps: z.array(z.string()).min(1),
}).strict();
export type WorkflowModel = z.infer<typeof WorkflowModelSchema>;

export const ScreenSuggestionSchema = z.object({
  name: z.string().min(1),
  screenType: z.string().min(1),
  purpose: z.string().min(1),
  jobs: z.array(z.string()).optional(),
}).strict();
export type ScreenSuggestion = z.infer<typeof ScreenSuggestionSchema>;

const score0To100 = z.number().int().min(0).max(100);

export const ProductModelSchema = z.object({
  schemaVersion: SchemaVersionSchema,
  productArchetypes: z.array(WeightedTagSchema).min(1),
  primaryAudience: z.string().min(1),
  userSophistication: score0To100,
  primaryObjective: z.string().min(1),
  secondaryObjectives: z.array(z.string()).default([]),
  jobsToBeDone: z.array(z.string()).min(1),
  entities: z.array(ProductEntitySchema).default([]),
  workflows: z.array(WorkflowModelSchema).default([]),
  trustRequirement: score0To100,
  informationComplexity: score0To100,
  dataDensity: score0To100,
  collaborationLevel: score0To100,
  transactionCriticality: score0To100,
  navigationComplexity: score0To100,
  mobileImportance: score0To100,
  likelyScreens: z.array(ScreenSuggestionSchema).default([]),
  requiredCapabilities: z.array(z.string()).default([]),
  forbiddenPatterns: z.array(z.string()).default([]),
  constraints: ProjectConstraintsSchema,
}).strict();
export type ProductModel = z.infer<typeof ProductModelSchema>;

export const ScreenVisibilitySchema = z.enum(['primary', 'secondary', 'hidden']);
export type ScreenVisibility = z.infer<typeof ScreenVisibilitySchema>;

export const ScreenNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  screenType: z.string().min(1),
  purpose: z.string().min(1),
  jobs: z.array(z.string()).default([]),
  required: z.boolean(),
  navigationVisibility: ScreenVisibilitySchema,
  importance: score0To100,
  expectedData: z.array(z.string()).default([]),
  requiredRoles: z.array(z.string()).default([]),
  optionalRoles: z.array(z.string()).default([]),
}).strict();
export type ScreenNode = z.infer<typeof ScreenNodeSchema>;

export const ScreenGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  screens: z.array(ScreenNodeSchema).default([]),
}).strict();
export type ScreenGroup = z.infer<typeof ScreenGroupSchema>;

export const ScreenEdgeSchema = z.object({
  id: z.string().min(1),
  fromScreenId: z.string().min(1),
  toScreenId: z.string().min(1),
  label: z.string().optional(),
  condition: z.string().optional(),
}).strict();
export type ScreenEdge = z.infer<typeof ScreenEdgeSchema>;

const ScreenGraphBaseSchema = z.object({
  id: z.string().min(1),
  groups: z.array(ScreenGroupSchema).min(1),
  edges: z.array(ScreenEdgeSchema).default([]),
}).strict();

export const ScreenGraphSchema = ScreenGraphBaseSchema.superRefine((graph, context) => {
  const groupIds = new Set<string>();
  const screenIds = new Set<string>();
  const edgeIds = new Set<string>();

  graph.groups.forEach((group, groupIndex) => {
    if (groupIds.has(group.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['groups', groupIndex, 'id'],
        message: `Duplicate screen group ID: ${group.id}.`,
      });
    }
    groupIds.add(group.id);

    group.screens.forEach((screen, screenIndex) => {
      if (screenIds.has(screen.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['groups', groupIndex, 'screens', screenIndex, 'id'],
          message: `Duplicate screen graph ID: ${screen.id}.`,
        });
      }
      screenIds.add(screen.id);
    });
  });

  graph.edges.forEach((edge, edgeIndex) => {
    if (edgeIds.has(edge.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['edges', edgeIndex, 'id'],
        message: `Duplicate screen edge ID: ${edge.id}.`,
      });
    }
    edgeIds.add(edge.id);

    if (!screenIds.has(edge.fromScreenId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['edges', edgeIndex, 'fromScreenId'],
        message: `Screen edge source ${edge.fromScreenId} is not in this graph.`,
      });
    }
    if (!screenIds.has(edge.toScreenId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['edges', edgeIndex, 'toScreenId'],
        message: `Screen edge target ${edge.toScreenId} is not in this graph.`,
      });
    }
  });
});
export type ScreenGraph = z.infer<typeof ScreenGraphSchema>;
