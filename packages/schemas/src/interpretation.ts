import { z } from 'zod';
import { ProductModelSchema, ScreenGraphSchema } from './product.js';

/**
 * Brief interpretation produced by the host daemon's bespoke model (D-033/D-034). Validated at the API
 * boundary before the Workbench shows it in the "Review inferred product" step.
 */
export const BriefInterpretationSchema = z.object({
  kind: z.literal('interpretation'),
  productModel: ProductModelSchema,
  screenGraph: ScreenGraphSchema,
  /** Look-and-feel words found in the brief, e.g. "calm, trustworthy". */
  feel: z.string().default(''),
  /** Plain-language notes about anything inferred rather than stated. */
  assumptions: z.array(z.string()).default([]),
  confidence: z.object({
    archetype: z.number().min(0).max(1),
    /** Entity name → confidence; values ≤ 0.45 are suggestions the brief did not mention. */
    entities: z.record(z.string(), z.number().min(0).max(1)).default({}),
    overall: z.number().min(0).max(1),
  }),
  alternatives: z.array(z.object({ tag: z.string(), probability: z.number().min(0).max(1) })).default([]),
  modelVersion: z.string().optional(),
});
export type BriefInterpretation = z.infer<typeof BriefInterpretationSchema>;

/** Confidence at or below which an entity is a suggestion rather than something the brief mentioned. */
export const SUGGESTED_ENTITY_CONFIDENCE = 0.45;
