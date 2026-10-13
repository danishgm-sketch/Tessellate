import { z } from 'zod';

export const IntentActionSchema = z.enum([
  'recompose-screen',
  'rethink-screen',
  'adjust-dna',
  'apply-feel',
  'lock-nodes',
  'unlock-nodes',
  'replace-component',
  'surprise-me',
]);
export type IntentAction = z.infer<typeof IntentActionSchema>;

export const NodeLockDimensionSchema = z.enum(['structure', 'content', 'style', 'motion']);
export type NodeLockDimension = z.infer<typeof NodeLockDimensionSchema>;

export const IntentCommandSchema = z.object({
  action: IntentActionSchema,
  summary: z.string().min(1).describe('Concise description of the user intention'),
  targetScreenId: z.string().optional().describe('Screen ID to apply changes to. Defaults to active screen.'),
  targetNodeIds: z.array(z.string()).optional().describe('Node IDs affected by this action'),
  preserveLockedNodes: z.boolean().default(true).describe('Whether locked nodes must be preserved strictly'),
  feelDescriptors: z.string().optional().describe('Feel descriptor text (e.g. "luxury without being flashy", "playful")'),
  dnaDeltas: z.record(z.string(), z.number()).optional().describe('Direct numeric DNA dimension delta modifications (-100 to 100)'),
  categoricalDna: z
    .object({
      geometryFamily: z.enum(['sharp', 'curved', 'pill', 'minimal']).optional(),
      motionPersonality: z.string().optional(),
      typographyPersonality: z.string().optional(),
      surfacePersonality: z.string().optional(),
      contentTone: z.string().optional(),
    })
    .optional(),
  lockDimensions: z.array(NodeLockDimensionSchema).optional().describe('Dimensions to lock/unlock'),
  replacementResourceSlug: z.string().optional().describe('Catalog slug of replacement component if action is replace-component'),
  explanation: z.string().optional().describe('Design rationale behind the proposed action'),
});
export type IntentCommand = z.infer<typeof IntentCommandSchema>;
