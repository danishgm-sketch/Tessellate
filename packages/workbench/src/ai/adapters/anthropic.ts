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

export class AnthropicAdapter implements AIProviderAdapter {
  public readonly id = 'anthropic' as const;
  public readonly defaultModel = 'claude-3-5-haiku-20241022';

  public async validateCredential(
    apiKey: string,
    baseUrl = 'https://api.anthropic.com',
    fetchFn: typeof fetch = fetch
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        return { valid: false, error: 'API key is required.' };
      }
      const res = await fetchFn(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': trimmedKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      });

      if (res.status === 401) {
        return { valid: false, error: 'Authentication failed: Invalid Anthropic API key.' };
      }
      if (!res.ok && res.status !== 400) {
        return { valid: false, error: `Anthropic returned status ${res.status}.` };
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
      throw new AIAuthenticationError('Missing Anthropic API key.', this.id, 401);
    }

    const endpoint = config.useProxy
      ? `${config.proxyUrl ?? '/api/ai/anthropic'}/v1/messages`
      : `${config.baseUrl ?? 'https://api.anthropic.com'}/v1/messages`;

    const model = config.model || this.defaultModel;
    const jsonSchema = toStandardJsonSchema(request.schema, request.schemaName);

    const payload = {
      model,
      system: request.systemPrompt,
      max_tokens: request.maxTokens ?? 4096,
      messages: [{ role: 'user', content: request.prompt }],
      tools: [
        {
          name: request.schemaName,
          description: request.schemaDescription || 'Structured response',
          input_schema: jsonSchema,
        },
      ],
      tool_choice: {
        type: 'tool',
        name: request.schemaName,
      },
    };

    let response: Response;
    try {
      response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': rawKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
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
        throw new AIAuthenticationError('Invalid Anthropic API key.', this.id, 401, rawKey);
      }
      if (response.status === 429) {
        throw new AIRateLimitError('Anthropic rate limit exceeded.', this.id, 429, rawKey);
      }
      throw new AIError(
        `Anthropic error (${response.status}): ${errText || response.statusText}`,
        this.id,
        response.status,
        rawKey
      );
    }

    const json = (await response.json()) as {
      content?: Array<{ type: string; name?: string; input?: unknown }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const toolUseBlock = json.content?.find(
      (b) => b.type === 'tool_use' && b.name === request.schemaName
    );

    if (!toolUseBlock || toolUseBlock.input === undefined) {
      throw new AISchemaValidationError(
        `Anthropic did not invoke expected tool "${request.schemaName}".`,
        this.id,
        JSON.stringify(json.content ?? []),
        [],
        rawKey
      );
    }

    const validated = request.schema.safeParse(toolUseBlock.input);
    if (!validated.success) {
      throw new AISchemaValidationError(
        'Structured tool output did not conform to schema.',
        this.id,
        JSON.stringify(toolUseBlock.input),
        validated.error.issues,
        rawKey
      );
    }

    return {
      data: validated.data,
      rawText: JSON.stringify(toolUseBlock.input),
      usage: {
        promptTokens: json.usage?.input_tokens,
        completionTokens: json.usage?.output_tokens,
        totalTokens: (json.usage?.input_tokens ?? 0) + (json.usage?.output_tokens ?? 0),
      },
    };
  }
}
