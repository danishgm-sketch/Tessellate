import { describe, expect, it } from 'vitest';
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
});
