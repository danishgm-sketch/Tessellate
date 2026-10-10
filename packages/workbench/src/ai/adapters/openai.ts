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

export class OpenAIAdapter implements AIProviderAdapter {
  public readonly id = 'openai' as const;
  public readonly defaultModel = 'gpt-4o-mini';

  public async validateCredential(
    apiKey: string,
    baseUrl = 'https://api.openai.com',
    fetchFn: typeof fetch = fetch
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        return { valid: false, error: 'API key is required.' };
      }
      const res = await fetchFn(`${baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${trimmedKey}`,
        },
      });

      if (res.status === 401) {
        return { valid: false, error: 'Authentication failed: Invalid OpenAI API key.' };
      }
      if (!res.ok) {
        return { valid: false, error: `OpenAI returned status ${res.status}.` };
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
      throw new AIAuthenticationError('Missing OpenAI API key.', this.id, 401);
    }

    const endpoint = config.useProxy
      ? `${config.proxyUrl ?? '/api/ai/openai'}/v1/chat/completions`
      : `${config.baseUrl ?? 'https://api.openai.com'}/v1/chat/completions`;

    const model = config.model || this.defaultModel;
    const jsonSchema = toStandardJsonSchema(request.schema, request.schemaName);

    const messages = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    const payload = {
      model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: request.schemaName,
          description: request.schemaDescription,
          schema: jsonSchema,
          strict: true,
        },
      },
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 4096,
    };

    let response: Response;
    try {
      response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawKey}`,
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
        throw new AIAuthenticationError('Invalid OpenAI API key.', this.id, 401, rawKey);
      }
      if (response.status === 429) {
        throw new AIRateLimitError('OpenAI rate limit exceeded.', this.id, 429, rawKey);
      }
      throw new AIError(
        `OpenAI error (${response.status}): ${errText || response.statusText}`,
        this.id,
        response.status,
        rawKey
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    const rawText = json.choices?.[0]?.message?.content ?? '';
    if (!rawText.trim()) {
      throw new AISchemaValidationError(
        'Empty response content received from OpenAI.',
        this.id,
        rawText,
        [],
        rawKey
      );
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
