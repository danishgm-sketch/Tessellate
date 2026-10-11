/**
 * Turnstile verification helper for sensitive Cloudflare endpoints.
 * Only enforced when TURNSTILE_SECRET_KEY binding is configured in production.
 */
export async function verifyTurnstileToken(
  secretKey?: string,
  token?: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // If not configured, bypass cleanly (e.g. in test or local dev environments)
  if (!secretKey) {
    return { success: true };
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
