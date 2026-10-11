import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema.js';
import { optionalAuth } from '../auth.js';
import { verifyTurnstileToken } from '../turnstile.js';
import type { Env, AuthenticatedContext } from '../types.js';

export const reportsRoute = new Hono<{ Bindings: Env; Variables: { auth?: AuthenticatedContext } }>();

interface InMemReport {
  id: string;
  reporterUserId: string | null;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
}

const memoryReports: InMemReport[] = [];

// POST /api/reports — submit a content or abuse report
reportsRoute.post('/', optionalAuth, async (c) => {
  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);

  if (!body || !body.targetType || !body.targetId || !body.reason) {
    return c.json({ error: 'Validation Error', message: 'targetType, targetId, and reason are required' }, 400);
  }

  // Turnstile verification if configured in environment
  const turnstileCheck = await verifyTurnstileToken(
    c.env?.TURNSTILE_SECRET_KEY,
    body.turnstileToken || c.req.header('cf-turnstile-response'),
    c.req.header('cf-connecting-ip')
  );
  if (!turnstileCheck.success) {
    return c.json({ error: 'Abuse Check Failed', message: turnstileCheck.error ?? 'Turnstile verification failed' }, 403);
  }

  const validTargetTypes = ['project', 'resource', 'user', 'collection'];
  if (!validTargetTypes.includes(body.targetType)) {
    return c.json({ error: 'Validation Error', message: `targetType must be one of: ${validTargetTypes.join(', ')}` }, 400);
  }

  const id = `rep_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.reports).values({
      id,
      reporterUserId: auth ? auth.user.id : null,
      targetType: String(body.targetType),
      targetId: String(body.targetId),
      reason: String(body.reason).trim(),
      details: body.details ? String(body.details).trim() : null,
      status: 'pending',
      createdAt: now,
    });
  } else {
    memoryReports.push({
      id,
      reporterUserId: auth ? auth.user.id : null,
      targetType: String(body.targetType),
      targetId: String(body.targetId),
      reason: String(body.reason).trim(),
      details: body.details ? String(body.details).trim() : null,
      status: 'pending',
      createdAt: now,
    });
  }

  return c.json({
    report: {
      id,
      status: 'pending',
      receivedAt: now,
    },
    message: 'Report received and queued for review.',
  }, 201);
});
