import { Hono } from 'hono';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { desc, eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { createAuth, requireAdmin } from '../auth.js';
import { getStore } from './inference.js';
import { memoryReports } from './reports.js';
import { isNonProduction, randomToken, sha256Hex } from '../security.js';
import type { AuthenticatedContext, Env } from '../types.js';

/**
 * Administration API (D-037). Every route requires the admin role and every change is written to
 * the audit log. User management delegates to Better Auth's admin plugin so bans revoke sessions.
 */
export const adminRoute = new Hono<{ Bindings: Env; Variables: { auth: AuthenticatedContext } }>();
adminRoute.use('*', requireAdmin);

interface AuditEntry {
  id: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: string;
  createdAt: string;
}

const memoryAudit: AuditEntry[] = [];

export function resetAdminStateForTests(): void {
  memoryAudit.length = 0;
}

async function audit(env: Env | undefined, entry: Omit<AuditEntry, 'id' | 'createdAt'>): Promise<void> {
  const row: AuditEntry = { ...entry, id: `aud_${randomToken(12)}`, createdAt: new Date().toISOString() };
  if (env?.DB) {
    await drizzle(env.DB, { schema }).insert(schema.adminAuditLog).values({ ...row, targetId: row.targetId ?? null, detail: row.detail ?? null });
  } else if (isNonProduction(env)) {
    memoryAudit.unshift(row);
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Request failed';
}

// ---- Users (Better Auth admin plugin) -----------------------------------------------------------

adminRoute.get('/users', async (c) => {
  const search = c.req.query('search')?.trim();
  const limit = Math.min(Number(c.req.query('limit') ?? 50) || 50, 200);
  const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0);
  const result = await createAuth(c.env).api.listUsers({
    headers: c.req.raw.headers,
    query: {
      limit,
      offset,
      ...(search ? { searchValue: search, searchField: 'email' as const, searchOperator: 'contains' as const } : {}),
      sortBy: 'createdAt',
      sortDirection: 'desc' as const,
    },
  });
  return c.json(result);
});

const BanSchema = z.object({ reason: z.string().trim().min(3).max(500), days: z.number().int().min(1).max(3650).optional() });

adminRoute.post('/users/:id/ban', async (c) => {
  const parsed = BanSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'A ban reason (3–500 characters) is required.' }, 400);
  const userId = c.req.param('id');
  if (userId === c.get('auth').user.id) return c.json({ error: 'Forbidden', message: 'You cannot ban your own account.' }, 403);
  try {
    await createAuth(c.env).api.banUser({
      headers: c.req.raw.headers,
      body: { userId, banReason: parsed.data.reason, ...(parsed.data.days ? { banExpiresIn: parsed.data.days * 86400 } : {}) },
    });
  } catch (err) {
    return c.json({ error: 'Ban Failed', message: errorMessage(err) }, 400);
  }
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'user.ban', targetType: 'user', targetId: userId, detail: parsed.data.reason });
  return c.json({ success: true });
});

adminRoute.post('/users/:id/unban', async (c) => {
  const userId = c.req.param('id');
  try {
    await createAuth(c.env).api.unbanUser({ headers: c.req.raw.headers, body: { userId } });
  } catch (err) {
    return c.json({ error: 'Unban Failed', message: errorMessage(err) }, 400);
  }
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'user.unban', targetType: 'user', targetId: userId });
  return c.json({ success: true });
});

const RoleSchema = z.object({ role: z.enum(['user', 'admin']) });

adminRoute.post('/users/:id/role', async (c) => {
  const parsed = RoleSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'role must be "user" or "admin".' }, 400);
  const userId = c.req.param('id');
  if (userId === c.get('auth').user.id && parsed.data.role !== 'admin') {
    return c.json({ error: 'Forbidden', message: 'You cannot remove your own administrator role.' }, 403);
  }
  try {
    await createAuth(c.env).api.setRole({ headers: c.req.raw.headers, body: { userId, role: parsed.data.role } });
  } catch (err) {
    return c.json({ error: 'Role Change Failed', message: errorMessage(err) }, 400);
  }
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'user.set-role', targetType: 'user', targetId: userId, detail: parsed.data.role });
  return c.json({ success: true });
});

