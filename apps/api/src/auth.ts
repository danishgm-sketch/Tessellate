import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, captcha, haveIBeenPwned } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';
import type { Env, AuthenticatedContext } from './types.js';
import type { Context, Next } from 'hono';
import { ConfigurationError, isNonProduction, isTestEnvironment } from './security.js';
import { accountEmail, sendEmail } from './email.js';
import { allowedOrigins } from './origins.js';

/** Development-only signing secret. Never used when ENVIRONMENT is production (or unset). */
const DEV_ONLY_AUTH_SECRET = 'tessellate-local-development-secret-not-for-production'; // audit-allow-secret: dev/test only, gated by isNonProduction()

/** Password policy (NIST SP 800-63B style: length over composition rules, breached-password check). */
export const PASSWORD_POLICY = { minLength: 10, maxLength: 128 } as const;

function resolveAuthSecret(env?: Env): string {
  if (env?.BETTER_AUTH_SECRET) return env.BETTER_AUTH_SECRET;
  if (isNonProduction(env)) return DEV_ONLY_AUTH_SECRET;
  throw new ConfigurationError('BETTER_AUTH_SECRET is not configured.');
}

function githubProvider(env?: Env) {
  if (!env?.GITHUB_CLIENT_ID || !env?.GITHUB_CLIENT_SECRET) return {};
  return { github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET } };
}

function siteUrl(env?: Env): string {
  return (env?.PUBLIC_SITE_URL ?? (isNonProduction(env) ? 'http://localhost:4321' : 'https://tessellate.design')).replace(/\/$/, '');
}

function adminEmails(env?: Env): Set<string> {
  return new Set(
    (env?.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function buildAuth(env: Env | undefined) {
  const secret = resolveAuthSecret(env);
  const baseURL = env?.BETTER_AUTH_URL || 'http://localhost:8787';
  const site = siteUrl(env);

  if (!env?.DB && !isNonProduction(env)) {
    throw new ConfigurationError('D1 database binding (DB) is not configured.');
  }
  if (!env?.TURNSTILE_SECRET_KEY && !isNonProduction(env)) {
    throw new ConfigurationError('TURNSTILE_SECRET_KEY is required to protect sign-up and sign-in.');
  }

  const db = env?.DB ? drizzle(env.DB, { schema }) : undefined;

  return betterAuth({
    secret,
    baseURL,
    basePath: '/api/auth',
    trustedOrigins: allowedOrigins(env),
    ...(db ? { database: drizzleAdapter(db, { provider: 'sqlite', schema }) } : {}),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: PASSWORD_POLICY.minLength,
      maxPasswordLength: PASSWORD_POLICY.maxLength,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail(
          env,
          accountEmail({
            to: user.email,
            subject: 'Reset your Tessellate password',
            greetingName: user.name,
            intro: 'Someone asked to reset the password for your Tessellate account. The link expires in one hour.',
            actionLabel: 'Choose a new password',
            actionUrl: url,
            footer: 'If you did not ask for this, you can ignore this email; your password stays the same.',
          }),
        );
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail(
          env,
          accountEmail({
            to: user.email,
            subject: 'Confirm your email for Tessellate',
            greetingName: user.name,
            intro: 'Confirm your email address to finish creating your Tessellate account.',
            actionLabel: 'Confirm email',
            actionUrl: url,
            footer: 'If you did not create a Tessellate account, you can ignore this email.',
          }),
        );
      },
    },
    databaseHooks: {
      user: {
        update: {
          // Bootstrap administrators (ADMIN_EMAILS) only after they have proven ownership of the address.
          after: async (user, context) => {
            const role = (user as { role?: string | null }).role;
            if (user.emailVerified && role !== 'admin' && adminEmails(env).has(user.email.toLowerCase()) && context) {
              await context.context.internalAdapter.updateUser(user.id, { role: 'admin' });
            }
          },
        },
      },
    },
    user: {
      deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: async ({ user, url }) => {
          await sendEmail(
            env,
            accountEmail({
              to: user.email,
              subject: 'Confirm deleting your Tessellate account',
              greetingName: user.name,
              intro:
                'You asked to permanently delete your Tessellate account and its cloud data. Projects saved only in your browser are not affected.',
              actionLabel: 'Delete my account',
              actionUrl: url,
              footer: 'If you did not ask for this, ignore this email and change your password.',
            }),
          );
        },
      },
    },
    socialProviders: githubProvider(env),
    session: {
      // No cookie cache: roles, bans and revocations must apply on the very next request.
      cookieCache: { enabled: false },
    },
    advanced: {
      useSecureCookies: !isNonProduction(env),
    },
    plugins: [
      admin({ defaultRole: 'user', adminRoles: ['admin'], bannedUserMessage: 'This account has been suspended. Contact support if you think this is a mistake.' }),
      ...(env?.TURNSTILE_SECRET_KEY
        ? [captcha({ provider: 'cloudflare-turnstile', secretKey: env.TURNSTILE_SECRET_KEY, endpoints: ['/sign-up/email', '/sign-in/email', '/request-password-reset'] })]
        : []),
      // Breached-password check (k-anonymity range API); skipped in tests to keep them offline.
      ...(isTestEnvironment(env) ? [] : [haveIBeenPwned({ customPasswordCompromisedMessage: 'This password has appeared in a data breach. Please choose a different one.' })]),
    ],
    onAPIError: {
      errorURL: `${site}/auth/error`,
    },
  });
}

type AuthInstance = ReturnType<typeof buildAuth>;

// Without D1 (development/tests) Better Auth keeps users in memory, so the instance must be reused
// across requests. D1-backed instances are cheap to rebuild and hold no request state.
const memoryInstances = new Map<string, AuthInstance>();

export function createAuth(env?: Env): AuthInstance {
  if (env?.DB) return buildAuth(env);
  const key = `${env?.ENVIRONMENT}|${env?.TURNSTILE_SECRET_KEY ?? ''}|${env?.BETTER_AUTH_URL ?? ''}`;
  let instance = memoryInstances.get(key);
  if (!instance) {
    instance = buildAuth(env);
    memoryInstances.set(key, instance);
  }
  return instance;
}

/** Test helper: drops in-memory auth state. */
export function resetAuthStateForTests(): void {
  memoryInstances.clear();
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
    // Authorization decisions read the database, never the cookie cache, so bans and role
    // changes take effect immediately.
    const sessionRes = await auth.api.getSession({
      headers: req.headers,
      query: { disableCookieCache: true },
    });
    if (!sessionRes || !sessionRes.user) {
      return null;
    }
    const user = sessionRes.user as typeof sessionRes.user & { role?: string | null; banned?: boolean | null };
    if (user.banned) return null;
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
 * Hono middleware requiring the admin role (403 for signed-in non-admins).
 */
export async function requireAdmin(c: Context<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>, next: Next) {
  const authContext = await getSessionFromRequest(c.req.raw, c.env);
  if (!authContext) {
    return c.json({ error: 'Unauthorized', message: 'Authentication required for this operation.' }, 401);
  }
  if (authContext.user.role !== 'admin') {
    return c.json({ error: 'Forbidden', message: 'Administrator access is required.' }, 403);
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
