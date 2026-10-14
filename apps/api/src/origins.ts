import type { Env } from './types.js';
import { isNonProduction } from './security.js';

export const PRODUCTION_ORIGINS = [
  'https://tessellate.design',
  'https://www.tessellate.design',
  'https://preview.tessellate.design',
];

const DEVELOPMENT_ORIGINS = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/** Allowed browser origins: production hosts, configured extras, and localhost only outside production. */
export function allowedOrigins(env?: Env): string[] {
  const extra = (env?.EXTRA_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...PRODUCTION_ORIGINS, ...extra, ...(isNonProduction(env) ? DEVELOPMENT_ORIGINS : [])];
}
