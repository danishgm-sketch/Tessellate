import type { Env } from './types.js';
import { isNonProduction } from './security.js';

/** Request header carrying the Turnstile widget token. */
export const TURNSTILE_HEADER = 'cf-turnstile-response';

/**
 * Verifies a Cloudflare Turnstile token.
 *
 * Fails closed: in production a missing TURNSTILE_SECRET_KEY rejects the request instead of
 * silently skipping verification. Only explicit development/test environments may bypass it.
 */
export async function verifyTurnstileToken(
  env: Env | undefined,
  token?: string | null,
  remoteIp?: string,
): Promise<{ success: boolean; error?: string }> {
  const secretKey = env?.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return isNonProduction(env)
      ? { success: true }
      : { success: false, error: 'Bot protection is not configured on this deployment.' };
  }

  if (!token) {
    return { success: false, error: 'Turnstile verification token required' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    const result = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!result.success) {
      return { success: false, error: result['error-codes']?.join(', ') ?? 'Verification failed' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
