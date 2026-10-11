import {
  type AIProviderConfig,
  type AIProviderId,
  sanitizeApiKey,
} from './adapters/types.js';

export interface MaskedProviderInfo {
  id: AIProviderId;
  maskedKey: string;
  model?: string;
  baseUrl?: string;
  useProxy?: boolean;
}

/**
 * Ephemeral In-Memory Credential Store.
 * HARD ARCHITECTURAL CONTRACT:
 * - Credentials are kept strictly in ephemeral process memory.
 * - NEVER persisted to IndexedDB, localStorage, sessionStorage, cookies, D1, R2, or remote servers.
 * - Disconnect completely zeros out keys from memory.
 * - All loggable representations are masked.
 */
class MemoryCredentialStore {
  private credentials = new Map<AIProviderId, AIProviderConfig>();
  private activeProvider: AIProviderId | null = null;

  /**
   * Explanatory text for user interfaces regarding security policy.
   */
  public readonly storagePolicyNotice =
    'Your API key is held exclusively in ephemeral browser memory for the active session. It is never persisted to disk, IndexedDB, remote databases, or error telemetry, and can be cleared instantly via Disconnect.';

  public setCredential(
    id: AIProviderId,
    config: {
      apiKey: string;
      model?: string;
      baseUrl?: string;
      useProxy?: boolean;
      proxyUrl?: string;
    }
  ): void {
    const trimmedKey = config.apiKey.trim();
    if (!trimmedKey) {
      this.credentials.delete(id);
      if (this.activeProvider === id) {
        this.activeProvider = null;
      }
      return;
    }

    this.credentials.set(id, {
      id,
      apiKey: trimmedKey,
      model: config.model,
      baseUrl: config.baseUrl,
      useProxy: config.useProxy,
      proxyUrl: config.proxyUrl,
    });

    if (!this.activeProvider) {
      this.activeProvider = id;
    }
  }

  public getCredential(id: AIProviderId): AIProviderConfig | undefined {
    return this.credentials.get(id);
  }

  public getActiveCredential(): AIProviderConfig | null {
    if (!this.activeProvider) return null;
    return this.credentials.get(this.activeProvider) ?? null;
  }

  public setActiveProvider(id: AIProviderId | null): void {
    if (id && !this.credentials.has(id)) {
      throw new Error(`Cannot set active provider to "${id}": No credential configured.`);
    }
    this.activeProvider = id;
  }

  public getActiveProviderId(): AIProviderId | null {
    return this.activeProvider;
  }

  public hasCredential(id: AIProviderId): boolean {
    return this.credentials.has(id);
  }

  public hasActiveCredential(): boolean {
    return this.activeProvider !== null && this.credentials.has(this.activeProvider);
  }

  public listConfiguredProviders(): MaskedProviderInfo[] {
    const list: MaskedProviderInfo[] = [];
    for (const [id, config] of this.credentials.entries()) {
      list.push({
        id,
        maskedKey: this.maskKey(config.apiKey),
        model: config.model,
        baseUrl: config.baseUrl,
        useProxy: config.useProxy,
      });
    }
    return list;
  }

  public disconnect(id?: AIProviderId): void {
    if (id) {
      this.credentials.delete(id);
      if (this.activeProvider === id) {
        // Switch to any remaining configured provider or null
        const remaining = Array.from(this.credentials.keys());
        this.activeProvider = remaining[0] ?? null;
      }
    } else {
      this.clearAll();
    }
  }

  public clearAll(): void {
    this.credentials.clear();
    this.activeProvider = null;
  }

  public maskKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) {
      return '••••••••';
    }
    const prefix = key.slice(0, 4);
    const suffix = key.slice(-4);
    return `${prefix}••••${suffix}`;
  }

  public sanitizeError(err: unknown): Error {
    const activeKey = this.getActiveCredential()?.apiKey;
    const msg = err instanceof Error ? err.message : String(err);
    const cleanMsg = sanitizeApiKey(msg, activeKey);
    const sanitized = new Error(cleanMsg);
    if (err instanceof Error && err.stack) {
      sanitized.stack = sanitizeApiKey(err.stack, activeKey);
    }
    return sanitized;
  }
}

export const credentialStore = new MemoryCredentialStore();
