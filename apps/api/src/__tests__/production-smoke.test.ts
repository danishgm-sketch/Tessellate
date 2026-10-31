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

  it('bounds public JSON request streams before a report route can parse them', async () => {
    let pulledChunks = 0;
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulledChunks += 1;
        if (pulledChunks > 40) {
          controller.close();
          return;
        }
        controller.enqueue(new Uint8Array(8 * 1024));
      },
      cancel() {
        cancelled = true;
      },
    });
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '1',
      },
      body,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    const response = await app.fetch(request);

    expect(response.status).toBe(413);
    expect(pulledChunks).toBeLessThan(20);
    expect(cancelled).toBe(true);
  });

  it('cancels a request body rejected from its declared length before parsing', async () => {
    let pulledChunks = 0;
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulledChunks += 1;
        controller.enqueue(new Uint8Array(1));
      },
      cancel() {
        cancelled = true;
      },
    }, { highWaterMark: 0 });
    const request = new Request('http://localhost/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': String(64 * 1024 + 1),
      },
      body,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' });

    const response = await app.fetch(request);

    expect(response.status).toBe(413);
    expect(pulledChunks).toBe(0);
    expect(cancelled).toBe(true);
  });

  it('Turnstile helper requires explicit local/test bypass and a token when configured', async () => {
    const productionMissingConfig = await verifyTurnstileToken();
    expect(productionMissingConfig.success).toBe(false);
    if (!productionMissingConfig.success) expect(productionMissingConfig.status).toBe(503);

    // An explicit local/test mode may skip the external challenge service.
    const devCheck = await verifyTurnstileToken(undefined, undefined, undefined, true);
    expect(devCheck.success).toBe(true);

    // Present secret without token
    const prodMissingToken = await verifyTurnstileToken('dummy_secret_key');
    expect(prodMissingToken.success).toBe(false);
    if (!prodMissingToken.success) {
      expect(prodMissingToken.status).toBe(403);
      expect(prodMissingToken.error).toContain('Turnstile verification token required');
    }
  });
});
