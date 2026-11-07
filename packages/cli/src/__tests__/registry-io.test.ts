import * as http from 'node:http';
import { lookup } from 'node:dns/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRegistryResponse } from '../registry-io.js';

vi.mock('node:dns/promises', () => ({ lookup: vi.fn() }));

async function withRegistry(
  handler: http.RequestListener,
  run: (url: string) => Promise<void>,
  hostname = '127.0.0.1'
) {
  const server = http.createServer(handler);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Test registry did not bind to a TCP port.');
  try {
    await run(`http://${hostname}:${address.port}/r`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe('CLI registry network boundary', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.mocked(lookup).mockReset();
  });

  it('requires HTTPS for configured public registries', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '');
    await expect(fetchRegistryResponse('http://registry.example/r/button.json', 1024, 'Registry item'))
      .rejects.toThrow(/must use HTTPS/);
  });

  it('blocks private address literals unless an explicit trusted-local opt-in is set', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '');
    await expect(fetchRegistryResponse('https://127.0.0.1/r/button.json', 1024, 'Registry item'))
      .rejects.toThrow(/Private or local registry targets are blocked/);
  });

  it('does not let the local-registry opt-in send HTTP to public hosts', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '1');
    await expect(fetchRegistryResponse('http://8.8.8.8/r/button.json', 1024, 'Registry item'))
      .rejects.toThrow(/HTTP is allowed only for a trusted local registry/);
  });

  it('rejects mixed public and private DNS answers instead of choosing the public address', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '');
    vi.mocked(lookup).mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
      { address: '127.0.0.1', family: 4 },
    ] as never);

    await expect(fetchRegistryResponse('https://registry.example/r/button.json', 1024, 'Registry item'))
      .rejects.toThrow(/Private or local registry targets are blocked/);
    expect(lookup).toHaveBeenCalledOnce();
  });

  it('connects a trusted local hostname to the DNS address that passed validation', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '1');
    vi.mocked(lookup).mockResolvedValue([{ address: '127.0.0.1', family: 4 }] as never);
    await withRegistry((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end('{"ok":true}');
    }, async (url) => {
      const response = await fetchRegistryResponse(url, 1024, 'Registry item');
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
    }, 'trusted-registry.local');

    expect(lookup).toHaveBeenCalledOnce();
    expect(lookup).toHaveBeenCalledWith('trusted-registry.local', { all: true, verbatim: true });
  });

  it('allows an explicitly trusted local registry and never follows redirects', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '1');
    await withRegistry((_request, response) => {
      response.writeHead(302, { Location: 'http://169.254.169.254/latest/meta-data/' });
      response.end();
    }, async (url) => {
      const response = await fetchRegistryResponse(url, 1024, 'Registry item');
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('http://169.254.169.254/latest/meta-data/');
      expect(await response.text()).toBe('');
    });
  });

  it('enforces response limits even when the server omits Content-Length', async () => {
    vi.stubEnv('TESS_ALLOW_PRIVATE_REGISTRY', '1');
    await withRegistry((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
      response.write('x'.repeat(1024));
      response.end('y'.repeat(1024));
    }, async (url) => {
      await expect(fetchRegistryResponse(url, 128, 'Registry item'))
        .rejects.toThrow(/exceeds the 128-byte input limit/);
    });
  });
});
