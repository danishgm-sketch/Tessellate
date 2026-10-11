import { describe, it, expect, vi } from 'vitest';
import app from '../index.js';

describe('Apps/API: AI Proxy Worker Route', () => {
  it('rejects unsupported AI providers with 400 Bad Request', async () => {
    const res = await app.request('/api/ai/unknown-provider/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
    });

    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('Invalid AI provider');
  });

  it('rejects payload exceeding 512 KB with 413 Payload Too Large', async () => {
    const largeBody = 'x'.repeat(600 * 1024); // 600 KB

    const res = await app.request('/api/ai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key',
      },
      body: largeBody,
    });

    expect(res.status).toBe(413);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('Payload too large');
  });

  it('proxies request to allowlisted provider and enforces strict no-cache headers', async () => {
    // Mock global fetch for upstream OpenAI call
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'hello' } }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );

    const res = await app.request('/api/ai/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key-12345',
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [] }),
    });

    expect(res.status).toBe(200);

    // SECURITY CONTRACT: strict no-cache headers
    const cacheControl = res.headers.get('cache-control');
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('no-cache');
    expect(cacheControl).toContain('max-age=0');
    expect(res.headers.get('pragma')).toBe('no-cache');

    // Upstream fetch was invoked with target URL and forwarded headers
    expect(mockFetch).toHaveBeenCalled();
    const [targetUrl, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(targetUrl).toBe('https://api.openai.com/v1/chat/completions');
    const headers = init.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer test-key-12345');

    mockFetch.mockRestore();
  });
});
