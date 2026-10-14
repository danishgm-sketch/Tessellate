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
  /** Cloudflare Email Service binding (wrangler `send_email`). */
  EMAIL?: SendEmailBinding;
  /** Sender address on the onboarded domain, e.g. no-reply@tessellate.design. */
  EMAIL_FROM?: string;
  /** Public site origin used in links inside emails, e.g. https://tessellate.design. */
  PUBLIC_SITE_URL?: string;
  /** Comma-separated emails that are granted the admin role when they verify. */
  ADMIN_EMAILS?: string;
}

/** Cloudflare Email Service Workers binding (https://developers.cloudflare.com/email-service/). */
export interface SendEmailBinding {
  send(message: {
    to: string | string[];
    from: { email: string; name?: string };
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
  }): Promise<unknown>;
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
