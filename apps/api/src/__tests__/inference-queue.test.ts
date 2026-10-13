import { describe, it, expect } from 'vitest';
import app from '../index.js';

describe('Bespoke ML Host Queue & Token API', () => {
  it('handles complete queue lifecycle from task submission to host execution', async () => {
    // 1. Initial health check (before heartbeat)
    const healthRes = await app.request('/api/inference/health');
    expect(healthRes.status).toBe(200);
    const healthData = (await healthRes.json()) as any;
    expect(healthData.hostOnline).toBe(false);

    // 2. Host daemon sends heartbeat
    const hbRes = await app.request('/api/inference/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Host-Secret': 'tessellate_owner_secret_dev',
      },
      body: JSON.stringify({ deviceName: 'MacBook-Pro-M3-Host' }),
    });
    expect(hbRes.status).toBe(200);

    // 3. Health check should now reflect host online
    const healthAfterRes = await app.request('/api/inference/health');
    const healthAfter = (await healthAfterRes.json()) as any;
    expect(healthAfter.hostOnline).toBe(true);
    expect(healthAfter.activeWorkers).toBe(1);

    // 4. User submits task to queue
    const queueRes = await app.request('/api/inference/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'recompose screen with higher data density',
        screenAst: { id: 'root', semanticRole: 'layout' },
      }),
    });
    expect(queueRes.status).toBe(200);
    const queueData = (await queueRes.json()) as any;
    expect(queueData.success).toBe(true);
    expect(queueData.tokenNumber).toBeGreaterThanOrEqual(1);
    expect(queueData.ticketId).toBeDefined();

    // 5. User checks status — should be queued
    const statusRes = await app.request(`/api/inference/status/${queueData.ticketId}`);
    expect(statusRes.status).toBe(200);
    const statusData = (await statusRes.json()) as any;
    expect(statusData.status).toBe('queued');

    // 6. Host daemon polls task
    const pollRes = await app.request('/api/inference/poll', {
      method: 'GET',
      headers: { 'X-Host-Secret': 'tessellate_owner_secret_dev' },
    });
    expect(pollRes.status).toBe(200);
    const pollData = (await pollRes.json()) as any;
    expect(pollData.task).toBeDefined();
    expect(pollData.task.id).toBe(queueData.ticketId);

    // 7. Host daemon completes task
    const completeRes = await app.request('/api/inference/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Host-Secret': 'tessellate_owner_secret_dev',
      },
      body: JSON.stringify({
        ticketId: queueData.ticketId,
        resultCommand: {
          action: 'recompose-screen',
          summary: 'Applied high density recomposition.',
          confidence: 0.95,
          divergenceLevel: 50,
        },
      }),
    });
    expect(completeRes.status).toBe(200);

    // 8. User checks status — should now be completed
    const finalStatusRes = await app.request(`/api/inference/status/${queueData.ticketId}`);
    expect(finalStatusRes.status).toBe(200);
    const finalStatus = (await finalStatusRes.json()) as any;
    expect(finalStatus.status).toBe('completed');
    expect(finalStatus.resultCommand.action).toBe('recompose-screen');
  });
});
