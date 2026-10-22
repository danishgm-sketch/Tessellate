import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { IntentCommandSchema, ProjectNodeSchema, DesignDNASchema, isNonActionableIntentPrompt } from '@tessellate/schemas';
import { verifySecret } from '../secrets.js';
import type { Env } from '../types.js';
import { enforceApiRateLimit, publicClientRateLimitKey } from '../rate-limit.js';

export const inferenceRoute = new Hono<{ Bindings: Env }>();
const MAX_BODY_BYTES = 96 * 1024;
const submitSchema = z.object({ prompt: z.string().trim().min(1).max(2000), screenAst: ProjectNodeSchema, designDna: DesignDNASchema.optional() }).strict();
const heartbeatSchema = z.object({ deviceName: z.string().min(1).max(100), status: z.enum(['idle', 'processing']).default('idle') }).strict();
const storedTicketSchema = z.object({
  id: z.string().uuid(),
  tokenNumber: z.number().int().positive(),
  clientTokenHash: z.string().regex(/^[0-9a-f]{64}$/),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  prompt: z.string().trim().min(1).max(2000),
  screenAst: z.string().min(1).max(MAX_BODY_BYTES),
  designDna: z.string().max(MAX_BODY_BYTES).nullable(),
  resultCommand: z.string().max(MAX_BODY_BYTES).nullable(),
  errorMessage: z.string().max(256).nullable(),
  expiresAt: z.number().int().nonnegative(),
  leaseId: z.string().uuid().nullable(),
});
const completionSchema = z.object({ ticketId: z.string().uuid(), leaseId: z.string().uuid(), resultCommand: IntentCommandSchema }).strict();
const failureSchema = z.object({ ticketId: z.string().uuid(), leaseId: z.string().uuid(), failureCode: z.enum(['invalid-result', 'worker-error']) }).strict();
const HEARTBEAT_TTL = 15000;
const MAX_ACTIVE_QUEUE = 64;
const storedHostHeartbeatSchema = z.object({
  deviceName: z.string().min(1).max(100),
  lastHeartbeat: z.number().int().nonnegative(),
}).strict();
type ApiContext = Context<{ Bindings: Env }>;
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
function bearerToken(header: string | undefined): string | null {
  const match = /^Bearer ([^\s]+)$/i.exec(header ?? '');
  return match?.[1] ?? null;
}
async function expire(db: D1Database, now: number) {
  await db.batch([
    db.prepare("UPDATE inference_tickets SET status='failed', errorMessage='Host task expired', leaseId=NULL WHERE expiresAt<=? AND status IN ('queued','processing')").bind(now),
    db.prepare("DELETE FROM inference_tickets WHERE expiresAt<? AND status IN ('completed','failed')").bind(now - 86400000),
  ]);
}

