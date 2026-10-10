/**
 * Opaque ID generator with optional semantic prefix.
 */
export function createId(prefix?: string): string {
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return prefix ? `${prefix}_${random}` : random;
}
