import { describe, it, expect, beforeEach } from 'vitest';
import app from '../index.js';
import { clearDevOutbox, readDevOutbox } from '../email.js';
import { resetAuthStateForTests } from '../auth.js';
import { authLimiter } from '../routes/auth.js';
import { resetInferenceStateForTests } from '../routes/inference.js';
import type { Env } from '../types.js';

const ENV: Env = {
  ENVIRONMENT: 'test',
  BETTER_AUTH_URL: 'http://localhost:8787',
  PUBLIC_SITE_URL: 'http://localhost:4321',
  ADMIN_EMAILS: 'owner@tessellate.test',
};
const ORIGIN = 'http://localhost:4321';
const BASE = 'http://localhost:8787';

/** Minimal cookie jar so tests behave like a browser session. */
class Browser {
  private cookies = new Map<string, string>();

  async fetch(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set('Origin', ORIGIN);
    if (this.cookies.size) headers.set('Cookie', [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '));
    const res = await app.request(path.startsWith('http') ? path : `${BASE}${path}`, { ...init, headers, redirect: 'manual' }, ENV);
    for (const raw of res.headers.getSetCookie?.() ?? []) {
      const [pair] = raw.split(';');
      const [k, ...rest] = pair!.split('=');
      const v = rest.join('=');
      if (raw.toLowerCase().includes('max-age=0') || v === '') this.cookies.delete(k!.trim());
      else this.cookies.set(k!.trim(), v);
    }
    return res;
  }

  post(path: string, body: unknown) {
    return this.fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  }
}

function lastEmailTo(email: string) {
  const mail = [...readDevOutbox()].reverse().find((m) => m.to === email);
  if (!mail) throw new Error(`no email to ${email}`);
  const url = /(https?:\/\/[^\s"<>]+)/.exec(mail.text)?.[1];
  return { mail, url: url! };
}

async function signUpAndVerify(email: string, password = 'correct horse battery staple') {
  const b = new Browser();
  const signUp = await b.post('/api/auth/sign-up/email', { email, password, name: email.split('@')[0] });
  expect(signUp.status).toBe(200);
  const { url } = lastEmailTo(email);
  const verify = await b.fetch(url);
  expect([200, 302]).toContain(verify.status);
  return b;
}

// Password hashing is deliberately slow; give these flows room on a busy CI machine.
describe('Accounts: email + password (D-037)', { timeout: 20000 }, () => {
  beforeEach(() => {
    resetAuthStateForTests();
    resetInferenceStateForTests();
    clearDevOutbox();
    authLimiter.reset();
  });

  it('requires email verification before sign-in, then signs the user in', async () => {
    const b = new Browser();
    expect((await b.post('/api/auth/sign-up/email', { email: 'ada@clinic.test', password: 'correct horse battery staple', name: 'Ada' })).status).toBe(200);

    const early = await b.post('/api/auth/sign-in/email', { email: 'ada@clinic.test', password: 'correct horse battery staple' });
    expect(early.status).toBe(403);

    const { mail, url } = lastEmailTo('ada@clinic.test');
    expect(mail.subject).toMatch(/Confirm your email/);
    expect(mail.html).toContain('Confirm email');
    await b.fetch(url);

    const me = await (await b.fetch('/api/me')).json() as { authenticated: boolean; user: { email: string } };
    expect(me.authenticated).toBe(true);
    expect(me.user.email).toBe('ada@clinic.test');
  });

  it('enforces the password policy', async () => {
    const b = new Browser();
    const res = await b.post('/api/auth/sign-up/email', { email: 'short@clinic.test', password: 'short', name: 'Short' });
    expect(res.status).toBe(400);
  });

  it('resets a forgotten password through an emailed link and revokes old sessions', async () => {
    await signUpAndVerify('bea@clinic.test');
    const b = new Browser();
    expect((await b.post('/api/auth/request-password-reset', { email: 'bea@clinic.test', redirectTo: `${ORIGIN}/reset-password` })).status).toBe(200);

    const { url } = lastEmailTo('bea@clinic.test');
    const redirect = await b.fetch(url);
    const token = new URL(redirect.headers.get('location') ?? url).searchParams.get('token') ?? /reset-password\/([^?]+)/.exec(url)?.[1];
    expect(token).toBeTruthy();

    expect((await b.post('/api/auth/reset-password', { newPassword: 'a brand new long password', token })).status).toBe(200);
    expect((await b.post('/api/auth/sign-in/email', { email: 'bea@clinic.test', password: 'correct horse battery staple' })).status).toBe(401);
    expect((await b.post('/api/auth/sign-in/email', { email: 'bea@clinic.test', password: 'a brand new long password' })).status).toBe(200);
  });

  it('rate-limits repeated sign-in attempts', async () => {
    const b = new Browser();
    const statuses: number[] = [];
    for (let i = 0; i < 25; i++) statuses.push((await b.post('/api/auth/sign-in/email', { email: 'nobody@clinic.test', password: 'wrong password here' })).status);
    expect(statuses).toContain(429);
  });

  it('bootstraps the configured admin only after verification, and gates the admin API', async () => {
    const owner = await signUpAndVerify('owner@tessellate.test');
    const member = await signUpAndVerify('member@clinic.test');

    expect((await member.fetch('/api/admin/users')).status).toBe(403);
    expect((await new Browser().fetch('/api/admin/users')).status).toBe(401);

    const list = await owner.fetch('/api/admin/users');
    expect(list.status).toBe(200);
    const { users } = (await list.json()) as { users: Array<{ id: string; email: string }> };
    const memberId = users.find((u) => u.email === 'member@clinic.test')!.id;

    expect((await owner.post(`/api/admin/users/${memberId}/ban`, { reason: 'Abusive queue usage' })).status).toBe(200);
    // Banned users cannot sign in and their existing session stops working.
    expect((await new Browser().post('/api/auth/sign-in/email', { email: 'member@clinic.test', password: 'correct horse battery staple' })).status).toBe(403);
    expect(((await (await member.fetch('/api/me')).json()) as { authenticated: boolean }).authenticated).toBe(false);

    const log = (await (await owner.fetch('/api/admin/audit-log')).json()) as { entries: Array<{ action: string }> };
    expect(log.entries.map((e) => e.action)).toContain('user.ban');
  });

  it('lets admins issue and revoke daemon device tokens', async () => {
    const owner = await signUpAndVerify('owner@tessellate.test');
    const created = await owner.post('/api/admin/devices', { name: 'Studio PC' });
    expect(created.status).toBe(201);
    const { id, token } = (await created.json()) as { id: string; token: string };

    const poll = () => app.request(`${BASE}/api/inference/poll`, { headers: { Authorization: `Bearer ${token}` } }, ENV);
    expect((await poll()).status).toBe(200);

    const devices = (await (await owner.fetch('/api/admin/devices')).json()) as { devices: Array<Record<string, unknown>> };
    expect(JSON.stringify(devices)).not.toContain(token);
    expect(devices.devices[0]).not.toHaveProperty('tokenHash');

    expect((await owner.fetch(`/api/admin/devices/${id}`, { method: 'DELETE' })).status).toBe(200);
    expect((await poll()).status).toBe(401);
  });

  it('exports account data and deletes the account after email confirmation', async () => {
    const b = await signUpAndVerify('cara@clinic.test');
    const exported = await b.fetch('/api/me/export');
    expect(exported.status).toBe(200);
    expect(((await exported.json()) as { user: { email: string } }).user.email).toBe('cara@clinic.test');

    expect((await b.post('/api/auth/delete-user', {})).status).toBe(200);
    const { mail, url } = lastEmailTo('cara@clinic.test');
    expect(mail.subject).toMatch(/deleting your Tessellate account/);
    await b.fetch(url);
    expect((await new Browser().post('/api/auth/sign-in/email', { email: 'cara@clinic.test', password: 'correct horse battery staple' })).status).toBe(401);
  });

  it('never exposes the dev outbox in production', async () => {
    expect((await app.request(`${BASE}/api/dev/outbox`, {}, {})).status).toBe(404);
  });
});
