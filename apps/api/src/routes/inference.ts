import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { IntentCommandSchema, ProjectNodeSchema, DesignDNASchema } from '@tessellate/schemas';
import { verifySecret } from '../secrets.js';
import type { Env } from '../types.js';

export const inferenceRoute = new Hono<{ Bindings: Env }>();
const submitSchema = z.object({ prompt: z.string().trim().min(1).max(2000), screenAst: ProjectNodeSchema, designDna: DesignDNASchema.optional() }).strict();
const heartbeatSchema = z.object({ deviceName: z.string().min(1).max(100), status: z.enum(['idle', 'processing']).default('idle') }).strict();
const completionSchema = z.object({ ticketId: z.string().uuid(), leaseId: z.string().uuid(), resultCommand: IntentCommandSchema }).strict();
const MAX_BODY_BYTES = 96 * 1024;
const HEARTBEAT_TTL = 15000;
type ApiContext = Context<{ Bindings: Env }>;
interface Ticket {
  id: string; tokenNumber: number; clientTokenHash: string; status: string;
  prompt: string; screenAst: string; designDna: string | null; resultCommand: string | null;
  errorMessage: string | null; expiresAt: number; leaseId: string | null;
}
class BodyError extends Error { status: 400 | 413 = 400; }
inferenceRoute.onError((error, c) => {
  if (error instanceof BodyError) return c.json({ error: 'InvalidRequest', message: error.message }, error.status);
  if (error instanceof z.ZodError) return c.json({ error: 'InvalidRequest', issues: error.issues.map(issue => ({ path: issue.path.join('.'), message: issue.message })) }, 400);
  console.error('Inference storage operation failed');
  return c.json({ error: 'BackendUnavailable', message: 'Laptop queue storage is unavailable' }, 503);
});
async function body(c: ApiContext): Promise<unknown> {
  if (Number(c.req.header('Content-Length') ?? 0) > MAX_BODY_BYTES) { const e = new BodyError('Request exceeds 96 KB'); e.status = 413; throw e; }
  const raw = await c.req.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) { const e = new BodyError('Request exceeds 96 KB'); e.status = 413; throw e; }
  try { return JSON.parse(raw); } catch { throw new BodyError('Invalid JSON'); }
}
async function digest(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function expire(db: D1Database, now: number) {
  await db.batch([
    db.prepare("UPDATE inference_tickets SET status='failed', errorMessage='Host task expired', leaseId=NULL WHERE expiresAt<=? AND status IN ('queued','processing')").bind(now),
    db.prepare("DELETE FROM inference_tickets WHERE expiresAt<? AND status IN ('completed','failed')").bind(now - 86400000),
  ]);
}

inferenceRoute.use('*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  if (['/poll', '/heartbeat', '/complete'].includes(c.req.path.replace('/api/inference', '')) &&
      !await verifySecret(c.req.header('X-Host-Secret'), c.env?.TESSELLATE_HOST_SECRET)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  if (!c.env?.DB || !c.env.TESSELLATE_HOST_SECRET) return c.json({ error: 'BackendUnavailable', hostOnline: false, message: 'Laptop backend is not configured' }, 503);
  return next();
});

inferenceRoute.get('/health', async c => {
  const db = c.env.DB!;
  const now = Date.now();
  const host = await db.prepare("SELECT deviceName FROM host_workers WHERE id='laptop' AND lastHeartbeat>?").bind(now - HEARTBEAT_TTL).first<{ deviceName: string }>();
  const pending = await db.prepare("SELECT COUNT(*) AS count FROM inference_tickets WHERE status IN ('queued','processing') AND expiresAt>?").bind(now).first<{ count: number }>();
  return c.json({ apiOnline: true, hostOnline: Boolean(host), activeWorkers: host ? 1 : 0, workerDevice: host?.deviceName ?? null, pendingTasks: pending?.count ?? 0 });
});

inferenceRoute.post('/heartbeat', async c => {
  const data = heartbeatSchema.parse(await body(c));
  await c.env.DB!.prepare("INSERT INTO host_workers(id,deviceName,lastHeartbeat,status) VALUES('laptop',?,?,?) ON CONFLICT(id) DO UPDATE SET deviceName=excluded.deviceName,lastHeartbeat=excluded.lastHeartbeat,status=excluded.status").bind(data.deviceName, Date.now(), data.status).run();
  return c.json({ success: true });
});

