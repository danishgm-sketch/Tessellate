import { z } from 'zod';
import { parseFeelDescriptors } from '@tessellate/dna';
import { type AIProviderConfig } from './adapters/types.js';
import { getProviderAdapter } from './adapters/index.js';

export const ArbitraryFeelMappingSchema = z.object({
  recognizedMetaphors: z.array(z.string()).default([]),
  primaryAdjectives: z.array(z.string()).min(1),
  dnaDeltas: z
    .record(z.string(), z.number().int().min(-60).max(60))
    .describe('Numeric dimension deltas from -60 to +60'),
  categoricalSuggestions: z.object({
    geometryFamily: z.enum(['sharp', 'curved', 'pill', 'minimal']).optional(),
    motionPersonality: z.string().optional(),
    typographyPersonality: z.string().optional(),
    surfacePersonality: z.string().optional(),
    contentTone: z.string().optional(),
  }),
  rationale: z.string(),
});
export type ArbitraryFeelMapping = z.infer<typeof ArbitraryFeelMappingSchema>;

export interface FeelMappingOptions {
  providerConfig?: AIProviderConfig;
  fallbackToDeterministic?: boolean;
}

/**
 * Maps arbitrary, metaphorical, or poetic feel descriptions
 * (e.g. "Swiss watch precision crossed with modern fintech", "Dieter Rams minimalism")
 * into validated Design DNA deltas and categorical suggestions.
 */
export async function mapArbitraryFeel(
  feelInput: string,
  options: FeelMappingOptions = {}
): Promise<ArbitraryFeelMapping> {
  const { providerConfig, fallbackToDeterministic = true } = options;
  const trimmed = feelInput.trim();

  if (!providerConfig || !providerConfig.apiKey.trim()) {
    // Deterministic fallback
    return deterministicFeelFallback(trimmed);
  }

  try {
    const adapter = getProviderAdapter(providerConfig.id);

    const systemPrompt = [
      'You are Tessellate Design DNA Feel Analyst.',
      'Map arbitrary, subjective, or poetic visual feel descriptions to precise numeric Design DNA deltas and categorical tokens.',
      'Dimensions include: professionalism, playfulness, visualAmbition, structuralCreativity, dataDensity, curvature, contrast, warmth, technicality, motion, luxury, futurism, editorial, whitespace.',
      'Numeric deltas must be between -60 and +60.',
    ].join('\n\n');

    const result = await adapter.structuredGenerate<ArbitraryFeelMapping>(providerConfig, {
      schemaName: 'ArbitraryFeelMapping',
      schemaDescription: 'Mapped visual feel parameters and design tokens',
      schema: ArbitraryFeelMappingSchema,
      systemPrompt,
      prompt: `Translate this interface feel prompt: "${trimmed}"`,
      temperature: 0.2,
    });

    return result.data;
  } catch (err) {
    if (fallbackToDeterministic) {
      return deterministicFeelFallback(trimmed);
    }
    throw err;
  }
}

function deterministicFeelFallback(input: string): ArbitraryFeelMapping {
  const parsed = parseFeelDescriptors(input);
  const deltas: Record<string, number> = {};

  for (const [k, d] of Object.entries(parsed.accumulatedDeltas)) {
    if (typeof d === 'number') {
      deltas[k] = Math.max(-60, Math.min(60, Math.round(d)));
    }
  }

  const geometry = parsed.categoricalSuggestions['geometryFamily'];
  const validGeometry =
    geometry === 'sharp' || geometry === 'curved' || geometry === 'pill' || geometry === 'minimal'
      ? geometry
      : undefined;

  return {
    recognizedMetaphors: parsed.tokens.map((t) => t.word),
    primaryAdjectives: parsed.recognizedAdjectives.length > 0 ? parsed.recognizedAdjectives : ['balanced'],
    dnaDeltas: deltas,
    categoricalSuggestions: {
      geometryFamily: validGeometry,
      motionPersonality: parsed.categoricalSuggestions['motionPersonality'],
      typographyPersonality: parsed.categoricalSuggestions['typographyPersonality'],
      surfacePersonality: parsed.categoricalSuggestions['surfacePersonality'],
      contentTone: parsed.categoricalSuggestions['contentTone'],
    },
    rationale: `Mapped using deterministic vocabulary (${parsed.tokens.length} token matches).`,
  };
}
