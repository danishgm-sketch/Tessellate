import { z } from 'zod';

export type AIProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface AIProviderConfig {
  id: AIProviderId;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  useProxy?: boolean;
  proxyUrl?: string;
}

export interface StructuredRequest<T> {
  prompt: string;
  systemPrompt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, z.ZodTypeDef, any>;
  schemaName: string;
  schemaDescription?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResult<T> {
  data: T;
  rawText: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProviderAdapter {
  readonly id: AIProviderId;
  readonly defaultModel: string;
  validateCredential(
    apiKey: string,
    baseUrl?: string,
    fetchFn?: typeof fetch
  ): Promise<{ valid: boolean; error?: string }>;
  structuredGenerate<T>(
    config: AIProviderConfig,
    request: StructuredRequest<T>,
    fetchFn?: typeof fetch
  ): Promise<AICompletionResult<T>>;
}

/**
 * Sanitizes any string to remove possible API key occurrences.
 */
export function sanitizeApiKey(text: string, apiKey?: string): string {
  if (!text) return text;
  let result = text;
  if (apiKey && apiKey.length >= 4) {
    result = result.replaceAll(apiKey, '[REDACTED_KEY]');
  }
  // Generic pattern for keys: sk-..., ant-..., AIza...
  result = result.replace(/sk-[a-zA-Z0-9_-]{12,}/g, '[REDACTED_KEY]');
  result = result.replace(/AIza[a-zA-Z0-9_-]{20,}/g, '[REDACTED_KEY]');
  result = result.replace(/ant-api-[a-zA-Z0-9_-]{12,}/g, '[REDACTED_KEY]');
  return result;
}

export class AIError extends Error {
  public readonly providerId: AIProviderId;
  public readonly statusCode?: number;

  constructor(message: string, providerId: AIProviderId, statusCode?: number, rawKey?: string) {
    super(sanitizeApiKey(message, rawKey));
    this.name = 'AIError';
    this.providerId = providerId;
    this.statusCode = statusCode;
  }
}

export class AIAuthenticationError extends AIError {
  constructor(message: string, providerId: AIProviderId, statusCode = 401, rawKey?: string) {
    super(message, providerId, statusCode, rawKey);
    this.name = 'AIAuthenticationError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(message: string, providerId: AIProviderId, statusCode = 429, rawKey?: string) {
    super(message, providerId, statusCode, rawKey);
    this.name = 'AIRateLimitError';
  }
}

export class AISchemaValidationError extends AIError {
  public readonly rawText: string;
  public readonly issues: z.ZodIssue[];

  constructor(
    message: string,
    providerId: AIProviderId,
    rawText: string,
    issues: z.ZodIssue[],
    rawKey?: string
  ) {
    super(message, providerId, undefined, rawKey);
    this.name = 'AISchemaValidationError';
    this.rawText = sanitizeApiKey(rawText, rawKey);
    this.issues = issues;
  }
}
