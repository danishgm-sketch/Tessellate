import { Hono } from 'hono';
import { createAuth } from '../auth.js';
import { RateLimiter, clientIp } from '../security.js';
import type { Env } from '../types.js';

export const authRoute = new Hono<{ Bindings: Env }>();

/** Credential endpoints get a per-IP limit in addition to Turnstile (D-037). */
const CREDENTIAL_PATHS = ['/sign-in/email', '/sign-up/email', '/request-password-reset', '/reset-password', '/change-password'];
export const authLimiter = new RateLimiter(20, 60_000);

authRoute.use('*', async (c, next) => {
  if (c.req.method === 'POST' && CREDENTIAL_PATHS.some((p) => new URL(c.req.url).pathname.endsWith(p))) {
    if (!(await authLimiter.allow(`auth:${clientIp(c.req.raw)}`, c.env?.RATE_LIMIT_AUTH))) {
      c.header('Retry-After', '60');
      return c.json({ code: 'RATE_LIMITED', message: 'Too many attempts. Please wait a minute and try again.' }, 429);
    }
  }
  return next();
});

// Forward all Better Auth endpoints (/api/auth/*)
authRoute.all('/*', async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
