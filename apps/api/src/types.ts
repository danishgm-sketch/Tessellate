export interface Env {
  RUNTIME_ENVIRONMENT?: 'development' | 'test' | 'production';
  DB?: D1Database;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  TEST_AUTH_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  TESSELLATE_HOST_SECRET?: string;
  TESSELLATE_GATEWAY_SECRET?: string;
  API_PUBLIC_WRITE_LIMITER?: RateLimit;
  API_USER_WRITE_LIMITER?: RateLimit;
  API_AI_LIMITER?: RateLimit;
  API_AUTH_LIMITER?: RateLimit;
  API_CLIENT_LIMITER?: RateLimit;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface AuthenticatedContext {
  user: SessionUser;
  session: AuthSession;
}
