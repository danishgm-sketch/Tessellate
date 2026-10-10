import { z } from 'zod';
import { WeightedTagSchema } from './resource.js';

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
});
export type ProjectConstraints = z.infer<typeof ProjectConstraintsSchema>;

export const ProductEntitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(z.string()).optional(),
});
export type ProductEntity = z.infer<typeof ProductEntitySchema>;

export const WorkflowModelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  steps: z.array(z.string()).min(1),
});
export type WorkflowModel = z.infer<typeof WorkflowModelSchema>;

export const ScreenSuggestionSchema = z.object({
  name: z.string().min(1),
  screenType: z.string().min(1),
  purpose: z.string().min(1),
  jobs: z.array(z.string()).optional(),
});
export type ScreenSuggestion = z.infer<typeof ScreenSuggestionSchema>;

const score0To100 = z.number().int().min(0).max(100);

export const ProductModelSchema = z.object({
  schemaVersion: z.string().min(1),
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
});
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
});
export type ScreenNode = z.infer<typeof ScreenNodeSchema>;

export const ScreenGroupSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  screens: z.array(ScreenNodeSchema).default([]),
});
export type ScreenGroup = z.infer<typeof ScreenGroupSchema>;

export const ScreenEdgeSchema = z.object({
  id: z.string().min(1),
  fromScreenId: z.string().min(1),
  toScreenId: z.string().min(1),
  label: z.string().optional(),
  condition: z.string().optional(),
});
export type ScreenEdge = z.infer<typeof ScreenEdgeSchema>;

export const ScreenGraphSchema = z.object({
  id: z.string().min(1),
  groups: z.array(ScreenGroupSchema).min(1),
  edges: z.array(ScreenEdgeSchema).default([]),
});
export type ScreenGraph = z.infer<typeof ScreenGraphSchema>;
