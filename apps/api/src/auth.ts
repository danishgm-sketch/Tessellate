import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';
import type { Env, AuthenticatedContext } from './types.js';
import type { Context, Next } from 'hono';
import { ConfigurationError, isNonProduction, isTestEnvironment } from './security.js';

/** Development-only signing secret. Never used when ENVIRONMENT is production (or unset). */
const DEV_ONLY_AUTH_SECRET = 'tessellate-local-development-secret-not-for-production'; // audit-allow-secret: dev/test only, gated by isNonProduction()

function resolveAuthSecret(env?: Env): string {
  if (env?.BETTER_AUTH_SECRET) return env.BETTER_AUTH_SECRET;
  if (isNonProduction(env)) return DEV_ONLY_AUTH_SECRET;
  throw new ConfigurationError('BETTER_AUTH_SECRET is not configured.');
}

function githubProvider(env?: Env) {
  if (!env?.GITHUB_CLIENT_ID || !env?.GITHUB_CLIENT_SECRET) return {};
  return { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } };
}

/**
 * Creates a Better Auth instance for Cloudflare D1.
 */
export function createAuth(env?: Env) {
  const secret = resolveAuthSecret(env);
  const baseURL = env?.BETTER_AUTH_URL || 'http://localhost:8787';

  if (env?.DB) {
    const db = drizzle(env.DB, { schema });
    return betterAuth({
      secret,
      baseURL,
      database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema,
      }),
      socialProviders: githubProvider(env),
    });
  }

  if (!isNonProduction(env)) {
    throw new ConfigurationError('D1 database binding (DB) is not configured.');
  }

  // Local development/tests without a D1 binding.
  return betterAuth({
    secret,
    baseURL,
    socialProviders: githubProvider(env),
  });
}

/**
 * Extract active user session from request headers.
 */
export async function getSessionFromRequest(
  req: Request,
  env?: Env
): Promise<AuthenticatedContext | null> {
  // Deterministic test sessions are honoured ONLY when ENVIRONMENT is explicitly 'test'.
  const authHeader = req.headers.get('Authorization');
  if (isTestEnvironment(env) && authHeader?.startsWith('Bearer test-user-')) {
    const userId = authHeader.replace('Bearer ', '');
    return {
      user: {
        id: userId,
        name: 'Test Evaluator',
        email: `${userId}@tessellate.test`,
        image: null,
        role: userId.includes('admin') ? 'admin' : 'user',
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
    const user = sessionRes.user as typeof sessionRes.user & { role?: string | null };
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role ?? 'user',
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
