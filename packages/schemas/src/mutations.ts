import { z } from 'zod';
import { ProjectNodeSchema, ProjectScreenSchema, NavigationModelSchema } from './project.js';
import { ScreenNodeSchema } from './product.js';
import { ResourceRefSchema } from './resource.js';

export const MutationActorSchema = z.enum(['user', 'deterministic-engine', 'ai']);
export type MutationActor = z.infer<typeof MutationActorSchema>;

const LockKeySchema = z.enum([
  'node',
  'structure',
  'content',
  'style',
  'motion',
  'media',
  'responsive',
  'dna',
]);

// 1. SET_DESIGN_TOKEN
export const SetDesignTokenPayloadSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number()]),
});

// 2. SET_INTENT
export const SetIntentPayloadSchema = z.object({
  dimensions: z.record(z.string(), z.number().int().min(0).max(100)),
});

// 3. SET_PROP
export const SetPropPayloadSchema = z.object({
  prop: z.string().min(1),
  value: z.unknown(),
});

// 4. SET_CONTENT
export const SetContentPayloadSchema = z.object({
  slot: z.string().min(1),
  value: z.unknown(),
});

// 5. INSERT_NODE
export const InsertNodePayloadSchema = z.object({
  parentId: z.string().min(1),
  node: ProjectNodeSchema,
  index: z.number().int().nonnegative().optional(),
});

// 6. DELETE_NODE
export const DeleteNodePayloadSchema = z.object({
  nodeId: z.string().min(1),
});

// 7. MOVE_NODE
export const MoveNodePayloadSchema = z.object({
  nodeId: z.string().min(1),
  newParentId: z.string().min(1),
  index: z.number().int().nonnegative().optional(),
});

// 8. REPLACE_NODE
export const ReplaceNodePayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  replacementNode: ProjectNodeSchema,
});

// 9. CHANGE_RESOURCE
export const ChangeResourcePayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  resourceRef: ResourceRefSchema,
});

// 10. CHANGE_VARIANT
export const ChangeVariantPayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  variant: z.string().min(1),
});

// 11. CHANGE_LAYOUT
export const ChangeLayoutPayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  layout: z.record(z.string(), z.unknown()),
});

// 12. LOCK_NODE
export const LockNodePayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  lockTypes: z.array(LockKeySchema).min(1),
});

// 13. UNLOCK_NODE
export const UnlockNodePayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  lockTypes: z.array(LockKeySchema).min(1),
});

// 14. ADD_SCREEN
export const AddScreenPayloadSchema = z.object({
  screen: ProjectScreenSchema,
  screenNode: ScreenNodeSchema,
});

// 15. DELETE_SCREEN
export const DeleteScreenPayloadSchema = z.object({
  screenId: z.string().min(1),
});

// 16. MOVE_SCREEN
export const MoveScreenPayloadSchema = z.object({
  screenId: z.string().min(1),
  newIndex: z.number().int().nonnegative(),
});

// 17. SET_NAVIGATION
export const SetNavigationPayloadSchema = z.object({
  navigation: NavigationModelSchema,
});

// 18. SET_MOTION
export const SetMotionPayloadSchema = z.object({
  targetNodeId: z.string().optional(),
  motionSettings: z.record(z.string(), z.unknown()),
});

// 19. SET_MEDIA
export const SetMediaPayloadSchema = z.object({
  targetNodeId: z.string().min(1),
  slot: z.string().min(1),
  media: z.record(z.string(), z.unknown()),
});

// Helper builder for discriminated mutation schemas
function createMutationSchema<TType extends string, TPayload extends z.ZodTypeAny>(
  type: TType,
  payloadSchema: TPayload
) {
  return z.object({
    id: z.string().min(1),
    type: z.literal(type),
    targetId: z.string().min(1),
    payload: payloadSchema,
    actor: MutationActorSchema,
    timestamp: z.string().datetime(),
    preconditionRevision: z.number().int().nonnegative(),
  });
}

export const SetDesignTokenMutationSchema = createMutationSchema('SET_DESIGN_TOKEN', SetDesignTokenPayloadSchema);
export const SetIntentMutationSchema = createMutationSchema('SET_INTENT', SetIntentPayloadSchema);
export const SetPropMutationSchema = createMutationSchema('SET_PROP', SetPropPayloadSchema);
export const SetContentMutationSchema = createMutationSchema('SET_CONTENT', SetContentPayloadSchema);
export const InsertNodeMutationSchema = createMutationSchema('INSERT_NODE', InsertNodePayloadSchema);
export const DeleteNodeMutationSchema = createMutationSchema('DELETE_NODE', DeleteNodePayloadSchema);
export const MoveNodeMutationSchema = createMutationSchema('MOVE_NODE', MoveNodePayloadSchema);
export const ReplaceNodeMutationSchema = createMutationSchema('REPLACE_NODE', ReplaceNodePayloadSchema);
export const ChangeResourceMutationSchema = createMutationSchema('CHANGE_RESOURCE', ChangeResourcePayloadSchema);
export const ChangeVariantMutationSchema = createMutationSchema('CHANGE_VARIANT', ChangeVariantPayloadSchema);
export const ChangeLayoutMutationSchema = createMutationSchema('CHANGE_LAYOUT', ChangeLayoutPayloadSchema);
export const LockNodeMutationSchema = createMutationSchema('LOCK_NODE', LockNodePayloadSchema);
export const UnlockNodeMutationSchema = createMutationSchema('UNLOCK_NODE', UnlockNodePayloadSchema);
export const AddScreenMutationSchema = createMutationSchema('ADD_SCREEN', AddScreenPayloadSchema);
export const DeleteScreenMutationSchema = createMutationSchema('DELETE_SCREEN', DeleteScreenPayloadSchema);
export const MoveScreenMutationSchema = createMutationSchema('MOVE_SCREEN', MoveScreenPayloadSchema);
export const SetNavigationMutationSchema = createMutationSchema('SET_NAVIGATION', SetNavigationPayloadSchema);
export const SetMotionMutationSchema = createMutationSchema('SET_MOTION', SetMotionPayloadSchema);
export const SetMediaMutationSchema = createMutationSchema('SET_MEDIA', SetMediaPayloadSchema);

export const ProjectMutationSchema = z.discriminatedUnion('type', [
  SetDesignTokenMutationSchema,
  SetIntentMutationSchema,
  SetPropMutationSchema,
  SetContentMutationSchema,
  InsertNodeMutationSchema,
  DeleteNodeMutationSchema,
  MoveNodeMutationSchema,
  ReplaceNodeMutationSchema,
  ChangeResourceMutationSchema,
  ChangeVariantMutationSchema,
  ChangeLayoutMutationSchema,
  LockNodeMutationSchema,
  UnlockNodeMutationSchema,
  AddScreenMutationSchema,
  DeleteScreenMutationSchema,
  MoveScreenMutationSchema,
  SetNavigationMutationSchema,
  SetMotionMutationSchema,
  SetMediaMutationSchema,
]);

export type ProjectMutation = z.infer<typeof ProjectMutationSchema>;
export type MutationType = ProjectMutation['type'];

export const HistoryOperationSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  actor: MutationActorSchema,
  createdAt: z.string().datetime(),
  mutations: z.array(ProjectMutationSchema).min(1),
  inverseMutations: z.array(ProjectMutationSchema).default([]),
  affectedNodeIds: z.array(z.string()).default([]),
});

export type HistoryOperation = z.infer<typeof HistoryOperationSchema>;
