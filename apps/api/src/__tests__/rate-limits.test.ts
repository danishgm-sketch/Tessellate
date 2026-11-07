import { describe, expect, it, vi } from 'vitest';
import app from '../index.js';
import { testAuthBearer, testAuthEnv } from './test-auth-fixture.js';

describe('API abuse rate limits', () => {
  it('fails closed in production when the public-write limiter is missing', async () => {
    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'project', targetId: 'project-1', reason: 'abuse' }),
    }, { RUNTIME_ENVIRONMENT: 'production' });

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'RateLimitUnavailable' });
  });

  it('rejects a public report before parsing or persistence when its caller is over limit', async () => {
    const limit = vi.fn(async (_input: { key: string }) => ({ success: false }));
    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.0.2.10' },
      body: JSON.stringify({ targetType: 'project', targetId: 'project-2', reason: 'abuse' }),
    }, { ...testAuthEnv, API_PUBLIC_WRITE_LIMITER: { limit } });

    expect(response.status).toBe(429);
    expect(response.headers.get('retry-after')).toBe('60');
    expect(limit).toHaveBeenCalledWith({ key: 'public:192.0.2.10' });
  });

  it('limits authenticated writes by account identity before mutating state', async () => {
    const limit = vi.fn(async (_input: { key: string }) => ({ success: false }));
    const response = await app.request('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: testAuthBearer('rate-limited-user') },
      body: JSON.stringify({ resourceSlug: 'button' }),
    }, { ...testAuthEnv, API_USER_WRITE_LIMITER: { limit } });

    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: 'user:rate-limited-user' });
    const favorites = await app.request('/api/favorites', {
      headers: { Authorization: testAuthBearer('rate-limited-user') },
    }, { ...testAuthEnv, API_USER_WRITE_LIMITER: { limit: vi.fn(async () => ({ success: true })) } });
    expect(await favorites.json()).toMatchObject({ favorites: [] });
  });

  it('applies account limits to every cloud/profile/collection/favorite/creator mutation route', async () => {
    const paths: Array<{ method: string; path: string }> = [
      { method: 'POST', path: '/api/favorites' },
      { method: 'DELETE', path: '/api/favorites/button' },
      { method: 'PUT', path: '/api/me' },
      { method: 'POST', path: '/api/projects' },
      { method: 'PUT', path: '/api/projects/project-1' },
      { method: 'DELETE', path: '/api/projects/project-1' },
      { method: 'POST', path: '/api/projects/project-1/revisions' },
      { method: 'POST', path: '/api/projects/project-1/publish' },
      { method: 'POST', path: '/api/collections' },
      { method: 'POST', path: '/api/collections/collection-1/items' },
      { method: 'DELETE', path: '/api/collections/collection-1/items/button' },
      { method: 'DELETE', path: '/api/collections/collection-1' },
      { method: 'POST', path: '/api/creator-links' },
      { method: 'DELETE', path: '/api/creator-links/link-1' },
    ];

    for (const { method, path } of paths) {
      const response = await app.request(path, {
        method,
        headers: { Authorization: testAuthBearer('matrix-user'), 'Content-Type': 'application/json' },
        body: ['POST', 'PUT', 'PATCH'].includes(method) ? '{}' : undefined,
      }, {
        ...testAuthEnv,
        API_USER_WRITE_LIMITER: { limit: async () => ({ success: false }) },
      });
      expect(response.status, `${method} ${path}`).toBe(429);
    }
  });

  it('limits every anonymous public-write surface before looking up or creating data', async () => {
    const paths = ['/api/reports', '/api/published/missing-project/remix'];
    for (const path of paths) {
      const response = await app.request(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '192.0.2.12' },
        body: '{}',
      }, {
        ...testAuthEnv,
        API_PUBLIC_WRITE_LIMITER: { limit: async () => ({ success: false }) },
      });
      expect(response.status, `POST ${path}`).toBe(429);
    }
  });

  it('fails closed when the configured limiter binding itself is unavailable', async () => {
    const limit = vi.fn(async () => { throw new Error('simulated binding outage'); });
    const response = await app.request('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType: 'project', targetId: 'project-3', reason: 'abuse' }),
    }, { ...testAuthEnv, API_PUBLIC_WRITE_LIMITER: { limit } });

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'RateLimitUnavailable' });
  });

  it('limits auth endpoints before Better Auth can touch its database', async () => {
    const limit = vi.fn(async (_input: { key: string }) => ({ success: false }));
    const response = await app.request('/api/auth/get-session', {
      headers: { 'cf-connecting-ip': '192.0.2.13' },
    }, { ...testAuthEnv, API_AUTH_LIMITER: { limit } });

    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: 'public:192.0.2.13' });
  });

  it('limits laptop inference polling before it performs queue maintenance in D1', async () => {
    const gatewaySecret = 'rate-limit-inference-gateway-secret-0001';
    const limit = vi.fn(async (_input: { key: string }) => ({ success: false }));
    const response = await app.request('/api/inference/status/123e4567-e89b-12d3-a456-426614174000', {
      headers: {
        'X-Tessellate-Gateway': gatewaySecret,
        'X-Tessellate-Client': 'client-fingerprint',
      },
    }, {
      RUNTIME_ENVIRONMENT: 'test',
      DB: {} as D1Database,
      TESSELLATE_GATEWAY_SECRET: gatewaySecret,
      TESSELLATE_HOST_SECRET: 'rate-limit-inference-host-secret-0001',
      API_CLIENT_LIMITER: { limit },
    });

    expect(response.status).toBe(429);
    expect(limit).toHaveBeenCalledWith({ key: 'public:client-fingerprint' });
  });

  it('limits AI proxy calls before contacting a provider and never uses the raw key as a limiter key', async () => {
    const limit = vi.fn(async (_input: { key: string }) => ({ success: false }));
    const upstream = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    try {
      const response = await app.request('/api/ai/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer private-provider-secret',
          'cf-connecting-ip': '192.0.2.11',
        },
        body: JSON.stringify({ model: 'test-model', messages: [] }),
      }, { ...testAuthEnv, API_AI_LIMITER: { limit } });

      expect(response.status).toBe(429);
      expect(upstream).not.toHaveBeenCalled();
      const key = limit.mock.calls[0]?.[0].key;
      expect(key).toMatch(/^credential:[a-f0-9]{64}$/);
      expect(key).not.toContain('private-provider-secret');
    } finally {
      upstream.mockRestore();
    }
  });
});
