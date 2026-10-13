import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { Miniflare } from 'miniflare';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import app from '../index.js';
import type { Env } from '../types.js';

describe('durable laptop inference API', () => {
  const hostSecret = crypto.randomUUID() + crypto.randomUUID();
  const hostHeaders = { 'X-Host-Secret': hostSecret, 'Content-Type': 'application/json' };
  const directory = mkdtempSync(path.join(tmpdir(), 'tess-laptop-queue-'));
  const config = { modules: true, script: 'export default {fetch(){return new Response("binding test")}}', d1Databases: { DB: 'laptop-test' }, d1Persist: directory, compatibilityDate: '2026-05-15' };
  let mf: Miniflare;
  let env: Env;
  const payload = { prompt: 'Improve the screen hierarchy', screenAst: { id: 'root', nodeType: 'layout', semanticRole: 'screen', children: [], props: {}, slots: {} } };
  const request = (url: string, init?: RequestInit) => app.request(`/api/inference${url}`, init, env);
  const heartbeat = () => request('/heartbeat', { method: 'POST', headers: hostHeaders, body: JSON.stringify({ deviceName: 'test laptop', status: 'idle' }) });
  const submit = () => request('/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

  beforeAll(async () => {
    mf = new Miniflare(config);
    env = { DB: await mf.getD1Database('DB'), TESSELLATE_HOST_SECRET: hostSecret };
    const statements = readFileSync(new URL('../../migrations/0002_laptop_inference.sql', import.meta.url), 'utf8').split(';').map(sql => sql.trim()).filter(Boolean);
    await env.DB!.batch(statements.map(sql => env.DB!.prepare(sql)));
  });
  beforeEach(async () => { await env.DB!.batch([env.DB!.prepare('DELETE FROM inference_tickets'), env.DB!.prepare('DELETE FROM host_workers')]); });
  afterAll(async () => {
    await mf?.dispose();
    if (!directory.startsWith(path.join(tmpdir(), 'tess-laptop-queue-'))) throw new Error('Unexpected test directory');
    rmSync(directory, { recursive: true, force: true });
  });

  it('fails closed without database or configured host secret and rejects the old development secret', async () => {
    expect((await app.request('/api/inference/health')).status).toBe(503);
    expect((await request('/heartbeat', { method: 'POST', headers: { 'X-Host-Secret': 'tessellate_owner_secret_dev' }, body: '{}' })).status).toBe(401);
    expect((await request('/heartbeat', { method: 'POST', body: '{}' })).status).toBe(401);
  });

  it('marks an offline host unavailable and accepts tasks only while its heartbeat is current', async () => {
    expect((await submit()).status).toBe(503);
    expect((await heartbeat()).status).toBe(200);
    expect((await (await request('/health')).json())).toMatchObject({ apiOnline: true, hostOnline: true });
    await env.DB!.prepare('UPDATE host_workers SET lastHeartbeat=?').bind(Date.now() - 16000).run();
    expect((await (await request('/health')).json())).toMatchObject({ hostOnline: false });
    expect((await submit()).status).toBe(503);
  });

  it('claims a task once, validates completion, preserves locks, and protects status with its access token', async () => {
    await heartbeat();
    const submitted = await submit(); expect(submitted.status).toBe(200);
    const ticket = await submitted.json() as { ticketId: string; accessToken: string; tokenNumber: number };
    expect((await request(`/status/${ticket.ticketId}`)).status).toBe(404);
    const claims = await Promise.all([request('/poll', { headers: hostHeaders }), request('/poll', { headers: hostHeaders })]);
    const tasks = await Promise.all(claims.map(async response => (await response.json() as { task: { id: string; leaseId: string } | null }).task));
    expect(tasks.filter(Boolean)).toHaveLength(1);
    const claimed = tasks.find(task => task !== null)!;
    expect(claimed.id).toBe(ticket.ticketId);
    const invalid = await request('/complete', { method: 'POST', headers: hostHeaders, body: JSON.stringify({ ticketId: claimed.id, leaseId: claimed.leaseId, resultCommand: { action: 'execute-source', summary: 'Unsafe' } }) });
    expect(invalid.status).toBe(400);
    const completed = await request('/complete', { method: 'POST', headers: hostHeaders, body: JSON.stringify({ ticketId: claimed.id, leaseId: claimed.leaseId, resultCommand: { action: 'recompose-screen', summary: 'Improve hierarchy', preserveLockedNodes: false } }) });
    expect(completed.status).toBe(200);
    const response = await request(`/status/${ticket.ticketId}`, { headers: { Authorization: `Bearer ${ticket.accessToken}` } });
    expect(await response.json()).toMatchObject({ status: 'completed', resultCommand: { preserveLockedNodes: true } });
    expect((await request('/complete', { method: 'POST', headers: hostHeaders, body: JSON.stringify({ ticketId: claimed.id, leaseId: claimed.leaseId, resultCommand: { action: 'recompose-screen', summary: 'Duplicate' } }) })).status).toBe(409);
  });

  it('retains queued work across a backend restart and reclaims expired leases', async () => {
    await heartbeat();
    const ticket = await (await submit()).json() as { ticketId: string; accessToken: string };
    const firstClaim = await (await request('/poll', { headers: hostHeaders })).json() as { task: { leaseId: string } };
    await mf.dispose();
    mf = new Miniflare(config);
    env = { DB: await mf.getD1Database('DB'), TESSELLATE_HOST_SECRET: hostSecret };
    const status = await request(`/status/${ticket.ticketId}`, { headers: { Authorization: `Bearer ${ticket.accessToken}` } });
    expect(await status.json()).toMatchObject({ status: 'processing' });
    await env.DB!.prepare('UPDATE inference_tickets SET leaseUntil=? WHERE id=?').bind(Date.now() - 1, ticket.ticketId).run();
    const nextClaim = await (await request('/poll', { headers: hostHeaders })).json() as { task: { id: string; leaseId: string } };
    expect(nextClaim.task.id).toBe(ticket.ticketId);
    expect(nextClaim.task.leaseId).not.toBe(firstClaim.task.leaseId);
  });

  it('requires the Site gateway secret when the local backend is exposed through a tunnel', async () => {
    const secureEnv = { ...env, TESSELLATE_GATEWAY_SECRET: crypto.randomUUID() + crypto.randomUUID() };
    expect((await app.request('/api/inference/health', undefined, secureEnv)).status).toBe(401);
    expect((await app.request('/api/inference/health', { headers: { 'X-Tessellate-Gateway': secureEnv.TESSELLATE_GATEWAY_SECRET } }, secureEnv)).status).toBe(200);
  });
});
