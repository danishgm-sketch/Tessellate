import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchJsonWithRetry } from './fetch-json-with-retry';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchJsonWithRetry', () => {
  it('retries a transient network failure once', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ resources: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchJsonWithRetry('/data/catalog.json')).resolves.toEqual({ resources: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a transient server failure once', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('Unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ resources: [] }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchJsonWithRetry('/data/catalog.json')).resolves.toEqual({ resources: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry a permanent client error', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('Not found', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchJsonWithRetry('/data/catalog.json')).rejects.toThrow('HTTP 404');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
