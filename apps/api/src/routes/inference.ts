import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { Env } from '../types.js';

export const inferenceRoute = new Hono<{ Bindings: Env }>();

const DEV_HOST_SECRET = 'tessellate_owner_secret_dev';

// In-memory fallback for local dev / tests when D1 is not bound
interface MemoryTicket {
  id: string;
  tokenNumber: number;
  prompt: string;
  screenAst: string;
  designDna?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  resultCommand?: string;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

let nextTokenNumber = 1;
const memoryTickets = new Map<string, MemoryTicket>();
let lastWorkerHeartbeat = 0;
let workerDeviceName = 'None';

function isAuthorizedHost(c: any): boolean {
  const secret = c.req.header('X-Host-Secret');
  return secret === DEV_HOST_SECRET;
}

// 1. POST /api/inference/queue — Client submits task into queue
inferenceRoute.post('/queue', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const prompt = (body.prompt || '').trim();

  if (!prompt) {
    return c.json({ error: 'Validation Error', message: 'prompt is required' }, 400);
  }

  const tokenNum = nextTokenNumber++;
  const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const screenAstStr = JSON.stringify(body.screenAst || {});
  const dnaStr = JSON.stringify(body.designDna || {});

  // Compute position (how many queued ahead)
  let position = 1;
  for (const t of memoryTickets.values()) {
    if (t.status === 'queued') {
      position++;
    }
  }

  const ticket: MemoryTicket = {
    id: ticketId,
    tokenNumber: tokenNum,
    prompt,
    screenAst: screenAstStr,
    designDna: dnaStr,
    status: 'queued',
    createdAt: now,
  };

  memoryTickets.set(ticketId, ticket);

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.inferenceTickets).values({
      id: ticketId,
      tokenNumber: tokenNum,
      prompt,
      screenAst: screenAstStr,
      designDna: dnaStr,
      status: 'queued',
      createdAt: now,
    }).catch(() => {});
  }

  const estimatedWaitSeconds = Math.max(2, position * 2);

  return c.json({
    success: true,
    ticketId,
    tokenNumber: tokenNum,
    position,
    estimatedWaitSeconds,
  });
});

// 2. GET /api/inference/status/:ticketId — Client polls status of ticket
inferenceRoute.get('/status/:ticketId', async (c) => {
  const ticketId = c.req.param('ticketId');

  let ticket = memoryTickets.get(ticketId);

  if (!ticket && c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    const row = await db.select().from(schema.inferenceTickets).where(eq(schema.inferenceTickets.id, ticketId)).get();
    if (row) {
      ticket = {
        id: row.id,
        tokenNumber: row.tokenNumber,
        prompt: row.prompt,
        screenAst: row.screenAst,
        designDna: row.designDna || undefined,
        status: row.status as any,
        resultCommand: row.resultCommand || undefined,
        errorMessage: row.errorMessage || undefined,
        createdAt: row.createdAt,
        startedAt: row.startedAt || undefined,
        completedAt: row.completedAt || undefined,
      };
    }
  }

  if (!ticket) {
    return c.json({ error: 'Not Found', message: `Ticket "${ticketId}" not found.` }, 404);
  }

  let position = 1;
  if (ticket.status === 'queued') {
    for (const t of memoryTickets.values()) {
      if (t.status === 'queued' && t.tokenNumber < ticket.tokenNumber) {
        position++;
      }
    }
  }

  let parsedCommand = null;
  if (ticket.resultCommand) {
    try {
      parsedCommand = JSON.parse(ticket.resultCommand);
    } catch {
      parsedCommand = ticket.resultCommand;
    }
  }

  return c.json({
    ticketId: ticket.id,
    tokenNumber: ticket.tokenNumber,
    status: ticket.status,
    position: ticket.status === 'queued' ? position : 0,
    resultCommand: parsedCommand,
    errorMessage: ticket.errorMessage,
  });
});

// 3. GET /api/inference/poll — Host daemon long-polls next queued task
inferenceRoute.get('/poll', async (c) => {
  if (!isAuthorizedHost(c)) {
    return c.json({ error: 'Unauthorized', message: 'Invalid host secret.' }, 401);
  }

  // Find oldest queued ticket
  let candidate: MemoryTicket | null = null;
  for (const t of memoryTickets.values()) {
    if (t.status === 'queued') {
      if (!candidate || t.tokenNumber < candidate.tokenNumber) {
        candidate = t;
      }
    }
  }

  if (!candidate) {
    return c.json({ task: null });
  }

  candidate.status = 'processing';
  candidate.startedAt = new Date().toISOString();

  let parsedAst = {};
  try {
    parsedAst = JSON.parse(candidate.screenAst);
  } catch {
    // Ignore parse error
  }

  let parsedDna = {};
  try {
    if (candidate.designDna) parsedDna = JSON.parse(candidate.designDna);
  } catch {
    // Ignore parse error
  }

  return c.json({
    task: {
      id: candidate.id,
      tokenNumber: candidate.tokenNumber,
      prompt: candidate.prompt,
      screenAst: parsedAst,
      designDna: parsedDna,
    },
  });
});

// 4. POST /api/inference/complete — Host daemon submits completed result
inferenceRoute.post('/complete', async (c) => {
  if (!isAuthorizedHost(c)) {
    return c.json({ error: 'Unauthorized', message: 'Invalid host secret.' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const ticketId = body.ticketId;
  const resultCommand = body.resultCommand;

  if (!ticketId || !resultCommand) {
    return c.json({ error: 'Validation Error', message: 'ticketId and resultCommand required' }, 400);
  }

  const ticket = memoryTickets.get(ticketId);
  const now = new Date().toISOString();
  const resStr = JSON.stringify(resultCommand);

  if (ticket) {
    ticket.status = 'completed';
    ticket.resultCommand = resStr;
    ticket.completedAt = now;
  }

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.update(schema.inferenceTickets)
      .set({ status: 'completed', resultCommand: resStr, completedAt: now })
      .where(eq(schema.inferenceTickets.id, ticketId))
      .catch(() => {});
  }

  return c.json({ success: true, ticketId });
});

// 5. POST /api/inference/heartbeat — Host daemon registers liveness
inferenceRoute.post('/heartbeat', async (c) => {
  if (!isAuthorizedHost(c)) {
    return c.json({ error: 'Unauthorized', message: 'Invalid host secret.' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  lastWorkerHeartbeat = Date.now();
  if (body.deviceName) workerDeviceName = body.deviceName;

  return c.json({ success: true, timestamp: lastWorkerHeartbeat });
});

// 6. GET /api/inference/health — Public check if host is online
inferenceRoute.get('/health', async (c) => {
  const now = Date.now();
  const isOnline = now - lastWorkerHeartbeat < 30000; // Heartbeat within last 30s

  let pendingCount = 0;
  for (const t of memoryTickets.values()) {
    if (t.status === 'queued' || t.status === 'processing') {
      pendingCount++;
    }
  }

  return c.json({
    hostOnline: isOnline,
    activeWorkers: isOnline ? 1 : 0,
    workerDevice: isOnline ? workerDeviceName : null,
    pendingTasks: pendingCount,
  });
});
