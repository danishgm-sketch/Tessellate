import { z } from 'zod';
import { ProjectMutationSchema } from './mutations.js';

export const AuditSeveritySchema = z.enum(['critical', 'warning', 'info']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

export const AuditCategorySchema = z.enum([
  'cohesion',
  'accessibility',
  'performance',
  'responsive',
  'hierarchy',
  'densityConsistency',
  'motionConsistency',
  'designSystemCompliance',
  'interactionConsistency',
]);
export type AuditCategory = z.infer<typeof AuditCategorySchema>;

export const AuditSuggestedFixSchema = z.object({
  description: z.string().min(1),
  mutations: z.array(ProjectMutationSchema).optional(),
});
export type AuditSuggestedFix = z.infer<typeof AuditSuggestedFixSchema>;

export const AuditIssueSchema = z.object({
  id: z.string().min(1),
  category: AuditCategorySchema,
  severity: AuditSeveritySchema,
  message: z.string().min(1),
  nodeIds: z.array(z.string()).default([]),
  suggestedFix: AuditSuggestedFixSchema.optional(),
});
export type AuditIssue = z.infer<typeof AuditIssueSchema>;

export const AuditCategoryScoresSchema = z.object({
  cohesion: z.number().min(0).max(20),
  accessibility: z.number().min(0).max(20),
  performance: z.number().min(0).max(15),
  responsive: z.number().min(0).max(15),
  hierarchy: z.number().min(0).max(10),
  densityConsistency: z.number().min(0).max(5),
  motionConsistency: z.number().min(0).max(5),
  designSystemCompliance: z.number().min(0).max(5),
  interactionConsistency: z.number().min(0).max(5),
});
export type AuditCategoryScores = z.infer<typeof AuditCategoryScoresSchema>;

export const AuditResultSchema = z.object({
  total: z.number().min(0).max(100),
  scores: AuditCategoryScoresSchema,
  issues: z.array(AuditIssueSchema).default([]),
});
export type AuditResult = z.infer<typeof AuditResultSchema>;