inferenceRoute.post('/queue', async c => {
  const data = submitSchema.parse(await body(c));
  const db = c.env.DB!;
  const now = Date.now();
  await expire(db, now);
  const host = await db.prepare("SELECT id FROM host_workers WHERE id='laptop' AND lastHeartbeat>?").bind(now - HEARTBEAT_TTL).first();
  if (!host) return c.json({ error: 'HostUnavailable', message: 'Laptop inference worker is offline' }, 503);
  const clientId = c.req.header('X-Tessellate-Client') ?? 'local';
  const recent = await db.prepare('SELECT COUNT(*) AS count FROM inference_tickets WHERE clientId=? AND createdAtMs>?').bind(clientId, now - 600000).first<{ count: number }>();
  if ((recent?.count ?? 0) >= 30) return c.json({ error: 'RateLimited', message: 'Try again later' }, 429);
  const id = crypto.randomUUID();
  const accessToken = crypto.randomUUID() + crypto.randomUUID();
  const ticket = await db.prepare("INSERT INTO inference_tickets(id,clientTokenHash,clientId,prompt,screenAst,designDna,status,createdAt,createdAtMs,expiresAt) SELECT ?,?,?,?,?,?,'queued',?,?,? WHERE (SELECT COUNT(*) FROM inference_tickets WHERE status IN ('queued','processing') AND expiresAt>?)<64 RETURNING tokenNumber")
    .bind(id, await digest(accessToken), clientId, data.prompt, JSON.stringify(data.screenAst), data.designDna ? JSON.stringify(data.designDna) : null, new Date(now).toISOString(), now, now + 300000, now).first<{ tokenNumber: number }>();
  if (!ticket) return c.json({ error: 'QueueFull', message: 'Laptop queue is full; try later' }, 429);
  const position = await db.prepare("SELECT COUNT(*) AS count FROM inference_tickets WHERE status IN ('queued','processing') AND tokenNumber<=? AND expiresAt>?").bind(ticket.tokenNumber, now).first<{ count: number }>();
  return c.json({ success: true, ticketId: id, accessToken, tokenNumber: ticket.tokenNumber, position: position?.count ?? 1, estimatedWaitSeconds: Math.max(2, (position?.count ?? 1) * 2) });
});

inferenceRoute.get('/status/:ticketId', async c => {
  const db = c.env.DB!;
  await expire(db, Date.now());
  const ticket = await db.prepare('SELECT * FROM inference_tickets WHERE id=?').bind(c.req.param('ticketId')).first<Ticket>();
  const token = c.req.header('Authorization')?.replace(/^Bearer /, '');
  if (!ticket || !token || !await verifySecret(await digest(token), ticket.clientTokenHash)) return c.json({ error: 'NotFound' }, 404);
  const position = await db.prepare("SELECT COUNT(*) AS count FROM inference_tickets WHERE status IN ('queued','processing') AND tokenNumber<? AND expiresAt>?").bind(ticket.tokenNumber, Date.now()).first<{ count: number }>();
  return c.json({ ticketId: ticket.id, tokenNumber: ticket.tokenNumber, status: ticket.status, position: ticket.status === 'queued' ? (position?.count ?? 0) + 1 : 0, resultCommand: ticket.resultCommand ? IntentCommandSchema.parse(JSON.parse(ticket.resultCommand)) : null, errorMessage: ticket.errorMessage });
});

inferenceRoute.get('/poll', async c => {
  const db = c.env.DB!;
  const now = Date.now();
  await expire(db, now);
  const leaseId = crypto.randomUUID();
  const ticket = await db.prepare("UPDATE inference_tickets SET status='processing',leaseId=?,leaseUntil=?,startedAt=? WHERE id=(SELECT id FROM inference_tickets WHERE expiresAt>? AND (status='queued' OR (status='processing' AND leaseUntil<=?)) ORDER BY tokenNumber LIMIT 1) RETURNING *")
    .bind(leaseId, now + 30000, new Date(now).toISOString(), now, now).first<Ticket>();
  return c.json({ task: ticket ? { id: ticket.id, tokenNumber: ticket.tokenNumber, leaseId, prompt: ticket.prompt, screenAst: JSON.parse(ticket.screenAst), designDna: ticket.designDna ? JSON.parse(ticket.designDna) : {} } : null });
});

inferenceRoute.post('/complete', async c => {
  const data = completionSchema.parse(await body(c));
  const command = { ...data.resultCommand, preserveLockedNodes: true };
  const result = await c.env.DB!.prepare("UPDATE inference_tickets SET status='completed',resultCommand=?,completedAt=?,leaseId=NULL WHERE id=? AND leaseId=? AND status='processing' AND leaseUntil>? RETURNING id")
    .bind(JSON.stringify(command), new Date().toISOString(), data.ticketId, data.leaseId, Date.now()).first<{ id: string }>();
  if (!result) return c.json({ error: 'LeaseExpired', message: 'Task lease is no longer active' }, 409);
  return c.json({ success: true, ticketId: result.id });
});
