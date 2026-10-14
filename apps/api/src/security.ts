import type { Env, RateLimitBinding } from './types.js';

/** True only when the deployment explicitly opts into a non-production mode. Unset means production. */
export function isNonProduction(env?: Env): boolean {
  return env?.ENVIRONMENT === 'development' || env?.ENVIRONMENT === 'test';
}

export function isTestEnvironment(env?: Env): boolean {
  return env?.ENVIRONMENT === 'test';
}

/** Error thrown when a required production secret or binding is missing. Mapped to a 503 by the error handler. */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/** Cryptographically random URL-safe token. */
export function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let bin = '';
  for (const b of buf) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison for equal-length secrets/hashes. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Rate limiter: uses the Cloudflare Rate Limiting binding when configured, otherwise a
 * fixed-window in-memory limiter (development/test, and a best-effort per-isolate guard).
 */
export class RateLimiter {
  private readonly windows = new Map<string, { start: number; count: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  async allow(key: string, binding?: RateLimitBinding): Promise<boolean> {
    if (binding) {
      const { success } = await binding.limit({ key });
      return success;
    }
    const now = Date.now();
    const w = this.windows.get(key);
    if (!w || now - w.start >= this.windowMs) {
      this.windows.set(key, { start: now, count: 1 });
      if (this.windows.size > 10_000) this.prune(now);
      return true;
    }
    w.count++;
    return w.count <= this.limit;
  }

  reset(): void {
    this.windows.clear();
  }

  private prune(now: number) {
    for (const [k, w] of this.windows) if (now - w.start >= this.windowMs) this.windows.delete(k);
  }
}

/** Client IP as seen by Cloudflare, falling back to a fixed bucket when unavailable (local/test). */
export function clientIp(req: Request): string {
  return req.headers.get('CF-Connecting-IP') ?? req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown';
}
