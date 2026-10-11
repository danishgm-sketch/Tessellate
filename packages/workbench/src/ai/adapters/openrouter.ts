import { toStandardJsonSchema } from '@tessellate/schemas';
import {
  type AICompletionResult,
  type AIProviderAdapter,
  type AIProviderConfig,
  type StructuredRequest,
  AIAuthenticationError,
  AIError,
  AIRateLimitError,
  AISchemaValidationError,
  sanitizeApiKey,
} from './types.js';

export class OpenRouterAdapter implements AIProviderAdapter {
  public readonly id = 'openrouter' as const;
  public readonly defaultModel = 'anthropic/claude-3.5-haiku';

  public async validateCredential(
    apiKey: string,
    baseUrl = 'https://openrouter.ai/api',
    fetchFn: typeof fetch = fetch
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        return { valid: false, error: 'API key is required.' };
      }
      const res = await fetchFn(`${baseUrl}/v1/auth/key`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${trimmedKey}`,
        },
      });

      if (res.status === 401) {
        return { valid: false, error: 'Authentication failed: Invalid OpenRouter API key.' };
      }
      if (!res.ok && res.status !== 404) {
        // Fallback for custom endpoints that might not have auth/key: check models
        const modelRes = await fetchFn(`${baseUrl}/v1/models`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${trimmedKey}` },
        });
        if (modelRes.status === 401) {
          return { valid: false, error: 'Authentication failed: Invalid API key.' };
        }
        if (!modelRes.ok) {
          return { valid: false, error: `Endpoint returned status ${modelRes.status}.` };
        }
      }
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: sanitizeApiKey(err instanceof Error ? err.message : String(err), apiKey),
      };
    }
  }

  public async structuredGenerate<T>(
    config: AIProviderConfig,
    request: StructuredRequest<T>,
    fetchFn: typeof fetch = fetch
  ): Promise<AICompletionResult<T>> {
    const rawKey = config.apiKey.trim();
    if (!rawKey) {
      throw new AIAuthenticationError('Missing OpenRouter API key.', this.id, 401);
    }

    const endpoint = config.useProxy
      ? `${config.proxyUrl ?? '/api/ai/openrouter'}/v1/chat/completions`
      : `${config.baseUrl ?? 'https://openrouter.ai/api'}/v1/chat/completions`;

    const model = config.model || this.defaultModel;
    const jsonSchema = toStandardJsonSchema(request.schema, request.schemaName);

    const systemPrompt = [
      request.systemPrompt || 'You are Tessellate interface assistant.',
      `You MUST respond with valid JSON strictly conforming to the following JSON schema named "${request.schemaName}":`,
      JSON.stringify(jsonSchema),
      'Output ONLY the JSON object, without any markdown formatting or commentary.',
    ].join('\n\n');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: request.prompt },
    ];

    const payload = {
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 4096,
    };

    let response: Response;
    try {
      response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawKey}`,
          'HTTP-Referer': 'https://tessellate.dev',
          'X-Title': 'Tessellate Interface Intelligence',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (netErr) {
      throw new AIError(
        netErr instanceof Error ? netErr.message : 'Network request failed',
        this.id,
        undefined,
        rawKey
      );
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      if (response.status === 401) {
        throw new AIAuthenticationError('Invalid OpenRouter API key.', this.id, 401, rawKey);
      }
      if (response.status === 429) {
        throw new AIRateLimitError('OpenRouter rate limit exceeded.', this.id, 429, rawKey);
      }
      throw new AIError(
        `OpenRouter error (${response.status}): ${errText || response.statusText}`,
        this.id,
        response.status,
        rawKey
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    let rawText = json.choices?.[0]?.message?.content ?? '';
    if (!rawText.trim()) {
      throw new AISchemaValidationError(
        'Empty response content received from OpenRouter.',
        this.id,
        rawText,
        [],
        rawKey
      );
    }

    // Strip potential markdown code fences: ```json ... ```
    if (rawText.includes('```')) {
      const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        rawText = match[1].trim();
      }
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      throw new AISchemaValidationError(
        `Failed to parse JSON response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
        this.id,
        rawText,
        [],
        rawKey
      );
    }

    const validated = request.schema.safeParse(parsed);
    if (!validated.success) {
      throw new AISchemaValidationError(
        'Structured response did not conform to schema.',
        this.id,
        rawText,
        validated.error.issues,
        rawKey
      );
    }

    return {
      data: validated.data,
      rawText,
      usage: {
        promptTokens: json.usage?.prompt_tokens,
        completionTokens: json.usage?.completion_tokens,
        totalTokens: json.usage?.total_tokens,
      },
    };
  }
}
