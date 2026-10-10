import {
  type AICompletionResult,
  type AIProviderAdapter,
  type AIProviderConfig,
  type StructuredRequest,
  AISchemaValidationError,
} from './adapters/types.js';

export interface RepairableResult<T> extends AICompletionResult<T> {
  repaired?: boolean;
  repairAttemptCount: number;
}

/**
 * Executes a structured AI request with exactly one constrained repair attempt
 * if the initial response fails schema validation.
 */
export async function generateWithConstrainedRepair<T>(
  adapter: AIProviderAdapter,
  config: AIProviderConfig,
  request: StructuredRequest<T>,
  fetchFn?: typeof fetch
): Promise<RepairableResult<T>> {
  try {
    const initialResult = await adapter.structuredGenerate(config, request, fetchFn);
    return {
      ...initialResult,
      repaired: false,
      repairAttemptCount: 0,
    };
  } catch (initialErr) {
    if (!(initialErr instanceof AISchemaValidationError)) {
      // Non-schema errors (auth, network, rate limits) should fail immediately
      throw initialErr;
    }

    // Attempt exactly ONE constrained repair
    const issuesSummary = initialErr.issues
      .map((i) => `- Path "${i.path.join('.')}": ${i.message}`)
      .join('\n');

    const repairPrompt = [
      `Your previous JSON response for "${request.schemaName}" failed schema validation.`,
      '',
      'Validation issues found:',
      issuesSummary || 'Invalid or malformed JSON structure.',
      '',
      'Previous output:',
      initialErr.rawText,
      '',
      'Original task instruction:',
      request.prompt,
      '',
      'Please fix the schema errors and return strictly valid JSON matching the schema.',
    ].join('\n');

    const repairRequest: StructuredRequest<T> = {
      ...request,
      prompt: repairPrompt,
      systemPrompt:
        'You are a JSON schema repair agent. Correct all validation issues and output strictly compliant JSON.',
      temperature: 0.0, // Maximum determinism for repair
    };

    try {
      const repairedResult = await adapter.structuredGenerate(config, repairRequest, fetchFn);
      return {
        ...repairedResult,
        repaired: true,
        repairAttemptCount: 1,
      };
    } catch (repairErr) {
      // If the constrained repair also failed, fail safely with actionable error
      if (repairErr instanceof AISchemaValidationError) {
        throw new AISchemaValidationError(
          `Structured output failed validation and 1 repair attempt was unsuccessful: ${repairErr.message}`,
          adapter.id,
          repairErr.rawText,
          repairErr.issues,
          config.apiKey
        );
      }
      throw repairErr;
    }
  }
}
