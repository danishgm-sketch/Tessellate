import { describe, expect, it } from 'vitest';
import app from '../index.js';
import { testAuthBearer, testAuthEnv } from './test-auth-fixture.js';

describe('authentication fail-closed boundaries', () => {
  it('keeps account-free profile discovery available to a guest', async () => {
    const response = await app.request('/api/me');

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      authenticated: false,
      user: null,
      profile: null,
    });
  });

  it('does not accept a public test-user bearer token as a real identity', async () => {
    const response = await app.request('/api/me', {
      headers: { Authorization: 'Bearer test-user-attacker' },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { authenticated: boolean; user: unknown };
    expect(body.authenticated).toBe(false);
    expect(body.user).toBeNull();
  });

  it('reports GitHub authentication as unavailable when required bindings are absent', async () => {
    const response = await app.request('/api/auth/get-session');

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'AuthenticationUnavailable' });
  });

  it('does not expose a session credential in the profile response', async () => {
    const authorization = testAuthBearer('test-user-safe');
    const response = await app.request(
      '/api/me',
      { headers: { Authorization: authorization } },
      testAuthEnv
    );
    const responseText = await response.text();

    expect(response.status).toBe(200);
    expect(responseText).not.toContain(authorization);
    expect(responseText).not.toMatch(/"token"\s*:/i);
  });

  it('rejects expired signed test sessions', async () => {
    const response = await app.request(
      '/api/projects',
      { headers: { Authorization: testAuthBearer('test-user-expired', Date.now() - 1) } },
      testAuthEnv
    );

    expect(response.status).toBe(401);
  });

  it('reports account mutations unavailable when authentication is not configured', async () => {
    const response = await app.request('/api/projects', { method: 'POST' });

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'AuthenticationUnavailable' });
  });
});
