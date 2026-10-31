import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import { Miniflare } from 'miniflare';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import app from '../index.js';
import type { Env } from '../types.js';

describe('durable laptop inference API', () => {
  const hostSecret = crypto.randomUUID() + crypto.randomUUID();
  const gatewaySecret = crypto.randomUUID() + crypto.randomUUID();
  const hostHeaders = { 'X-Host-Secret': hostSecret, 'Content-Type': 'application/json' };
  const directory = mkdtempSync(path.join(tmpdir(), 'tess-laptop-queue-'));
  const config = { modules: true, script: 'export default {fetch(){return new Response("binding test")}}', d1Databases: { DB: 'laptop-test' }, d1Persist: directory, compatibilityDate: '2026-05-15' };
  let mf: Miniflare;
  let env: Env;
  const payload = { prompt: 'Improve the screen hierarchy', screenAst: { id: 'root', nodeType: 'layout', semanticRole: 'screen', children: [], props: {}, slots: {} } };
  const request = (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (!['/poll', '/heartbeat', '/complete'].includes(url)) headers.set('X-Tessellate-Gateway', gatewaySecret);
    return app.request(`/api/inference${url}`, { ...init, headers }, env);
  };
  const heartbeat = () => request('/heartbeat', { method: 'POST', headers: hostHeaders, body: JSON.stringify({ deviceName: 'test laptop', status: 'idle' }) });
  const submit = () => request('/queue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

  beforeAll(async () => {
    mf = new Miniflare(config);
    env = { DB: await mf.getD1Database('DB'), TESSELLATE_HOST_SECRET: hostSecret, TESSELLATE_GATEWAY_SECRET: gatewaySecret };
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

  it('requires the server gateway for client queue routes and a configured gateway before exposing them', async () => {
    const unauthorized = await app.request('/api/inference/health', undefined, env);
    expect(unauthorized.status).toBe(401);
    expect((await unauthorized.json() as { error: string }).error).toBe('Unauthorized');

    const noGateway: Env = { DB: env.DB, TESSELLATE_HOST_SECRET: hostSecret };
    expect((await app.request('/api/inference/health', undefined, noGateway)).status).toBe(503);
    expect((await app.request('/api/inference/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, noGateway)).status).toBe(503);

    // The private worker protocol continues to use its dedicated host secret.
    expect((await app.request('/api/inference/heartbeat', {
      method: 'POST',
      headers: hostHeaders,
      body: JSON.stringify({ deviceName: 'test laptop', status: 'idle' }),
    }, noGateway)).status).toBe(200);
  });

  it('rejects non-actionable intent before it enters the durable queue', async () => {
    await heartbeat();
    for (const prompt of ['Do not lock the header', 'What does the Surprise Me command do?', 'Leave the current design as it is']) {
      const response = await request('/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, prompt }),
      });
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'AmbiguousPrompt' });
    }
    const queued = await env.DB!.prepare('SELECT COUNT(*) AS count FROM inference_tickets').first<{ count: number }>();
    expect(queued?.count).toBe(0);
  });

  it('rejects a deeply nested screen tree without overflowing recursive validation', async () => {
    let screenAst: unknown = { id: 'leaf', nodeType: 'element', semanticRole: 'text', children: [], props: {}, slots: {} };
    for (let depth = 0; depth < 999; depth += 1) {
      screenAst = { id: `deep-${depth}`, nodeType: 'layout', semanticRole: 'section', children: [screenAst], props: {}, slots: {} };
    }

    const response = await request('/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, screenAst }),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: 'InvalidRequest' });
    const queued = await env.DB!.prepare('SELECT COUNT(*) AS count FROM inference_tickets').first<{ count: number }>();
    expect(queued?.count).toBe(0);
  });

  it('cancels queued or leased jobs with the client token and rejects stale completions', async () => {
    await heartbeat();
    const queuedTicket = await (await submit()).json() as { ticketId: string; accessToken: string };
    const denied = await request(`/cancel/${queuedTicket.ticketId}`, {
      method: 'POST',
      headers: { Authorization: 'Bearer wrong-token' },
    });
    expect(denied.status).toBe(404);

    const cancelled = await request(`/cancel/${queuedTicket.ticketId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${queuedTicket.accessToken}` },
    });
    expect(cancelled.status).toBe(200);
    expect((await request(`/status/${queuedTicket.ticketId}`, {
      headers: { Authorization: `Bearer ${queuedTicket.accessToken}` },
    })).status).toBe(200);
    expect((await (await request(`/status/${queuedTicket.ticketId}`, {
      headers: { Authorization: `Bearer ${queuedTicket.accessToken}` },
    })).json())).toMatchObject({ status: 'failed', errorMessage: 'Request cancelled by client' });
    expect((await request(`/cancel/${queuedTicket.ticketId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${queuedTicket.accessToken}` },
    })).status).toBe(409);

    const leasedTicket = await (await submit()).json() as { ticketId: string; accessToken: string };
    const claim = await (await request('/poll', { headers: hostHeaders })).json() as { task: { id: string; leaseId: string } };
    expect(claim.task.id).toBe(leasedTicket.ticketId);
    expect((await request(`/cancel/${leasedTicket.ticketId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${leasedTicket.accessToken}` },
    })).status).toBe(200);
    expect((await request('/complete', {
      method: 'POST',
      headers: hostHeaders,
      body: JSON.stringify({ ticketId: claim.task.id, leaseId: claim.task.leaseId, resultCommand: { action: 'recompose-screen', summary: 'Late result' } }),
    })).status).toBe(409);
  });

  it('enforces the global active queue cap under concurrent submissions', async () => {
    await heartbeat();
    const submissions = Array.from({ length: 66 }, (_, index) => () => request('/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tessellate-Client': `test-client-${index}`,
      },
      body: JSON.stringify(payload),
    }));
    const responses: Response[] = [];
    // Miniflare exposes D1 to this in-process Hono test through a synchronous
    // proxy. Keep concurrent fan-out bounded while still submitting all 66
    // independent clients and asserting the global cap under contention. Keep
    // the worker heartbeat fresh so the test exercises the queue ceiling rather
    // than the separate offline-host timeout when the suite is under load.
    for (let offset = 0; offset < submissions.length; offset += 8) {
      if (offset > 0) await heartbeat();
      responses.push(...await Promise.all(submissions.slice(offset, offset + 8).map(submitRequest => submitRequest())));
    }
    expect(responses.filter(response => response.status === 200)).toHaveLength(64);
    expect(responses.filter(response => response.status === 429)).toHaveLength(2);
    const queued = await env.DB!.prepare('SELECT COUNT(*) AS count FROM inference_tickets WHERE status IN (\'queued\', \'processing\')').first<{ count: number }>();
    expect(queued?.count).toBe(64);
  }, 30000);

  it('marks an offline host unavailable and accepts tasks only while its heartbeat is current', async () => {
    expect((await submit()).status).toBe(503);
    expect((await heartbeat()).status).toBe(200);
    expect((await (await request('/health')).json())).toMatchObject({ apiOnline: true, hostOnline: true });
    await env.DB!.prepare('UPDATE host_workers SET lastHeartbeat=?').bind(Date.now() - 16000).run();
    expect((await (await request('/health')).json())).toMatchObject({ hostOnline: false });
    expect((await submit()).status).toBe(503);
  });

  it('fails closed when an active laptop heartbeat contains non-text stored metadata', async () => {
    expect((await heartbeat()).status).toBe(200);
    await env.DB!.prepare("UPDATE host_workers SET deviceName = X'0102' WHERE id='laptop'").run();

    const health = await request('/health');

    expect(health.status).toBe(503);
    expect(await health.json()).toMatchObject({ error: 'QueueDataUnavailable' });
  });

  it('fails closed when an authenticated queue status contains a non-text stored error', async () => {
    await heartbeat();
    const submitted = await submit();
    const ticket = await submitted.json() as { ticketId: string; accessToken: string };
    await env.DB!.prepare("UPDATE inference_tickets SET status = 'failed', errorMessage = X'0102' WHERE id = ?")
      .bind(ticket.ticketId).run();

    const status = await request(`/status/${ticket.ticketId}`, {
      headers: { Authorization: `Bearer ${ticket.accessToken}` },
    });

    expect(status.status).toBe(503);
    expect(await status.json()).toMatchObject({ error: 'QueueDataUnavailable' });
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

  it('terminates a current lease when the worker cannot produce a schema-valid proposal', async () => {
    await heartbeat();
    const ticket = await (await submit()).json() as { ticketId: string; accessToken: string };
    const claim = await (await request('/poll', { headers: hostHeaders })).json() as { task: { id: string; leaseId: string } };
    const invalidCompletion = await request('/complete', {
      method: 'POST',
      headers: hostHeaders,
      body: JSON.stringify({
        ticketId: claim.task.id,
        leaseId: claim.task.leaseId,
        resultCommand: { action: 'adjust-dna', summary: 'Adjust DNA', confidence: 0.2, divergenceLevel: 50 },
      }),
    });
    expect(invalidCompletion.status).toBe(400);

    const failed = await request('/fail', {
      method: 'POST',
      headers: hostHeaders,
      body: JSON.stringify({ ticketId: claim.task.id, leaseId: claim.task.leaseId, failureCode: 'invalid-result' }),
    });
    expect(failed.status).toBe(200);
    const status = await request(`/status/${ticket.ticketId}`, {
      headers: { Authorization: `Bearer ${ticket.accessToken}` },
    });
    expect(await status.json()).toMatchObject({
      status: 'failed',
      errorMessage: 'Laptop worker returned a proposal that did not match the shared command contract.',
    });
    expect((await request('/complete', {
      method: 'POST',
      headers: hostHeaders,
      body: JSON.stringify({ ticketId: claim.task.id, leaseId: claim.task.leaseId, resultCommand: { action: 'recompose-screen', summary: 'Late retry' } }),
    })).status).toBe(409);
  });

  it('skips corrupted queued records and fails closed on corrupted completed results', async () => {
    await heartbeat();
    const malformedAst = await (await submit()).json() as { ticketId: string; accessToken: string };
    const invalidDna = await (await submit()).json() as { ticketId: string; accessToken: string };
    const malformedPrompt = await (await submit()).json() as { ticketId: string; accessToken: string };
    const validTicket = await (await submit()).json() as { ticketId: string; accessToken: string };
    await env.DB!.prepare('UPDATE inference_tickets SET screenAst = ? WHERE id = ?')
      .bind('{not-json', malformedAst.ticketId).run();
    await env.DB!.prepare('UPDATE inference_tickets SET designDna = ? WHERE id = ?')
      .bind('{}', invalidDna.ticketId).run();
    await env.DB!.prepare("UPDATE inference_tickets SET prompt = X'0102' WHERE id = ?")
      .bind(malformedPrompt.ticketId).run();

    const poll = await request('/poll', { headers: hostHeaders });
    const claim = await poll.json() as { task: { id: string; leaseId: string } | null };
    const stored = await env.DB!.prepare('SELECT id, status, errorMessage FROM inference_tickets WHERE id IN (?, ?, ?) ORDER BY tokenNumber')
      .bind(malformedAst.ticketId, invalidDna.ticketId, malformedPrompt.ticketId)
      .all<{ id: string; status: string; errorMessage: string | null }>();

    expect(poll.status).toBe(200);
    expect(claim.task?.id).toBe(validTicket.ticketId);
    expect(stored.results).toHaveLength(3);
    expect(stored.results.every((ticket) => ticket.status === 'failed' && ticket.errorMessage))
      .toBe(true);

    const complete = await request('/complete', {
      method: 'POST',
      headers: hostHeaders,
      body: JSON.stringify({
        ticketId: claim.task!.id,
        leaseId: claim.task!.leaseId,
        resultCommand: { action: 'recompose-screen', summary: 'Improve hierarchy' },
      }),
    });
    expect(complete.status).toBe(200);
    await env.DB!.prepare('UPDATE inference_tickets SET resultCommand = ? WHERE id = ?')
      .bind('{not-json', validTicket.ticketId).run();
    const status = await request(`/status/${validTicket.ticketId}`, {
      headers: { Authorization: `Bearer ${validTicket.accessToken}` },
    });

    expect(status.status).toBe(503);
    expect(await status.json()).toMatchObject({ error: 'QueueDataUnavailable' });
  });

  it('retains queued work across a backend restart and reclaims expired leases', async () => {
    await heartbeat();
    const ticket = await (await submit()).json() as { ticketId: string; accessToken: string };
    const firstClaim = await (await request('/poll', { headers: hostHeaders })).json() as { task: { leaseId: string } };
    await mf.dispose();
    mf = new Miniflare(config);
    env = { DB: await mf.getD1Database('DB'), TESSELLATE_HOST_SECRET: hostSecret, TESSELLATE_GATEWAY_SECRET: gatewaySecret };
    const status = await request(`/status/${ticket.ticketId}`, { headers: { Authorization: `Bearer ${ticket.accessToken}` } });
    expect(await status.json()).toMatchObject({ status: 'processing' });
    await env.DB!.prepare('UPDATE inference_tickets SET leaseUntil=? WHERE id=?').bind(Date.now() - 1, ticket.ticketId).run();
    const nextClaim = await (await request('/poll', { headers: hostHeaders })).json() as { task: { id: string; leaseId: string } };
    expect(nextClaim.task.id).toBe(ticket.ticketId);
    expect(nextClaim.task.leaseId).not.toBe(firstClaim.task.leaseId);
  }, 30000);

  it('requires the Site gateway secret when the local backend is exposed through a tunnel', async () => {
    const secureEnv = { ...env, TESSELLATE_GATEWAY_SECRET: crypto.randomUUID() + crypto.randomUUID() };
    expect((await app.request('/api/inference/health', undefined, secureEnv)).status).toBe(401);
    expect((await app.request('/api/inference/health', { headers: { 'X-Tessellate-Gateway': secureEnv.TESSELLATE_GATEWAY_SECRET } }, secureEnv)).status).toBe(200);
  });
});