// ---- Intelligence queue --------------------------------------------------------------------------

adminRoute.get('/queue', async (c) => {
  const store = getStore(c.env);
  const recent = await store.listRecent(100);
  return c.json({
    active: await store.countActive(),
    lastDeviceSeenAt: (await store.lastDeviceSeenAt()) ?? null,
    tickets: recent.map((t) => ({
      id: t.id,
      kind: t.kind,
      tokenNumber: t.tokenNumber,
      status: t.status,
      owner: t.ownerKey.startsWith('user:') ? t.ownerKey : 'guest',
      promptPreview: t.prompt.slice(0, 160),
      error: t.errorMessage,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    })),
  });
});

adminRoute.delete('/queue/:id', async (c) => {
  const ok = await getStore(c.env).cancel(c.req.param('id'));
  if (!ok) return c.json({ error: 'Conflict', message: 'Only queued tickets can be cancelled.' }, 409);
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'queue.cancel', targetType: 'ticket', targetId: c.req.param('id') });
  return c.json({ success: true });
});

// ---- Daemon devices -----------------------------------------------------------------------------

adminRoute.get('/devices', async (c) => {
  const devices = await getStore(c.env).listDevices();
  return c.json({ devices: devices.map(({ tokenHash: _hash, ...d }) => d) });
});

const DeviceSchema = z.object({ name: z.string().trim().min(1).max(64).regex(/^[\w .-]+$/) });

adminRoute.post('/devices', async (c) => {
  const parsed = DeviceSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'Device name: 1–64 letters, digits, spaces, . _ -' }, 400);
  const token = randomToken(32);
  const device = { id: `dev_${randomToken(12)}`, name: parsed.data.name, tokenHash: await sha256Hex(token), createdAt: new Date().toISOString() };
  await getStore(c.env).createDevice(device);
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'device.create', targetType: 'device', targetId: device.id, detail: device.name });
  // The token is returned exactly once and only its hash is stored.
  return c.json({ id: device.id, name: device.name, token }, 201);
});

adminRoute.delete('/devices/:id', async (c) => {
  const ok = await getStore(c.env).revokeDevice(c.req.param('id'), new Date().toISOString());
  if (!ok) return c.json({ error: 'Not Found', message: 'Device not found or already revoked.' }, 404);
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'device.revoke', targetType: 'device', targetId: c.req.param('id') });
  return c.json({ success: true });
});

// ---- Reports ------------------------------------------------------------------------------------

adminRoute.get('/reports', async (c) => {
  if (c.env?.DB) {
    const rows = await drizzle(c.env.DB, { schema }).select().from(schema.reports).orderBy(desc(schema.reports.createdAt)).limit(200).all();
    return c.json({ reports: rows });
  }
  return c.json({ reports: [...memoryReports].reverse() });
});

const ReportStatusSchema = z.object({ status: z.enum(['pending', 'reviewing', 'resolved', 'dismissed']) });

adminRoute.post('/reports/:id/status', async (c) => {
  const parsed = ReportStatusSchema.safeParse(await c.req.json().catch(() => undefined));
  if (!parsed.success) return c.json({ error: 'Validation Error', message: 'Invalid report status.' }, 400);
  const id = c.req.param('id');
  if (c.env?.DB) {
    await drizzle(c.env.DB, { schema }).update(schema.reports).set({ status: parsed.data.status }).where(eq(schema.reports.id, id));
  } else {
    const r = memoryReports.find((x) => x.id === id);
    if (!r) return c.json({ error: 'Not Found', message: 'Report not found.' }, 404);
    r.status = parsed.data.status;
  }
  await audit(c.env, { actorUserId: c.get('auth').user.id, action: 'report.status', targetType: 'report', targetId: id, detail: parsed.data.status });
  return c.json({ success: true });
});

// ---- Audit log ----------------------------------------------------------------------------------

adminRoute.get('/audit-log', async (c) => {
  if (c.env?.DB) {
    const rows = await drizzle(c.env.DB, { schema }).select().from(schema.adminAuditLog).orderBy(desc(schema.adminAuditLog.createdAt)).limit(200).all();
    return c.json({ entries: rows });
  }
  return c.json({ entries: memoryAudit.slice(0, 200) });
});
