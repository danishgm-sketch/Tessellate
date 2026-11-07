import type { Env } from './types.js';

export type ApiRateLimitBinding =
  | 'API_PUBLIC_WRITE_LIMITER'
  | 'API_USER_WRITE_LIMITER'
  | 'API_AI_LIMITER'
  | 'API_AUTH_LIMITER'
  | 'API_CLIENT_LIMITER';

export async function enforceApiRateLimit(
  env: Env | undefined,
  bindingName: ApiRateLimitBinding,
  key: string
): Promise<Response | null> {
  const binding = env?.[bindingName];
  if (!binding) {
    if (env?.RUNTIME_ENVIRONMENT !== 'production') return null;
    return Response.json({
      error: 'RateLimitUnavailable',
      message: 'This operation is temporarily unavailable because abuse protection is not configured.',
    }, { status: 503 });
  }

  try {
    const result = await binding.limit({ key });
    if (result.success) return null;
    return Response.json({
      error: 'RateLimited',
      message: 'Too many requests. Try again in a minute.',
    }, { status: 429, headers: { 'Retry-After': '60' } });
  } catch {
    return Response.json({
      error: 'RateLimitUnavailable',
      message: 'This operation is temporarily unavailable because abuse protection could not be checked.',
    }, { status: 503 });
  }
}

export function publicClientRateLimitKey(env: Env | undefined, request: Request): string {
  // The gateway-authenticated adapter supplies this stable pseudonymous client key.
  // Direct API traffic uses Cloudflare's edge-assigned source address.
  const gatewayClient = env?.TESSELLATE_GATEWAY_SECRET
    ? request.headers.get('X-Tessellate-Client')?.trim()
    : undefined;
  const client = gatewayClient || request.headers.get('CF-Connecting-IP') || 'local-unknown';
  return `public:${client}`;
}

export function userWriteRateLimitKey(userId: string): string {
  return `user:${userId}`;
}

export async function aiRateLimitKey(env: Env | undefined, request: Request): Promise<string> {
  const credential = request.headers.get('Authorization')
    ?? request.headers.get('X-Api-Key')
    ?? request.headers.get('X-Goog-Api-Key');
  if (!credential) return publicClientRateLimitKey(env, request);

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(credential));
  const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return `credential:${fingerprint}`;
}
