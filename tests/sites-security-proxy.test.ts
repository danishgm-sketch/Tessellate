import { describe, expect, it, vi } from 'vitest';
import worker from '../apps/sites/worker.js';

describe('Sites security asset routing', () => {
  it('serves the trusted preview wrapper with a restricted nested-frame policy', async () => {
    const fetch = vi.fn(async (request: Request) =>
      new URL(request.url).pathname === '/__tessellate_asset_payloads/preview/index.html.bin'
        ? new Response('<html>actual preview wrapper</html>', {
            headers: { 'Content-Type': 'application/octet-stream' },
          })
        : new Response('missing', { status: 404 }),
    );
    const response = await worker.fetch(new Request('https://review.example/preview/'), {
      ASSETS: { fetch },
    } as unknown as Parameters<typeof worker.fetch>[1]);

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-transform');
    expect(await response.text()).toContain('actual preview wrapper');
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');

    const policy = response.headers.get('Content-Security-Policy') ?? '';
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("connect-src 'none'");
    expect(policy).toContain('frame-src https://review.example');
    expect(policy).toContain('sandbox allow-scripts');
    expect(policy).not.toContain('api.tessellate.design');
  });

  it('serves the opaque renderer with its strict preview policy and no same-origin ancestor headers', async () => {
    const fetch = vi.fn(async (request: Request) =>
      new URL(request.url).pathname ===
      '/__tessellate_asset_payloads/preview-content/index.html.bin'
        ? new Response('<html>actual isolated renderer</html>', {
            headers: { 'Content-Type': 'application/octet-stream' },
          })
        : new Response('missing', { status: 404 }),
    );
    const response = await worker.fetch(
      new Request('https://review.example/preview-content/?resource=button', {
        headers: { 'Sec-Fetch-Dest': 'iframe' },
      }),
      { ASSETS: { fetch } } as unknown as Parameters<typeof worker.fetch>[1],
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-transform');
    expect(await response.text()).toContain('actual isolated renderer');
    expect(response.headers.get('X-Frame-Options')).toBeNull();
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');

    const policy = response.headers.get('Content-Security-Policy') ?? '';
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain('connect-src https://review.example/_astro/');
    expect(policy).toContain("frame-src 'none'");
    expect(policy).toContain('sandbox allow-scripts');
    expect(policy).not.toContain('frame-ancestors');
    expect(policy).not.toContain('api.tessellate.design');
  });

  it('retains opaque frame module loading and original resource URLs', async () => {
    let assetPath = '';
    const fetch = vi.fn(async (request: Request) => {
      assetPath = new URL(request.url).pathname;
      return new Response('export default 1', { headers: { 'Content-Type': 'text/javascript' } });
    });
    const response = await worker.fetch(new Request('https://review.example/_astro/resource.js'), {
      ASSETS: { fetch },
    } as unknown as Parameters<typeof worker.fetch>[1]);

    expect(assetPath).toBe('/__tessellate_asset_payloads/_astro/resource.js');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Content-Type')).toBe('text/javascript');
  });
});
