import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyBackend } from './backend.js';

const config = { url: 'https://laptop.example.test', secret: 'test-only-gateway-key-with-enough-length' };
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
describe('laptop backend transport', () => {
  it('reports outages truthfully without accepting work', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const health = await proxyBackend(new Request('https://site.test/api/inference/health'), config);
    expect(await health.json()).toMatchObject({ apiOnline: false, hostOnline: false });
    const queue = await proxyBackend(new Request('https://site.test/api/inference/queue', { method: 'POST' }), config);
    expect(queue.status).toBe(503);
  });
  it('forwards only permitted credentials and keeps the gateway secret server-side', async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({ ok: true }, { headers: { 'X-Host-Secret': 'private' } }));
    vi.stubGlobal('fetch', transport);
    const result = await proxyBackend(new Request('https://site.test/api/inference/queue', {
      method: 'POST', headers: { Origin: 'https://site.test', Cookie: 'chatgpt_session=private; better-auth.session_token=auth', 'X-Host-Secret': 'untrusted' }, body: '{}',
    }), config);
    const [target, init] = transport.mock.calls[0]!;
    expect(String(target)).toBe('https://laptop.example.test/api/inference/queue');
    expect(init.headers.get('Cookie')).toBe('better-auth.session_token=auth');
    expect(init.headers.get('X-Host-Secret')).toBeNull();
    expect(init.headers.get('X-Tessellate-Gateway')).toBe(config.secret);
    expect(result.headers.get('X-Host-Secret')).toBeNull();
  });
  it('forwards BYO provider credentials only to the AI proxy route', async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal('fetch', transport);
    const aiRequest = new Request('https://site.test/api/ai/anthropic/messages', {
      method: 'POST',
      headers: {
        Origin: 'https://site.test',
        'Content-Type': 'application/json',
        'x-api-key': 'byo-anthropic-key',
        'anthropic-version': '2023-06-01',
        'x-goog-api-key': 'byo-gemini-key',
        'X-Untrusted-Secret': 'must-not-forward',
      },
      body: '{}',
    });

    await proxyBackend(aiRequest, config);
    const [, aiInit] = transport.mock.calls[0]!;
    expect(aiInit.headers.get('x-api-key')).toBe('byo-anthropic-key');
    expect(aiInit.headers.get('anthropic-version')).toBe('2023-06-01');
    expect(aiInit.headers.get('x-goog-api-key')).toBe('byo-gemini-key');
    expect(aiInit.headers.get('X-Untrusted-Secret')).toBeNull();

    await proxyBackend(new Request('https://site.test/api/projects', {
      headers: { 'x-api-key': 'must-not-forward', 'anthropic-version': 'must-not-forward' },
    }), config);
    const [, apiInit] = transport.mock.calls[1]!;
    expect(apiInit.headers.get('x-api-key')).toBeNull();
    expect(apiInit.headers.get('anthropic-version')).toBeNull();
  });
  it('allows model generation more time than a normal laptop API request', async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal('fetch', transport);
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(new AbortController().signal);

    await proxyBackend(new Request('https://site.test/api/ai/generate', {
      method: 'POST',
      headers: { Origin: 'https://site.test', 'Content-Type': 'application/json' },
      body: '{}',
    }), config);

    expect(timeout).toHaveBeenCalledWith(120_000);
  });
  it('rejects cross-origin writes and private host controls before transport', async () => {
    const transport = vi.fn(); vi.stubGlobal('fetch', transport);
    const mutation = await proxyBackend(new Request('https://site.test/api/inference/queue', { method: 'POST', headers: { Origin: 'https://other.test' } }), config);
    expect(mutation.status).toBe(403);
    const privateRoute = await proxyBackend(new Request('https://site.test/api/inference/poll'), config);
    expect(privateRoute.status).toBe(404);
    expect(transport).not.toHaveBeenCalled();
  });
  it('allows an authenticated ticket cancellation through the server-side gateway', async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({ success: true }));
    vi.stubGlobal('fetch', transport);
    const result = await proxyBackend(new Request('https://site.test/api/inference/cancel/123e4567-e89b-12d3-a456-426614174000', {
      method: 'POST',
      headers: { Origin: 'https://site.test', Authorization: 'Bearer private-ticket-token' },
    }), config);
    expect(result.status).toBe(200);
    const [, init] = transport.mock.calls[0]!;
    expect(init.headers.get('Authorization')).toBe('Bearer private-ticket-token');
    expect(init.headers.get('X-Tessellate-Gateway')).toBe(config.secret);
    expect(init.headers.get('X-Host-Secret')).toBeNull();
  });
  it('rejects oversized jobs and insecure public transport', async () => {
    const transport = vi.fn(); vi.stubGlobal('fetch', transport);
    expect((await proxyBackend(new Request('https://site.test/api/inference/queue', { method: 'POST', body: 'x'.repeat(100000) }), config)).status).toBe(413);
    expect((await proxyBackend(new Request('https://site.test/api/inference/queue'), { ...config, url: 'http://laptop.test' })).status).toBe(503);
    expect(transport).not.toHaveBeenCalled();
  });
});
