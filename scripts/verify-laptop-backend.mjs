import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import process from 'node:process';
const { fetch, AbortSignal, setTimeout } = globalThis;

const secretDirectory = path.join(process.env.USERPROFILE, '.tessellate', 'secrets');
const source = await readFile(path.join(secretDirectory, 'api.dev.vars'), 'utf8');
const gateway = source.split(/\r?\n/).find(line => line.startsWith('TESSELLATE_GATEWAY_SECRET=')).split('=')[1];
const headers = { 'X-Tessellate-Gateway': gateway, 'X-Tessellate-Client': 'docker-verification', 'Content-Type': 'application/json' };
const base = 'http://127.0.0.1:8788/api/inference';
const evidence = [];
const request = (url, options = {}) => fetch(base + url, { ...options, headers: { ...headers, ...(options.headers ?? {}) }, signal: AbortSignal.timeout(4000) });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const health = async () => (await request('/health')).json();
const submit = async () => {
  const response = await request('/queue', { method: 'POST', body: JSON.stringify({ prompt: 'Improve visual hierarchy and keep existing structure coherent', screenAst: { id: 'root', nodeType: 'layout', semanticRole: 'screen', children: [], props: {}, slots: {} } }) });
  assert.equal(response.status, 200);
  return response.json();
};
async function completed(ticket) {
  for (let count = 0; count < 30; count++) {
    const response = await request(`/status/${ticket.ticketId}`, { headers: { Authorization: `Bearer ${ticket.accessToken}` } });
    assert.equal(response.status, 200);
    const result = await response.json();
    if (result.status === 'completed') { assert.equal(result.resultCommand.preserveLockedNodes, true); return result; }
    await sleep(500);
  }
  throw new Error('Laptop model did not complete the task');
}
let paused = false;
let apiStopped = false;
try {
  assert.equal((await health()).hostOnline, true);
  const first = await completed(await submit());
  evidence.push({ check: 'real-model-completion', result: 'PASS', action: first.resultCommand.action, preserveLockedNodes: true });
  const rejected = await fetch(base + '/poll', { signal: AbortSignal.timeout(4000) });
  assert.equal(rejected.status, 401);
  evidence.push({ check: 'host-control-authentication', result: 'PASS' });

  execFileSync('docker', ['pause', 'tessellate-laptop-host-1'], { stdio: 'ignore' }); paused = true;
  const durable = await submit();
  execFileSync('docker', ['restart', 'tessellate-laptop-api-1'], { stdio: 'ignore' });
  for (let n = 0; n < 20; n++) { try { if ((await request('/health')).ok) break; } catch { /* Restart briefly disconnects the loopback port. */ } await sleep(500); }
  const restored = await request(`/status/${durable.ticketId}`, { headers: { Authorization: `Bearer ${durable.accessToken}` } });
  assert.equal((await restored.json()).status, 'queued');
  evidence.push({ check: 'queue-survives-api-container-restart', result: 'PASS' });
  await sleep(16000);
  assert.equal((await health()).hostOnline, false);
  const offline = await request('/queue', { method: 'POST', body: JSON.stringify({ prompt: 'Improve hierarchy', screenAst: { id: 'root', nodeType: 'layout', semanticRole: 'screen', children: [], props: {}, slots: {} } }) });
  assert.equal(offline.status, 503);
  evidence.push({ check: 'host-stopped-features-unavailable', result: 'PASS', status: 503, maximumHeartbeatGraceMs: 15000 });
  execFileSync('docker', ['unpause', 'tessellate-laptop-host-1'], { stdio: 'ignore' }); paused = false;
  await completed(durable);
  evidence.push({ check: 'pending-task-recovers-on-host-resume', result: 'PASS' });

  execFileSync('docker', ['stop', 'tessellate-laptop-api-1'], { stdio: 'ignore' }); apiStopped = true;
  let reachable = true;
  try { await request('/health'); } catch { reachable = false; }
  assert.equal(reachable, false);
  evidence.push({ check: 'backend-stopped-network-unavailable', result: 'PASS' });
} finally {
  if (paused) execFileSync('docker', ['unpause', 'tessellate-laptop-host-1'], { stdio: 'ignore' });
  if (apiStopped) execFileSync('docker', ['start', 'tessellate-laptop-api-1'], { stdio: 'ignore' });
}
await mkdir('apps/laptop-backend/evidence', { recursive: true });
await writeFile('apps/laptop-backend/evidence/docker-runtime.json', JSON.stringify({ recordedAt: new Date().toISOString(), checks: evidence }, null, 2));
process.stdout.write(JSON.stringify({ checks: evidence.length, result: 'PASS', evidence: 'apps/laptop-backend/evidence/docker-runtime.json' }) + '\n');
