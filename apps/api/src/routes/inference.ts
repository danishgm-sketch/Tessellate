import { Hono, type Context } from 'hono';
import { z } from 'zod';
import { IntentCommandSchema } from '@tessellate/schemas';
import type { AuthenticatedContext, Env } from '../types.js';
import { getSessionFromRequest } from '../auth.js';
import { verifyTurnstileToken, TURNSTILE_HEADER } from '../turnstile.js';
import {
  ConfigurationError,
  RateLimiter,
  clientIp,
  isNonProduction,
  randomToken,
  sha256Hex,
  timingSafeEqual,
} from '../security.js';
import { D1TicketStore, MemoryTicketStore, type Ticket, type TicketStore } from '../inference/store.js';

/** Queue limits (D-035). */
export const QUEUE_LIMITS = {
  maxPromptChars: 4000,
  maxContextBytes: 256 * 1024,
  maxResultBytes: 256 * 1024,
  maxActivePerUser: 3,
  maxActivePerGuest: 1,
  maxActiveGlobal: 500,
  enqueuePerMinute: 10,
  hostOnlineWindowMs: 45_000,
  retentionMs: 24 * 60 * 60 * 1000,
} as const;

const EnqueueSchema = z.object({
  kind: z.enum(['intent-command', 'interpret-brief']).default('intent-command'),
  prompt: z.string().trim().min(1, 'prompt is required').max(QUEUE_LIMITS.maxPromptChars),
  /** Structured context for the daemon (screen AST, Design DNA, product model). */
  context: z.record(z.string(), z.unknown()).default({}),
});

const CompleteSchema = z
  .object({
    ticketId: z.string().min(1),
    result: z.unknown().optional(),
    error: z.string().max(2000).optional(),
  })
  .refine((v) => v.result !== undefined || v.error !== undefined, 'result or error is required');

const DEV_DEVICE_ID = 'dev-device';

let memoryStore: MemoryTicketStore | undefined;
const enqueueLimiter = new RateLimiter(QUEUE_LIMITS.enqueuePerMinute, 60_000);
let avgProcessingMs = 5_000;

/** Test helper: resets in-memory queue state. Has no effect on D1-backed deployments. */
export function resetInferenceStateForTests(): void {
  memoryStore = undefined;
  enqueueLimiter.reset();
  avgProcessingMs = 5_000;
}

function getStore(env?: Env): TicketStore {
  if (env?.DB) return new D1TicketStore(env.DB);
  if (!isNonProduction(env)) throw new ConfigurationError('D1 database binding (DB) is required for the inference queue.');
  memoryStore ??= new MemoryTicketStore();
  return memoryStore;
}

type InferenceContext = Context<{ Bindings: Env }>;

function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value) ?? '').length;
}

