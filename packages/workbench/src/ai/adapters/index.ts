import {
  type AIProviderAdapter,
  type AIProviderId,
} from './types.js';
import { OpenAIAdapter } from './openai.js';
import { AnthropicAdapter } from './anthropic.js';
import { GeminiAdapter } from './gemini.js';
import { OpenRouterAdapter } from './openrouter.js';

export * from './types.js';
export * from './openai.js';
export * from './anthropic.js';
export * from './gemini.js';
export * from './openrouter.js';

const adapters: Record<AIProviderId, AIProviderAdapter> = {
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
  gemini: new GeminiAdapter(),
  openrouter: new OpenRouterAdapter(),
};

export function getProviderAdapter(id: AIProviderId): AIProviderAdapter {
  const adapter = adapters[id];
  if (!adapter) {
    throw new Error(`Unsupported AI provider: "${id}"`);
  }
  return adapter;
}

export function getAllProviderAdapters(): AIProviderAdapter[] {
  return Object.values(adapters);
}
