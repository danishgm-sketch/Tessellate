import { Hono } from 'hono';
import { createAuth, getAuthConfigurationError } from '../auth.js';
import type { Env } from '../types.js';
import { enforceApiRateLimit, publicClientRateLimitKey } from '../rate-limit.js';

export const authRoute = new Hono<{ Bindings: Env }>();

// Forward all Better Auth endpoints (/api/auth/*)
authRoute.all('/*', async (c) => {
  const rateLimitResponse = await enforceApiRateLimit(
    c.env,
    'API_AUTH_LIMITER',
    publicClientRateLimitKey(c.env, c.req.raw)
  );
  if (rateLimitResponse) return rateLimitResponse;

  if (getAuthConfigurationError(c.env)) {
    return c.json(
      {
        error: 'AuthenticationUnavailable',
        message: 'GitHub sign-in is not configured for this environment.',
      },
      503
    );
  }
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