async function resolveDevice(c: InferenceContext, store: TicketStore): Promise<string | null> {
  const header = c.req.header('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;

  if (isNonProduction(c.env) && c.env?.DAEMON_DEV_TOKEN && timingSafeEqual(token, c.env.DAEMON_DEV_TOKEN)) {
    return DEV_DEVICE_ID;
  }
  const device = await store.findDeviceByTokenHash(await sha256Hex(token));
  return device ? device.id : null;
}

async function canReadTicket(c: InferenceContext, ticket: Ticket, auth: AuthenticatedContext | null): Promise<boolean> {
  if (auth && ticket.ownerKey === `user:${auth.user.id}`) return true;
  const token = c.req.header('X-Ticket-Token');
  if (!token) return false;
  return timingSafeEqual(await sha256Hex(token), ticket.ticketTokenHash);
}

async function hostOnline(store: TicketStore): Promise<boolean> {
  const last = await store.lastDeviceSeenAt();
  return Boolean(last && Date.now() - Date.parse(last) < QUEUE_LIMITS.hostOnlineWindowMs);
}

function parseResult(raw?: string): unknown {
  if (raw === undefined) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export const inferenceRoute = new Hono<{ Bindings: Env }>();

// 1. POST /queue — submit a brief or command. Signed-in users, or guests that pass Turnstile.
inferenceRoute.post('/queue', async (c) => {
  const store = getStore(c.env);
  const auth = await getSessionFromRequest(c.req.raw, c.env);
  const ip = clientIp(c.req.raw);

  if (!auth) {
    const turnstile = await verifyTurnstileToken(c.env, c.req.header(TURNSTILE_HEADER), ip);
    if (!turnstile.success) {
      return c.json({ error: 'Verification Required', message: turnstile.error ?? 'Sign in or complete the verification challenge.' }, 403);
    }
  }

  const ownerKey = auth ? `user:${auth.user.id}` : `guest:${(await sha256Hex(ip)).slice(0, 24)}`;
  if (!(await enqueueLimiter.allow(ownerKey, c.env?.RATE_LIMIT_ENQUEUE))) {
    c.header('Retry-After', '60');
    return c.json({ error: 'Rate Limited', message: 'Too many requests. Please wait a minute and try again.' }, 429);
  }

  const parsed = EnqueueSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    return c.json({ error: 'Validation Error', message: parsed.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ') }, 400);
  }
  if (byteLength(parsed.data.context) > QUEUE_LIMITS.maxContextBytes) {
    return c.json({ error: 'Payload Too Large', message: `context exceeds ${QUEUE_LIMITS.maxContextBytes} bytes.` }, 413);
  }

  const ownerCap = auth ? QUEUE_LIMITS.maxActivePerUser : QUEUE_LIMITS.maxActivePerGuest;
  if ((await store.countActive(ownerKey)) >= ownerCap) {
    return c.json({ error: 'Too Many Active Requests', message: `You already have ${ownerCap} request(s) in the queue.` }, 429);
  }
  if ((await store.countActive()) >= QUEUE_LIMITS.maxActiveGlobal) {
    c.header('Retry-After', '120');
    return c.json({ error: 'Queue Full', message: 'The intelligence queue is full. Please try again shortly.' }, 503);
  }

  const ticketToken = randomToken(32);
  const ticket = await store.insert({
    id: `tkt_${randomToken(16)}`,
    kind: parsed.data.kind,
    ownerKey,
    ticketTokenHash: await sha256Hex(ticketToken),
    prompt: parsed.data.prompt,
    payload: JSON.stringify(parsed.data.context),
    status: 'queued',
    createdAt: new Date().toISOString(),
  });
  const position = await store.positionOf(ticket);

  return c.json(
    {
      ticketId: ticket.id,
      ticketToken,
      tokenNumber: ticket.tokenNumber,
      position,
      estimatedWaitSeconds: Math.ceil((position * avgProcessingMs) / 1000),
      hostOnline: await hostOnline(store),
    },
    202,
  );
});

// 2. GET /tickets/:id — status for the submitter (ticket token or owning session).
inferenceRoute.get('/tickets/:id', async (c) => {
  const store = getStore(c.env);
  const ticket = await store.get(c.req.param('id'));
  const auth = await getSessionFromRequest(c.req.raw, c.env);
  if (!ticket || !(await canReadTicket(c, ticket, auth))) {
    return c.json({ error: 'Not Found', message: 'Ticket not found.' }, 404);
  }
  const position = await store.positionOf(ticket);
  return c.json({
    ticketId: ticket.id,
    kind: ticket.kind,
    tokenNumber: ticket.tokenNumber,
    status: ticket.status,
    position,
    estimatedWaitSeconds: Math.ceil((position * avgProcessingMs) / 1000),
    hostOnline: await hostOnline(store),
    result: ticket.status === 'completed' ? parseResult(ticket.result) : undefined,
    error: ticket.errorMessage,
  });
});

// 3. DELETE /tickets/:id — submitter cancels a queued ticket.
inferenceRoute.delete('/tickets/:id', async (c) => {
  const store = getStore(c.env);
  const ticket = await store.get(c.req.param('id'));
  const auth = await getSessionFromRequest(c.req.raw, c.env);
  if (!ticket || !(await canReadTicket(c, ticket, auth))) {
    return c.json({ error: 'Not Found', message: 'Ticket not found.' }, 404);
  }
  if (!(await store.cancel(ticket.id))) {
    return c.json({ error: 'Conflict', message: `Ticket is ${ticket.status} and can no longer be cancelled.` }, 409);
  }
  return c.json({ ticketId: ticket.id, status: 'cancelled' });
});

// 4. GET /poll — daemon claims the next queued ticket.
inferenceRoute.get('/poll', async (c) => {
  const store = getStore(c.env);
  const deviceId = await resolveDevice(c, store);
  if (!deviceId) return c.json({ error: 'Unauthorized', message: 'Invalid daemon token.' }, 401);

  const now = new Date();
  await store.touchDevice(deviceId, now.toISOString());
  await store.purgeFinishedBefore(new Date(now.getTime() - QUEUE_LIMITS.retentionMs).toISOString());

  const ticket = await store.claimNext(deviceId);
  if (!ticket) return c.json({ task: null });

  return c.json({
    task: {
      id: ticket.id,
      kind: ticket.kind,
      tokenNumber: ticket.tokenNumber,
      prompt: ticket.prompt,
      context: parseResult(ticket.payload) ?? {},
    },
  });
});

// 5. POST /complete — daemon submits a validated result or an error.
inferenceRoute.post('/complete', async (c) => {
  const store = getStore(c.env);
  const deviceId = await resolveDevice(c, store);
  if (!deviceId) return c.json({ error: 'Unauthorized', message: 'Invalid daemon token.' }, 401);

  const parsed = CompleteSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) {
    return c.json({ error: 'Validation Error', message: parsed.error.issues.map((i) => i.message).join('; ') }, 400);
  }
  const { ticketId, result, error } = parsed.data;
  const ticket = await store.get(ticketId);
  if (!ticket) return c.json({ error: 'Not Found', message: 'Ticket not found.' }, 404);

  if (error !== undefined) {
    const ok = await store.fail(ticketId, deviceId, error);
    return ok ? c.json({ success: true, ticketId, status: 'failed' }) : c.json({ error: 'Conflict', message: 'Ticket is not assigned to this device.' }, 409);
  }

  if (byteLength(result) > QUEUE_LIMITS.maxResultBytes) {
    return c.json({ error: 'Payload Too Large', message: `result exceeds ${QUEUE_LIMITS.maxResultBytes} bytes.` }, 413);
  }
  if (ticket.kind === 'intent-command') {
    const intent = IntentCommandSchema.safeParse(result);
    if (!intent.success) {
      await store.fail(ticketId, deviceId, 'Daemon returned an invalid IntentCommand.');
      return c.json({ error: 'Validation Error', message: intent.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') }, 422);
    }
  } else if (typeof result !== 'object' || result === null) {
    await store.fail(ticketId, deviceId, 'Daemon returned a non-object interpretation.');
    return c.json({ error: 'Validation Error', message: 'interpret-brief results must be JSON objects.' }, 422);
  }

  const ok = await store.complete(ticketId, deviceId, JSON.stringify(result));
  if (!ok) return c.json({ error: 'Conflict', message: 'Ticket is not assigned to this device.' }, 409);

  if (ticket.startedAt) {
    const elapsed = Date.now() - Date.parse(ticket.startedAt);
    if (Number.isFinite(elapsed) && elapsed >= 0) avgProcessingMs = Math.round(avgProcessingMs * 0.8 + elapsed * 0.2);
  }
  return c.json({ success: true, ticketId, status: 'completed' });
});

// 6. POST /heartbeat — daemon liveness.
inferenceRoute.post('/heartbeat', async (c) => {
  const store = getStore(c.env);
  const deviceId = await resolveDevice(c, store);
  if (!deviceId) return c.json({ error: 'Unauthorized', message: 'Invalid daemon token.' }, 401);
  const at = new Date().toISOString();
  await store.touchDevice(deviceId, at);
  return c.json({ success: true, timestamp: at });
});

// 7. GET /health — public queue status (no prompt content).
inferenceRoute.get('/health', async (c) => {
  const store = getStore(c.env);
  const pending = await store.countActive();
  return c.json({
    hostOnline: await hostOnline(store),
    pendingTasks: pending,
    estimatedWaitSeconds: Math.ceil((pending * avgProcessingMs) / 1000),
  });
});
