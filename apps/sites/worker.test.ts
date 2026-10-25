import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import worker from './worker.js';

describe('Sites host capability', () => {
  const env = { ASSETS: { fetch: async () => { throw new Error('API must not fetch assets'); } } } as unknown as Env;

  it('reports the disconnected host so commands can use deterministic fallback', async () => {
    const response = await worker.fetch(new Request('https://example.test/api/inference/health'), env);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ hostOnline: false, pendingTasks: 0, engine: 'deterministic' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('does not accept tasks or expose development host endpoints', async () => {
    for (const pathname of ['queue', 'heartbeat', 'poll', 'complete', 'status/test']) {
      const response = await worker.fetch(new Request(`https://example.test/api/inference/${pathname}`, { method: 'POST' }), env);
      expect(response.status).toBe(pathname === 'queue' ? 503 : 404);
      expect(await response.json()).toMatchObject({ error: pathname === 'queue' ? 'BackendUnavailable' : 'NotFound' });
    }
  });

  it('redirects a top-level request for the isolated preview document to its trusted wrapper', async () => {
    const response = await worker.fetch(
      new Request('https://example.test/preview-content/?resource=button', {
        headers: { 'Sec-Fetch-Dest': 'document' },
      }),
      env,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://example.test/preview/?resource=button');
  });

  it('does not grant deployed page policies access to local development origins', async () => {
    const assetsEnv = {
      ASSETS: {
        fetch: async () => new Response('<!doctype html><html><head></head><body></body></html>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      },
    } as unknown as Env;
    const response = await worker.fetch(new Request('https://example.test/'), assetsEnv);
    const policy = response.headers.get('Content-Security-Policy') ?? '';
    expect(policy).not.toMatch(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\b/i);

    const staticHeaders = await readFile(new URL('../site/public/_headers', import.meta.url), 'utf8');
    expect(staticHeaders).not.toMatch(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\b/i);
  });

  it('preserves vetted HTML and its strict CSP without disabling transparent edge compression', async () => {
    const html = '<!doctype html><html><head></head><body><main>Verified page</main></body></html>';
    const assetsEnv = {
      ASSETS: {
        fetch: async () => new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=0, must-revalidate',
          },
        }),
      },
    } as unknown as Env;

    const response = await worker.fetch(new Request('https://example.test/'), assetsEnv);
    const policy = response.headers.get('Content-Security-Policy') ?? '';
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(html);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate');
    expect(response.headers.get('Cache-Control')).not.toMatch(/no-transform/i);
    expect(policy).toContain("script-src 'self'");
    expect(policy).not.toMatch(/script-src[^;]*unsafe-inline|unsafe-eval/i);
  });
});
