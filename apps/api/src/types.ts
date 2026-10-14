/** Cloudflare Workers Rate Limiting binding (https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/). */
export interface RateLimitBinding {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  DB?: D1Database;
  /**
   * Deployment environment. Anything other than 'development' or 'test' (including unset)
   * is treated as production so that every dev/test convenience fails closed.
   */
  ENVIRONMENT?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  /** Development-only daemon token (never honoured in production; production uses hashed device tokens in D1). */
  DAEMON_DEV_TOKEN?: string;
  /** Comma-separated extra CORS origins (e.g. staging hosts). */
  EXTRA_ALLOWED_ORIGINS?: string;
  RATE_LIMIT_ENQUEUE?: RateLimitBinding;
  RATE_LIMIT_AUTH?: RateLimitBinding;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
}

export interface AuthenticatedContext {
  user: SessionUser;
  session: AuthSession;
}
