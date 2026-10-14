import { describe, it, expect } from 'vitest';
import { request, TEST_ENV, UNCONFIGURED_PRODUCTION_ENV } from './helpers.js';
import { verifyTurnstileToken } from '../turnstile.js';

describe('API service metadata and headers', () => {
  it('GET /health returns 200 with service metadata', async () => {
    const res = await request('/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('tessellate-api');
  });

  it('GET / lists routes and no longer advertises the removed BYO AI proxy (D-033)', async () => {
    const res = await request('/');
    const body = (await res.json()) as { routes: string[] };
    expect(body.routes).toContain('/health');
    expect(body.routes).toContain('/api/inference/*');
    expect(body.routes).not.toContain('/api/ai/*');
    expect((await request('/api/ai/openai/v1/models')).status).toBe(404);
  });

  it('sends security headers on every response', async () => {
    const res = await request('/health');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toContain('camera=()');
  });

  it('returns JSON for unknown routes', async () => {
    const res = await request('/definitely-missing');
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error: string }).error).toBe('Not Found');
  });
});

describe('CORS', () => {
  it('allows the canonical origin with credentials', async () => {
    const res = await request('/health', { headers: { Origin: 'https://tessellate.design' } });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://tessellate.design');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('gives foreign origins no CORS grant (previously echoed the production origin)', async () => {
    const res = await request('/api/me', { headers: { Origin: 'https://evil.example' } });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows localhost only outside production', async () => {
    const dev = await request('/health', { headers: { Origin: 'http://localhost:4321' } }, TEST_ENV);
    expect(dev.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:4321');
    const prod = await request('/health', { headers: { Origin: 'http://localhost:4321' } }, UNCONFIGURED_PRODUCTION_ENV);
    expect(prod.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('Fail-closed production configuration', () => {
  it('never honours test sessions outside ENVIRONMENT=test', async () => {
    const res = await request(
      '/api/projects',
      { headers: { Authorization: 'Bearer test-user-attacker' } },
      { ENVIRONMENT: 'development' },
    );
    expect(res.status).toBe(401);
  });

  it('refuses to run auth with a default secret when BETTER_AUTH_SECRET is missing in production', async () => {
    const res = await request('/api/projects', { headers: { Authorization: 'Bearer test-user-attacker' } }, UNCONFIGURED_PRODUCTION_ENV);
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain('secret');
  });

  it('Turnstile fails closed in production when unconfigured, and bypasses only in dev/test', async () => {
    expect((await verifyTurnstileToken(TEST_ENV)).success).toBe(true);
    const prod = await verifyTurnstileToken(UNCONFIGURED_PRODUCTION_ENV, 'any-token');
    expect(prod.success).toBe(false);
    const missingToken = await verifyTurnstileToken({ TURNSTILE_SECRET_KEY: 'configured' });
    expect(missingToken.success).toBe(false);
    expect(missingToken.error).toContain('Turnstile verification token required');
  });
});
