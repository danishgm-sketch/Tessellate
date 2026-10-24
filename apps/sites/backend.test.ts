import { afterEach, describe, expect, it, vi } from 'vitest';
import { proxyBackend } from './backend.js';

const config = { url: 'https://laptop.example.test', secret: 'test-only-gateway-key-with-enough-length' };
afterEach(() => vi.unstubAllGlobals());
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
