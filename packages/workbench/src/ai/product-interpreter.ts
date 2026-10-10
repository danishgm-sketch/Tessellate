import {
  type ProductModel,
  ProductModelSchema,
} from '@tessellate/schemas';
import {
  type InterpretedProduct,
  type ProductBriefInput,
  interpretProductBrief,
} from '@tessellate/composer';
import { type AIProviderConfig } from './adapters/types.js';
import { getProviderAdapter } from './adapters/index.js';

export interface AIInterpretationOptions {
  providerConfig?: AIProviderConfig;
  fallbackToDeterministic?: boolean;
}

/**
 * Interprets a natural language product brief into a validated ProductModel.
 * When a provider is configured, leverages LLM structured generation to extract
 * nuanced entities, workflows, and JTBD.
 * When AI is not configured or upstream fails, seamlessly falls back to the
 * deterministic engine without corrupting state.
 */
export async function interpretProductWithAI(
  input: ProductBriefInput,
  options: AIInterpretationOptions = {}
): Promise<InterpretedProduct> {
  const { providerConfig, fallbackToDeterministic = true } = options;

  if (!providerConfig || !providerConfig.apiKey.trim()) {
    // Zero-AI deterministic baseline
    return interpretProductBrief(input);
  }

  try {
    const adapter = getProviderAdapter(providerConfig.id);

    const systemPrompt = [
      'You are Tessellate Interface Intelligence.',
      'Analyze the product brief and extract a rigorous, schema-compliant ProductModel.',
      'Identify archetypes, user sophistication, JTBD, domain entities, workflows, complexity metrics, and likely screens.',
    ].join('\n\n');

    const prompt = [
      `Product Description: ${input.description}`,
      input.audience ? `Target Audience: ${input.audience}` : '',
      input.objective ? `Primary Objective: ${input.objective}` : '',
      input.feel ? `Design Feel: ${input.feel}` : '',
      input.accessibilityFloor ? `Accessibility Floor: ${input.accessibilityFloor}` : '',
      input.performanceCeiling ? `Performance Ceiling: ${input.performanceCeiling}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const result = await adapter.structuredGenerate<ProductModel>(providerConfig, {
      schemaName: 'ProductModel',
      schemaDescription: 'Structured ProductModel interface definition',
      schema: ProductModelSchema,
      systemPrompt,
      prompt,
      temperature: 0.1,
    });

    return {
      productModel: result.data,
      inferredAssumptions: [
        `Interpreted via AI provider "${providerConfig.id}" (${providerConfig.model || adapter.defaultModel}).`,
        `Identified ${result.data.jobsToBeDone.length} core JTBD and ${result.data.entities.length} domain entities.`,
      ],
    };
  } catch (err) {
    if (fallbackToDeterministic) {
      const fallback = interpretProductBrief(input);
      const errMsg = err instanceof Error ? err.message : String(err);
      fallback.inferredAssumptions.unshift(
        `AI interpretation failed (${errMsg}). Safely recovered using deterministic composer.`
      );
      return fallback;
    }
    throw err;
  }
}
