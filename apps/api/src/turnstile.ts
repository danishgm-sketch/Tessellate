/**
 * Turnstile verification helper for sensitive Cloudflare endpoints.
 * Only enforced when TURNSTILE_SECRET_KEY binding is configured in production.
 */
export async function verifyTurnstileToken(
  secretKey?: string,
  token?: string,
  remoteIp?: string,
  allowUnconfigured = false
): Promise<{ success: true } | { success: false; error: string; status: 403 | 503 }> {
  // Bypass only when the server explicitly identifies itself as local or test.
  if (!secretKey) {
    return allowUnconfigured
      ? { success: true }
      : { success: false, error: 'Turnstile verification is not configured', status: 503 };
  }

  if (!token) {
    return { success: false, error: 'Turnstile verification token required', status: 403 };
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

    if (!response.ok) {
      return { success: false, error: 'Turnstile verification is unavailable', status: 503 };
    }
    const result = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
    if (!result.success) {
      return {
        success: false,
        error: result['error-codes']?.join(', ') ?? 'Verification failed',
        status: 403,
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Turnstile verification is unavailable', status: 503 };
  }
}
