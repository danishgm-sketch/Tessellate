import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';
import type { Env, AuthenticatedContext } from './types.js';
import type { Context, Next } from 'hono';

export class AuthUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthUnavailableError';
  }
}

export function getAuthConfigurationError(env?: Env): string | null {
  if (!env?.DB) return 'D1 database binding is not configured.';
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32) {
    return 'BETTER_AUTH_SECRET must be configured with at least 32 characters.';
  }
  if (!env.BETTER_AUTH_URL) return 'BETTER_AUTH_URL must be configured.';
  try {
    const authUrl = new URL(env.BETTER_AUTH_URL);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(authUrl.hostname);
    if (authUrl.protocol !== 'https:' && !(local && authUrl.protocol === 'http:')) {
      return 'BETTER_AUTH_URL must use HTTPS outside localhost.';
    }
  } catch {
    return 'BETTER_AUTH_URL must be an absolute HTTP or HTTPS URL.';
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return 'GitHub OAuth credentials are not configured.';
  }
  return null;
}

function hasTestAuthSecret(env?: Env): env is Env & { TEST_AUTH_SECRET: string } {
  return Boolean(env?.TEST_AUTH_SECRET && env.TEST_AUTH_SECRET.length >= 32);
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function readSignedTestSession(
  authorization: string,
  secret: string
): Promise<AuthenticatedContext | null> {
  const match = /^Bearer tessellate-test\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(authorization);
  if (!match) return null;
  const [, payloadPart, signaturePart] = match;
  const signature = decodeBase64Url(signaturePart!);
  if (!signature) return null;

  try {
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      new TextEncoder().encode(payloadPart!)
    );
    if (!valid) return null;

    const payloadBytes = decodeBase64Url(payloadPart!);
    if (!payloadBytes) return null;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      userId?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof payload.userId !== 'string' ||
      payload.userId.length === 0 ||
      payload.userId.length > 128 ||
      typeof payload.expiresAt !== 'number' ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      user: {
        id: payload.userId,
        name: 'Test Evaluator',
        email: `${payload.userId}@tessellate.test`,
        image: null,
      },
      session: {
        id: `test-session-${payload.userId}`,
        userId: payload.userId,
        expiresAt: new Date(payload.expiresAt),
      },
    };
  } catch {
    return null;
  }
}

/**
 * Creates a Better Auth instance configured for Cloudflare D1 and GitHub OAuth only.
 */
export function createAuth(env?: Env) {
  const configurationError = getAuthConfigurationError(env);
  if (configurationError) throw new AuthUnavailableError(configurationError);

  const db = drizzle(env!.DB!, { schema });
  return betterAuth({
    secret: env!.BETTER_AUTH_SECRET!,
    baseURL: env!.BETTER_AUTH_URL!,
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
    }),
    socialProviders: {
      github: {
        clientId: env!.GITHUB_CLIENT_ID!,
        clientSecret: env!.GITHUB_CLIENT_SECRET!,
      },
    },
    account: {
      accountLinking: { enabled: false },
    },
    emailAndPassword: { enabled: false },
  });
}

/**
 * Extract active user session from request headers.
 */
export async function getSessionFromRequest(
  req: Request,
  env?: Env
): Promise<AuthenticatedContext | null> {
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer tessellate-test.')) {
    if (!hasTestAuthSecret(env)) return null;
    return readSignedTestSession(authHeader, env.TEST_AUTH_SECRET);
  }

  if (!req.headers.has('Cookie')) return null;

  const configurationError = getAuthConfigurationError(env);
  if (configurationError) throw new AuthUnavailableError(configurationError);

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
      },
    };
  } catch (error) {
    if (error instanceof AuthUnavailableError) throw error;
    throw new AuthUnavailableError('The authentication store could not be reached.');
  }
}

/**
 * Hono middleware requiring an authenticated user. Returns 401 Unauthorized if not authenticated.
 */
export async function requireAuth(
  c: Context<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>,
  next: Next
) {
  if (!hasTestAuthSecret(c.env)) {
    const configurationError = getAuthConfigurationError(c.env);
    if (configurationError) {
      return c.json(
        {
          error: 'AuthenticationUnavailable',
          message: 'Account features are not configured for this environment.',
        },
        503
      );
    }
  }

  let authContext: AuthenticatedContext | null;
  try {
    authContext = await getSessionFromRequest(c.req.raw, c.env);
  } catch {
    return c.json(
      {
        error: 'AuthenticationUnavailable',
        message: 'The authentication service is temporarily unavailable.',
      },
      503
    );
  }
  if (!authContext) {
    return c.json(
      { error: 'Unauthorized', message: 'Authentication required for this operation.' },
      401
    );
  }
  c.set('auth', authContext);
  return next();
}

/**
 * Hono middleware adding optional auth context if present.
 */
export async function optionalAuth(
  c: Context<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>,
  next: Next
) {
  let authContext: AuthenticatedContext | null;
  try {
    authContext = await getSessionFromRequest(c.req.raw, c.env);
  } catch {
    return c.json(
      {
        error: 'AuthenticationUnavailable',
        message: 'The authentication service is temporarily unavailable.',
      },
      503
    );
  }
  if (authContext) {
    c.set('auth', authContext);
  }
  return next();
}
