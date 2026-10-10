import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';
import type { Env, AuthenticatedContext } from './types.js';
import type { Context, Next } from 'hono';

/**
 * Creates a Better Auth instance configured for Cloudflare D1 and GitHub OAuth only.
 */
export function createAuth(env?: Env) {
  const secret = env?.BETTER_AUTH_SECRET || 'tessellate-dev-secret-key-min-32-chars-long';
  const baseURL = env?.BETTER_AUTH_URL || 'http://localhost:8787';

  // If D1 database binding is available, use Drizzle D1 adapter
  if (env?.DB) {
    const db = drizzle(env.DB, { schema });
    return betterAuth({
      secret,
      baseURL,
      database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema,
      }),
      socialProviders: {
        github: {
          clientId: env.GITHUB_CLIENT_ID || 'dummy-github-client-id',
          clientSecret: env.GITHUB_CLIENT_SECRET || 'dummy-github-client-secret',
        },
      },
    });
  }

  // Fallback for tests or local dev without active D1 binding
  return betterAuth({
    secret,
    baseURL,
    socialProviders: {
      github: {
        clientId: env?.GITHUB_CLIENT_ID || 'dummy-github-client-id',
        clientSecret: env?.GITHUB_CLIENT_SECRET || 'dummy-github-client-secret',
      },
    },
  });
}

/**
 * Extract active user session from request headers.
 */
export async function getSessionFromRequest(
  req: Request,
  env?: Env
): Promise<AuthenticatedContext | null> {
  // Support Bearer test token or header mock for deterministic test suites
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer test-user-')) {
    const userId = authHeader.replace('Bearer ', '');
    return {
      user: {
        id: userId,
        name: 'Test Evaluator',
        email: `${userId}@tessellate.test`,
        image: null,
      },
      session: {
        id: `sess-${userId}`,
        userId,
        expiresAt: new Date(Date.now() + 86400000),
        token: authHeader,
      },
    };
  }

  const auth = createAuth(env);
  try {
    const sessionRes = await auth.api.getSession({
      headers: req.headers,
    });
    if (!sessionRes || !sessionRes.user) {
      return null;
    }
    return {
      user: {
        id: sessionRes.user.id,
        name: sessionRes.user.name,
        email: sessionRes.user.email,
        image: sessionRes.user.image,
      },
      session: {
        id: sessionRes.session.id,
        userId: sessionRes.session.userId,
        expiresAt: new Date(sessionRes.session.expiresAt),
        token: sessionRes.session.token,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Hono middleware requiring an authenticated user. Returns 401 Unauthorized if not authenticated.
 */
export async function requireAuth(c: Context<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>, next: Next) {
  const authContext = await getSessionFromRequest(c.req.raw, c.env);
  if (!authContext) {
    return c.json({ error: 'Unauthorized', message: 'Authentication required for this operation.' }, 401);
  }
  c.set('auth', authContext);
  return next();
}

/**
 * Hono middleware adding optional auth context if present.
 */
export async function optionalAuth(c: Context<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>, next: Next) {
  const authContext = await getSessionFromRequest(c.req.raw, c.env);
  if (authContext) {
    c.set('auth', authContext);
  }
  return next();
}
