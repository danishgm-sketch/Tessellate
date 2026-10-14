import { describe, it, expect, beforeEach } from 'vitest';
import { request, TEST_ENV, UNCONFIGURED_PRODUCTION_ENV } from './helpers.js';
import { resetInferenceStateForTests, QUEUE_LIMITS } from '../routes/inference.js';
import type { Env } from '../types.js';

const DAEMON = { Authorization: `Bearer ${TEST_ENV.DAEMON_DEV_TOKEN}`, 'Content-Type': 'application/json' };
const ALICE = { Authorization: 'Bearer test-user-alice', 'Content-Type': 'application/json' };
const BOB = { Authorization: 'Bearer test-user-bob', 'Content-Type': 'application/json' };

interface EnqueueResponse {
  ticketId: string;
  ticketToken: string;
  tokenNumber: number;
  position: number;
  estimatedWaitSeconds: number;
}

async function enqueue(headers: Record<string, string>, body: unknown = { prompt: 'make it calmer' }, env: Env = TEST_ENV) {
  return request('/api/inference/queue', { method: 'POST', headers, body: JSON.stringify(body) }, env);
}

const validCommand = { action: 'apply-feel', summary: 'Calmer feel', feelDescriptors: 'calm', preserveLockedNodes: true };

describe('Inference queue (D-033/D-035)', () => {
  beforeEach(() => resetInferenceStateForTests());

  it('runs the full lifecycle: enqueue → claim → complete → owner reads result', async () => {
    const health0 = (await (await request('/api/inference/health')).json()) as { hostOnline: boolean };
    expect(health0.hostOnline).toBe(false);

    const res = await enqueue(ALICE);
    expect(res.status).toBe(202);
    const ticket = (await res.json()) as EnqueueResponse;
    expect(ticket.ticketToken.length).toBeGreaterThan(30);
    expect(ticket.position).toBe(1);

    const poll = await request('/api/inference/poll', { headers: DAEMON });
    const { task } = (await poll.json()) as { task: { id: string; prompt: string; kind: string } };
    expect(task.id).toBe(ticket.ticketId);
    expect(task.prompt).toBe('make it calmer');
    expect(task.kind).toBe('intent-command');

    const health1 = (await (await request('/api/inference/health')).json()) as { hostOnline: boolean };
    expect(health1.hostOnline).toBe(true);

    const done = await request('/api/inference/complete', {
      method: 'POST',
      headers: DAEMON,
      body: JSON.stringify({ ticketId: ticket.ticketId, result: validCommand }),
    });
    expect(done.status).toBe(200);

    const status = await request(`/api/inference/tickets/${ticket.ticketId}`, { headers: ALICE });
    const body = (await status.json()) as { status: string; result: { action: string } };
    expect(body.status).toBe('completed');
    expect(body.result.action).toBe('apply-feel');
  });

  it('lets the submitter read via the ticket token, but hides the ticket from everyone else', async () => {
    const ticket = (await (await enqueue(ALICE)).json()) as EnqueueResponse;
    const viaToken = await request(`/api/inference/tickets/${ticket.ticketId}`, { headers: { 'X-Ticket-Token': ticket.ticketToken } });
    expect(viaToken.status).toBe(200);
    expect((await request(`/api/inference/tickets/${ticket.ticketId}`, { headers: BOB })).status).toBe(404);
    expect((await request(`/api/inference/tickets/${ticket.ticketId}`)).status).toBe(404);
    expect((await request(`/api/inference/tickets/${ticket.ticketId}`, { headers: { 'X-Ticket-Token': 'guess' } })).status).toBe(404);
  });

  it('rejects daemon endpoints without a valid device token (the old shared secret is gone)', async () => {
    await enqueue(ALICE);
    const attempts: Record<string, string>[] = [{}, { Authorization: 'Bearer wrong' }, { 'X-Host-Secret': 'tessellate_owner_secret_dev' }];
    for (const headers of attempts) {
      expect((await request('/api/inference/poll', { headers })).status).toBe(401);
      expect((await request('/api/inference/heartbeat', { method: 'POST', headers })).status).toBe(401);
    }
  });

  it('never accepts the development daemon token in production', async () => {
    const res = await request('/api/inference/poll', { headers: DAEMON }, { DAEMON_DEV_TOKEN: TEST_ENV.DAEMON_DEV_TOKEN });
    expect(res.status).toBe(503); // production without D1 refuses to run an in-memory queue at all
    const health = await request('/api/inference/health', {}, UNCONFIGURED_PRODUCTION_ENV);
    expect(health.status).toBe(503);
  });

  it('requires a session or a Turnstile pass to enqueue in production', async () => {
    const env: Env = { ENVIRONMENT: 'development' };
    // Development without Turnstile allows guests; production without Turnstile refuses them.
    expect((await enqueue({ 'Content-Type': 'application/json' }, undefined, env)).status).toBe(202);
    resetInferenceStateForTests();
    const prod = await enqueue({ 'Content-Type': 'application/json' }, undefined, UNCONFIGURED_PRODUCTION_ENV);
    expect([403, 503]).toContain(prod.status);
  });

  it('validates payloads: empty prompt, oversized prompt and oversized context are refused', async () => {
    expect((await enqueue(ALICE, { prompt: '   ' })).status).toBe(400);
    expect((await enqueue(ALICE, { prompt: 'x'.repeat(QUEUE_LIMITS.maxPromptChars + 1) })).status).toBe(400);
    const bigContext = { blob: 'x'.repeat(QUEUE_LIMITS.maxContextBytes + 10) };
    expect((await enqueue(ALICE, { prompt: 'ok', context: bigContext })).status).toBe(413);
    expect((await enqueue(ALICE, { prompt: 'ok', kind: 'run-shell' })).status).toBe(400);
  });

  it('caps active tickets per user and rate-limits bursts', async () => {
    for (let i = 0; i < QUEUE_LIMITS.maxActivePerUser; i++) expect((await enqueue(ALICE)).status).toBe(202);
    expect((await enqueue(ALICE)).status).toBe(429);
    // Bob is unaffected by Alice's cap.
    expect((await enqueue(BOB)).status).toBe(202);

    resetInferenceStateForTests();
    const statuses: number[] = [];
    for (let i = 0; i < QUEUE_LIMITS.enqueuePerMinute + 2; i++) {
      const r = await enqueue(ALICE);
      statuses.push(r.status);
      // Drain so the per-user active cap does not mask the rate limit.
      const poll = (await (await request('/api/inference/poll', { headers: DAEMON })).json()) as { task: { id: string } | null };
      if (poll.task) {
        await request('/api/inference/complete', { method: 'POST', headers: DAEMON, body: JSON.stringify({ ticketId: poll.task.id, result: validCommand }) });
      }
    }
    expect(statuses).toContain(429);
  });

  it('rejects malformed daemon results and records the failure instead of applying them', async () => {
    const ticket = (await (await enqueue(ALICE)).json()) as EnqueueResponse;
    await request('/api/inference/poll', { headers: DAEMON });
    const bad = await request('/api/inference/complete', {
      method: 'POST',
      headers: DAEMON,
      body: JSON.stringify({ ticketId: ticket.ticketId, result: { action: 'delete-everything' } }),
    });
    expect(bad.status).toBe(422);
    const status = (await (await request(`/api/inference/tickets/${ticket.ticketId}`, { headers: ALICE })).json()) as { status: string; result?: unknown };
    expect(status.status).toBe('failed');
    expect(status.result).toBeUndefined();
  });

  it('allows the submitter to cancel a queued ticket, but not a claimed one', async () => {
    const a = (await (await enqueue(ALICE)).json()) as EnqueueResponse;
    expect((await request(`/api/inference/tickets/${a.ticketId}`, { method: 'DELETE', headers: ALICE })).status).toBe(200);
    const b = (await (await enqueue(ALICE)).json()) as EnqueueResponse;
    await request('/api/inference/poll', { headers: DAEMON });
    expect((await request(`/api/inference/tickets/${b.ticketId}`, { method: 'DELETE', headers: ALICE })).status).toBe(409);
  });
});
