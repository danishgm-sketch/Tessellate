// WebCrypto verification avoids comparing secret strings in request handlers.
export async function verifySecret(candidate: string | undefined, expected: string | undefined): Promise<boolean> {
  if (!candidate || !expected || expected.length < 32 || candidate.length > 256) return false;
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(expected), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  const signature = await crypto.subtle.sign('HMAC', key, bytes.encode(expected));
  return crypto.subtle.verify('HMAC', key, signature, bytes.encode(candidate));
}
