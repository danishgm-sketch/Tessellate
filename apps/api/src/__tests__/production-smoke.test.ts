import { describe, it, expect } from 'vitest';
import app from '../index.js';
import { verifyTurnstileToken } from '../turnstile.js';

describe('Production Deployment & Security Smoke Tests (Phase 21)', () => {
  it('GET /health returns 200 with service metadata', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; service: string };
    expect(body.status).toBe('ok');
    expect(body.service).toBe('tessellate-api');
  });

  it('GET / returns API route directory', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name: string; routes: string[] };
    expect(body.name).toBe('Tessellate API');
    expect(body.routes).toContain('/health');
  });

  it('enforces production security headers across responses', async () => {
    const res = await app.request('/health');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('Permissions-Policy')).toContain('camera=()');
  });

  it('validates canonical CORS origin allowance', async () => {
    const res = await app.request('/health', {
      headers: { Origin: 'https://tessellate.design' },
    });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://tessellate.design');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('Turnstile helper bypasses cleanly when secret is absent, validates token requirement when present', async () => {
    // Absent secret (local dev / test mode)
    const devCheck = await verifyTurnstileToken();
    expect(devCheck.success).toBe(true);

    // Present secret without token
    const prodMissingToken = await verifyTurnstileToken('dummy_secret_key');
    expect(prodMissingToken.success).toBe(false);
    expect(prodMissingToken.error).toContain('Turnstile verification token required');
  });
});