inferenceRoute.use('*', async (c, next) => {
  c.header('Cache-Control', 'no-store');
  const route = c.req.path.replace('/api/inference', '');
  const hostControl = ['/poll', '/heartbeat', '/complete', '/fail'].includes(route);
  if (hostControl) {
    if (!await verifySecret(c.req.header('X-Host-Secret'), c.env?.TESSELLATE_HOST_SECRET)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
  } else {
    if (!c.env?.TESSELLATE_GATEWAY_SECRET) {
      return c.json({ error: 'BackendUnavailable', message: 'Inference gateway is not configured' }, 503);
    }
    if (!await verifySecret(c.req.header('X-Tessellate-Gateway'), c.env.TESSELLATE_GATEWAY_SECRET)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    if (route === '/health' || route === '/queue' || route.startsWith('/status/') || route.startsWith('/cancel/')) {
      const rateLimitResponse = await enforceApiRateLimit(
        c.env,
        'API_CLIENT_LIMITER',
        publicClientRateLimitKey(c.env, c.req.raw)
      );
      if (rateLimitResponse) return rateLimitResponse;
    }
  }
  if (!c.env?.DB || !c.env.TESSELLATE_HOST_SECRET) return c.json({ error: 'BackendUnavailable', hostOnline: false, message: 'Laptop backend is not configured' }, 503);
  return next();
});

inferenceRoute.get('/health', async c => {
  const db = c.env.DB!;
  const now = Date.now();
  const storedHost = await db.prepare("SELECT deviceName, lastHeartbeat FROM host_workers WHERE id='laptop' AND lastHeartbeat>?").bind(now - HEARTBEAT_TTL).first<unknown>();
  const parsedHost = storedHost === null ? null : storedHostHeartbeatSchema.safeParse(storedHost);
  if (parsedHost && !parsedHost.success) {
    return c.json({ error: 'QueueDataUnavailable', message: 'Saved laptop status failed validation.' }, 503);
  }
  const host = parsedHost?.success ? parsedHost.data : null;
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
  if (isNonActionableIntentPrompt(data.prompt)) {
    return c.json({ error: 'AmbiguousPrompt', message: 'Questions, negated intent, and requests to keep the current design are not sent to the laptop model. Rephrase as a direct request; your project was not changed.' }, 400);
  }
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
  const ticket = await db.prepare("INSERT INTO inference_tickets(id,clientTokenHash,clientId,prompt,screenAst,designDna,status,createdAt,createdAtMs,expiresAt) SELECT ?,?,?,?,?,?,'queued',?,?,? WHERE (SELECT COUNT(*) FROM inference_tickets WHERE status IN ('queued','processing') AND expiresAt>?)<? RETURNING tokenNumber")
    .bind(id, await digest(accessToken), clientId, data.prompt, JSON.stringify(data.screenAst), data.designDna ? JSON.stringify(data.designDna) : null, new Date(now).toISOString(), now, now + 300000, now, MAX_ACTIVE_QUEUE).first<{ tokenNumber: number }>();
  if (!ticket) return c.json({ error: 'QueueFull', message: 'Laptop queue is full; try later' }, 429);
  const position = await db.prepare("SELECT COUNT(*) AS count FROM inference_tickets WHERE status IN ('queued','processing') AND tokenNumber<=? AND expiresAt>?").bind(ticket.tokenNumber, now).first<{ count: number }>();
  return c.json({ success: true, ticketId: id, accessToken, tokenNumber: ticket.tokenNumber, position: position?.count ?? 1, estimatedWaitSeconds: Math.max(2, (position?.count ?? 1) * 2) });
});

inferenceRoute.get('/status/:ticketId', async c => {
  const db = c.env.DB!;
  await expire(db, Date.now());
  const storedTicket = await db.prepare('SELECT * FROM inference_tickets WHERE id=?').bind(c.req.param('ticketId')).first<unknown>();
  const token = bearerToken(c.req.header('Authorization'));
  const clientTokenHash = storedTicket && typeof storedTicket === 'object'
    ? (storedTicket as { clientTokenHash?: unknown }).clientTokenHash
    : undefined;
  if (!token || typeof clientTokenHash !== 'string' || !/^[0-9a-f]{64}$/.test(clientTokenHash) || !await verifySecret(await digest(token), clientTokenHash)) {
    return c.json({ error: 'NotFound' }, 404);
  }
  const parsedTicket = storedTicketSchema.safeParse(storedTicket);
  if (!parsedTicket.success) return c.json({ error: 'QueueDataUnavailable', message: 'The saved laptop task failed validation.' }, 503);
  const ticket = parsedTicket.data;
  const position = await db.prepare("SELECT COUNT(*) AS count FROM inference_tickets WHERE status IN ('queued','processing') AND tokenNumber<? AND expiresAt>?").bind(ticket.tokenNumber, Date.now()).first<{ count: number }>();
  let resultCommand: z.infer<typeof IntentCommandSchema> | null = null;
  if (ticket.status === 'completed') {
    let storedResult: unknown;
    try {
      if (!ticket.resultCommand) throw new Error('Missing result');
      storedResult = JSON.parse(ticket.resultCommand) as unknown;
    } catch {
      return c.json({ error: 'QueueDataUnavailable', message: 'The saved laptop result failed validation.' }, 503);
    }
    const parsedResult = IntentCommandSchema.safeParse(storedResult);
    if (!parsedResult.success) {
      return c.json({ error: 'QueueDataUnavailable', message: 'The saved laptop result failed validation.' }, 503);
    }
    resultCommand = parsedResult.data;
  }
  return c.json({ ticketId: ticket.id, tokenNumber: ticket.tokenNumber, status: ticket.status, position: ticket.status === 'queued' ? (position?.count ?? 0) + 1 : 0, resultCommand, errorMessage: ticket.errorMessage });
});

inferenceRoute.post('/cancel/:ticketId', async c => {
  const ticketId = z.string().uuid().parse(c.req.param('ticketId'));
  const token = bearerToken(c.req.header('Authorization'));
  if (!token) return c.json({ error: 'NotFound' }, 404);
  const db = c.env.DB!;
  const tokenHash = await digest(token);
  const cancelled = await db.prepare("UPDATE inference_tickets SET status='failed',errorMessage='Request cancelled by client',leaseId=NULL,leaseUntil=NULL WHERE id=? AND clientTokenHash=? AND status IN ('queued','processing') RETURNING id")
    .bind(ticketId, tokenHash).first<{ id: string }>();
  if (cancelled) return c.json({ success: true, ticketId: cancelled.id, status: 'failed' });
  const owned = await db.prepare('SELECT status FROM inference_tickets WHERE id=? AND clientTokenHash=?').bind(ticketId, tokenHash).first<{ status: string }>();
  if (!owned) return c.json({ error: 'NotFound' }, 404);
  return c.json({ error: 'NotCancellable', message: 'This laptop request has already finished.' }, 409);
});

inferenceRoute.get('/poll', async c => {
  const db = c.env.DB!;
  const now = Date.now();
  await expire(db, now);
  // A corrupt oldest row must not repeatedly fail worker polling. Fail that
  // ticket explicitly, then continue to the next bounded queue candidate.
  for (let attempt = 0; attempt < MAX_ACTIVE_QUEUE; attempt += 1) {
    const leaseId = crypto.randomUUID();
    const claimedTicket = await db.prepare("UPDATE inference_tickets SET status='processing',leaseId=?,leaseUntil=?,startedAt=? WHERE id=(SELECT id FROM inference_tickets WHERE expiresAt>? AND (status='queued' OR (status='processing' AND leaseUntil<=?)) ORDER BY tokenNumber LIMIT 1) RETURNING *")
      .bind(leaseId, now + 30000, new Date(now).toISOString(), now, now).first<unknown>();
    if (!claimedTicket) return c.json({ task: null });
    const parsedTicket = storedTicketSchema.safeParse(claimedTicket);
    if (!parsedTicket.success) {
      const tokenNumber = claimedTicket && typeof claimedTicket === 'object'
        ? (claimedTicket as { tokenNumber?: unknown }).tokenNumber
        : undefined;
      if (typeof tokenNumber !== 'number' || !Number.isSafeInteger(tokenNumber) || tokenNumber < 1) {
        return c.json({ error: 'QueueDataUnavailable', message: 'The saved laptop task failed validation.' }, 503);
      }
      await db.prepare("UPDATE inference_tickets SET status='failed',errorMessage='Saved request data failed validation',leaseId=NULL,leaseUntil=NULL,completedAt=? WHERE tokenNumber=? AND leaseId=? AND status='processing'")
        .bind(new Date().toISOString(), tokenNumber, leaseId).run();
      continue;
    }
    const ticket = parsedTicket.data;

    let screenAstValue: unknown;
    let designDnaValue: unknown = {};
    try {
      screenAstValue = JSON.parse(ticket.screenAst) as unknown;
      if (ticket.designDna !== null) designDnaValue = JSON.parse(ticket.designDna) as unknown;
    } catch {
      screenAstValue = undefined;
    }
    const screenAst = ProjectNodeSchema.safeParse(screenAstValue);
    const designDna = ticket.designDna === null ? null : DesignDNASchema.safeParse(designDnaValue);
    if (!screenAst.success || (designDna !== null && !designDna.success)) {
      await db.prepare("UPDATE inference_tickets SET status='failed',errorMessage='Saved request data failed validation',leaseId=NULL,leaseUntil=NULL,completedAt=? WHERE id=? AND leaseId=? AND status='processing'")
        .bind(new Date().toISOString(), ticket.id, leaseId).run();
      continue;
    }

    return c.json({ task: {
      id: ticket.id,
      tokenNumber: ticket.tokenNumber,
      leaseId,
      prompt: ticket.prompt,
      screenAst: screenAst.data,
      designDna: designDna?.data ?? {},
    } });
  }
  return c.json({ task: null });
});

inferenceRoute.post('/complete', async c => {
  const data = completionSchema.parse(await body(c));
  const command = { ...data.resultCommand, preserveLockedNodes: true };
  const result = await c.env.DB!.prepare("UPDATE inference_tickets SET status='completed',resultCommand=?,completedAt=?,leaseId=NULL WHERE id=? AND leaseId=? AND status='processing' AND leaseUntil>? RETURNING id")
    .bind(JSON.stringify(command), new Date().toISOString(), data.ticketId, data.leaseId, Date.now()).first<{ id: string }>();
  if (!result) return c.json({ error: 'LeaseExpired', message: 'Task lease is no longer active' }, 409);
  return c.json({ success: true, ticketId: result.id });
});

inferenceRoute.post('/fail', async c => {
  const data = failureSchema.parse(await body(c));
  const errorMessage = data.failureCode === 'invalid-result'
    ? 'Laptop worker returned a proposal that did not match the shared command contract.'
    : 'Laptop worker could not complete this request.';
  const failed = await c.env.DB!.prepare("UPDATE inference_tickets SET status='failed',errorMessage=?,completedAt=?,leaseId=NULL,leaseUntil=NULL WHERE id=? AND leaseId=? AND status='processing' AND leaseUntil>? RETURNING id")
    .bind(errorMessage, new Date().toISOString(), data.ticketId, data.leaseId, Date.now()).first<{ id: string }>();
  if (!failed) return c.json({ error: 'LeaseExpired', message: 'Task lease is no longer active' }, 409);
  return c.json({ success: true, ticketId: failed.id, status: 'failed' });
});
