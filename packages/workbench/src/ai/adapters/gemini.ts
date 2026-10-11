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

export class GeminiAdapter implements AIProviderAdapter {
  public readonly id = 'gemini' as const;
  public readonly defaultModel = 'gemini-2.5-flash';

  public async validateCredential(
    apiKey: string,
    baseUrl = 'https://generativelanguage.googleapis.com',
    fetchFn: typeof fetch = fetch
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const trimmedKey = apiKey.trim();
      if (!trimmedKey) {
        return { valid: false, error: 'API key is required.' };
      }
      const res = await fetchFn(
        `${baseUrl}/v1beta/models/${this.defaultModel}?key=${encodeURIComponent(trimmedKey)}`,
        {
          method: 'GET',
        }
      );

      if (res.status === 400 || res.status === 401 || res.status === 403) {
        const text = await res.text().catch(() => '');
        if (text.includes('API_KEY_INVALID') || res.status === 401 || res.status === 403) {
          return { valid: false, error: 'Authentication failed: Invalid Gemini API key.' };
        }
      }
      if (!res.ok) {
        return { valid: false, error: `Gemini returned status ${res.status}.` };
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
      throw new AIAuthenticationError('Missing Gemini API key.', this.id, 401);
    }

    const model = config.model || this.defaultModel;
    const jsonSchema = toStandardJsonSchema(request.schema, request.schemaName);

    const endpoint = config.useProxy
      ? `${config.proxyUrl ?? '/api/ai/gemini'}/v1beta/models/${model}:generateContent`
      : `${config.baseUrl ?? 'https://generativelanguage.googleapis.com'}/v1beta/models/${model}:generateContent`;

    const contents = [{ role: 'user', parts: [{ text: request.prompt }] }];

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 4096,
      },
    };

    if (request.systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: request.systemPrompt }],
      };
    }

    let response: Response;
    try {
      response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          'x-goog-api-key': rawKey,
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
      if (response.status === 401 || response.status === 403 || errText.includes('API_KEY_INVALID')) {
        throw new AIAuthenticationError('Invalid Gemini API key.', this.id, 401, rawKey);
      }
      if (response.status === 429) {
        throw new AIRateLimitError('Gemini rate limit exceeded.', this.id, 429, rawKey);
      }
      throw new AIError(
        `Gemini error (${response.status}): ${errText || response.statusText}`,
        this.id,
        response.status,
        rawKey
      );
    }

    const json = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };

    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    if (!rawText.trim()) {
      throw new AISchemaValidationError(
        'Empty response content received from Gemini.',
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
        promptTokens: json.usageMetadata?.promptTokenCount,
        completionTokens: json.usageMetadata?.candidatesTokenCount,
        totalTokens: json.usageMetadata?.totalTokenCount,
      },
    };
  }
}
