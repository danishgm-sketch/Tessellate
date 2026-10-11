import { z } from 'zod';
import { type ProjectManifest } from '@tessellate/schemas';
import { auditProjectManifest } from '../audit/audit-engine.js';
import { type AIProviderConfig } from './adapters/types.js';
import { getProviderAdapter } from './adapters/index.js';

export const AICritiqueSchema = z.object({
  holisticAssessment: z
    .string()
    .min(1)
    .describe('Editorial, perceptive narrative on overall system coherence and identity'),
  emotionalResonance: z
    .string()
    .min(1)
    .describe('How the interface atmosphere connects with user sophistication and trust expectations'),
  visualHierarchyObservations: z
    .string()
    .min(1)
    .describe('Subtle observations on eye-flow, focal anchors, and component balance'),
  typographicAndMotionNotes: z
    .string()
    .min(1)
    .describe('Critique on typeface pairing, scale rhythm, easing, and cadence'),
  creativeSuggestions: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe('Targeted, inspiring design enhancements for the human designer'),
});
export type AICritique = z.infer<typeof AICritiqueSchema>;

export interface CritiqueOptions {
  providerConfig?: AIProviderConfig;
  fallbackToDeterministic?: boolean;
}

/**
 * Generates an editorial, subjective design critique.
 * HARD SEPARATION CONTRACT:
 * AI Critique does NOT modify or overwrite the deterministic 100-point audit scores.
 * The 100-point score remains strictly mathematically derived from audit-engine.
 */
export async function generateAICritique(
  manifest: ProjectManifest,
  options: CritiqueOptions = {}
): Promise<AICritique> {
  const { providerConfig, fallbackToDeterministic = true } = options;

  if (!providerConfig || !providerConfig.apiKey.trim()) {
    return generateDeterministicCritique(manifest);
  }

  try {
    const adapter = getProviderAdapter(providerConfig.id);
    const auditSummary = auditProjectManifest(manifest);

    const systemPrompt = [
      'You are Tessellate Editorial Design Critic.',
      'Provide a thoughtful, nuanced, subjective design critique of the interface system.',
      'Maintain an editorial, respectful, expert tone. Avoid generic buzzwords.',
      'NOTE: Do NOT recalculate or contradict the mathematical audit score. Offer qualitative and artistic observations.',
    ].join('\n\n');

    const prompt = [
      `Project Name: ${manifest.name}`,
      `Primary Archetype: ${manifest.productModel.productArchetypes[0]?.tag ?? 'saas'}`,
      `Audience: ${manifest.productModel.primaryAudience}`,
      `Screens: ${manifest.screens.map((s) => s.name).join(', ')}`,
      `Mathematical Audit Score: ${auditSummary.total}/100`,
      `Design DNA Summary: Contrast ${manifest.designDNA.contrast}, Curvature ${manifest.designDNA.curvature}, Motion ${manifest.designDNA.motion}, Density ${manifest.designDNA.density}`,
    ].join('\n');

    const result = await adapter.structuredGenerate(providerConfig, {
      schemaName: 'AICritique',
      schemaDescription: 'Subjective qualitative design critique and creative suggestions',
      schema: AICritiqueSchema,
      systemPrompt,
      prompt,
      temperature: 0.3,
    });

    return result.data;
  } catch (err) {
    if (fallbackToDeterministic) {
      return generateDeterministicCritique(manifest);
    }
    throw err;
  }
}

function generateDeterministicCritique(manifest: ProjectManifest): AICritique {
  const audit = auditProjectManifest(manifest);
  const archetype = manifest.productModel.productArchetypes[0]?.tag ?? 'system';
  const dna = manifest.designDNA;

  const densityDesc = dna.density > 60 ? 'dense, data-rich' : dna.density < 40 ? 'spacious, breathable' : 'balanced';
  const curvatureDesc = dna.curvature === 0 ? 'sharp, geometric precision' : dna.curvature > 80 ? 'pill-shaped, friendly curves' : 'subtle, disciplined rounding';

  return {
    holisticAssessment: `The ${manifest.name} system exhibits a ${densityDesc} posture tailored for ${archetype}. Its structural rhythm maintains clarity with an overall audit health of ${audit.total}/100.`,
    emotionalResonance: `The visual atmosphere conveys dependable stability suited for ${manifest.productModel.primaryAudience}, balancing functional utility against cognitive load.`,
    visualHierarchyObservations: `Component hierarchy is anchored by clear screen headers and landmark containers, utilizing ${curvatureDesc} to guide ocular scanning.`,
    typographicAndMotionNotes: `Typography scale and cadence reflect a disciplined ${dna.professionalism > 70 ? 'institutional' : 'expressive'} tone, with motion configured to ${dna.motion < 30 ? 'prioritize accessibility and calm clarity' : 'add engaging tactile feedback'}.`,
    creativeSuggestions: [
      audit.total < 90
        ? 'Address the top issues surfaced by the deterministic audit to maximize cross-screen compliance.'
        : 'Experiment with contrasting subtle surface elevations to distinguish secondary interactive panels.',
      'Consider locking primary landmark sections to maintain brand anchors during rapid recomposition.',
    ],
  };
}
