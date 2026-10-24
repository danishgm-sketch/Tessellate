import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { z } from 'zod';
import * as schema from '../db/schema.js';
import { optionalAuth } from '../auth.js';
import { verifyTurnstileToken } from '../turnstile.js';
import { enforceApiRateLimit, publicClientRateLimitKey } from '../rate-limit.js';
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
const reportSchema = z.object({
  targetType: z.enum(['project', 'resource', 'user', 'collection']),
  targetId: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(2000),
  details: z.string().trim().max(8000).optional(),
  turnstileToken: z.string().max(8192).optional(),
}).strict();

// POST /api/reports — submit a content or abuse report
reportsRoute.post('/', optionalAuth, async (c) => {
  const auth = c.get('auth');
  const rateLimitResponse = await enforceApiRateLimit(
    c.env,
    'API_PUBLIC_WRITE_LIMITER',
    auth ? `user:${auth.user.id}` : publicClientRateLimitKey(c.env, c.req.raw)
  );
  if (rateLimitResponse) return rateLimitResponse;

  const body = await c.req.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Validation Error', message: 'Report fields are invalid or exceed their limits' }, 400);
  }
  const report = parsed.data;

  // Turnstile verification if configured in environment
  const turnstileCheck = await verifyTurnstileToken(
    c.env?.TURNSTILE_SECRET_KEY,
    report.turnstileToken || c.req.header('cf-turnstile-response'),
    c.req.header('cf-connecting-ip'),
    c.env?.RUNTIME_ENVIRONMENT === 'development' || c.env?.RUNTIME_ENVIRONMENT === 'test'
  );
  if (!turnstileCheck.success) {
    return c.json(
      {
        error: turnstileCheck.status === 503 ? 'AbuseCheckUnavailable' : 'Abuse Check Failed',
        message: turnstileCheck.error,
      },
      turnstileCheck.status
    );
  }

  const id = `rep_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  if (c.env?.DB) {
    const db = drizzle(c.env.DB, { schema });
    await db.insert(schema.reports).values({
      id,
      reporterUserId: auth ? auth.user.id : null,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      details: report.details || null,
      status: 'pending',
      createdAt: now,
    });
  } else {
    memoryReports.push({
      id,
      reporterUserId: auth ? auth.user.id : null,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      details: report.details || null,
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
