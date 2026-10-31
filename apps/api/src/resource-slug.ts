import { z } from 'zod';

export const resourceSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/);

export function isCanonicalResourceSlug(value: unknown): value is string {
  const parsed = resourceSlugSchema.safeParse(value);
  return parsed.success && parsed.data === value;
}
