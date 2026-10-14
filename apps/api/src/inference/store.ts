import { drizzle } from 'drizzle-orm/d1';
import { and, asc, eq, inArray, isNotNull, lt, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { createSchedulerState, markServed, pickNext } from './fair-queue.js';

export type TicketKind = 'intent-command' | 'interpret-brief';
export type TicketStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Ticket {
  id: string;
  kind: TicketKind;
  /** Owner key: `user:<id>` for signed-in users, `guest:<ip-hash>` for Turnstile-verified guests. */
  ownerKey: string;
  /** SHA-256 of the per-ticket bearer token returned to the submitter. */
  ticketTokenHash: string;
  tokenNumber: number;
  prompt: string;
  payload: string;
  status: TicketStatus;
  result?: string;
  errorMessage?: string;
  deviceId?: string;
  /** Number of times a daemon has claimed this ticket. */
  attempts: number;
  /** A claimed ticket that is not completed before this time is re-queued (daemon crash/restart). */
  leaseExpiresAt?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface DaemonDevice {
  id: string;
  name: string;
  tokenHash: string;
  createdAt: string;
  lastSeenAt?: string;
  revokedAt?: string;
}

export interface SchedulerSnapshot {
  /** ownerKey → ISO time that owner was last served. */
  lastServedAt: Map<string, string>;
  /** Claims made since a guest ticket was last claimed. */
  claimsSinceGuest: number;
}

export interface LatencyStats {
  count: number;
  p50Ms: number | null;
  p95Ms: number | null;
}

/** Lease for a claimed ticket and the number of claims before it is failed for good. */
export const LEASE_MS = 90_000;
export const MAX_ATTEMPTS = 3;
export const DAEMON_LOST_MESSAGE = 'The intelligence host stopped responding while working on this request. Please try again.';

/** Persistence for the inference queue. Production uses D1; development/test may use memory. */
export interface TicketStore {
  insert(ticket: Omit<Ticket, 'tokenNumber' | 'attempts'>): Promise<Ticket>;
  get(id: string): Promise<Ticket | undefined>;
  listQueued(limit: number): Promise<Ticket[]>;
  schedulerSnapshot(): Promise<SchedulerSnapshot>;
  /** Claims a specific queued ticket for a device; undefined if someone else claimed it first. */
  claimSpecific(id: string, deviceId: string, leaseExpiresAt: string): Promise<Ticket | undefined>;
  complete(id: string, deviceId: string, result: string): Promise<boolean>;
  fail(id: string, deviceId: string, errorMessage: string): Promise<boolean>;
  cancel(id: string): Promise<boolean>;
  /** Re-queues processing tickets whose lease expired; fails them after MAX_ATTEMPTS. */
  requeueExpired(nowIso: string): Promise<{ requeued: number; failed: number }>;
  countActive(ownerKey?: string): Promise<number>;
  positionOf(ticket: Ticket): Promise<number>;
  /** Removes prompt/payload/result content from finished tickets older than the cutoff. */
  purgeFinishedBefore(cutoffIso: string): Promise<number>;
  latencyStats(sample: number): Promise<LatencyStats>;
  findDeviceByTokenHash(tokenHash: string): Promise<DaemonDevice | undefined>;
  touchDevice(id: string, at: string): Promise<void>;
  lastDeviceSeenAt(): Promise<string | undefined>;
  createDevice(device: DaemonDevice): Promise<void>;
  listDevices(): Promise<DaemonDevice[]>;
  revokeDevice(id: string, at: string): Promise<boolean>;
  listRecent(limit: number): Promise<Ticket[]>;
}

const ACTIVE: TicketStatus[] = ['queued', 'processing'];

/**
 * Fair claim (D-035): recover expired leases, then pick the next ticket by owner round-robin with
 * guest anti-starvation. Scheduler state is rebuilt from ticket history, so it survives restarts and
 * is shared by every Worker isolate.
 */
export async function claimNextFairly(store: TicketStore, deviceId: string, now = new Date()): Promise<Ticket | undefined> {
  await store.requeueExpired(now.toISOString());
  for (let attempt = 0; attempt < 3; attempt++) {
    const queued = await store.listQueued(500);
    if (queued.length === 0) return undefined;

    const snapshot = await store.schedulerSnapshot();
    const state = createSchedulerState();
    const ordered = [...snapshot.lastServedAt].sort((a, b) => a[1].localeCompare(b[1]));
    for (const [owner] of ordered) markServed({ id: '', ownerKey: owner, tokenNumber: 0 }, state);
    state.sinceGuest = snapshot.claimsSinceGuest;

    const next = pickNext(queued, state);
    if (!next) return undefined;
    const claimed = await store.claimSpecific(next.id, deviceId, new Date(now.getTime() + LEASE_MS).toISOString());
    if (claimed) return claimed;
    // Lost a race with another claimer: retry with fresh data.
  }
  return undefined;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx]!;
}

export class MemoryTicketStore implements TicketStore {
  private readonly tickets = new Map<string, Ticket>();
  private readonly devices = new Map<string, DaemonDevice>();
  private nextToken = 1;

  async insert(ticket: Omit<Ticket, 'tokenNumber' | 'attempts'>): Promise<Ticket> {
    const stored: Ticket = { ...ticket, tokenNumber: this.nextToken++, attempts: 0 };
    this.tickets.set(stored.id, stored);
    return { ...stored };
  }

  async get(id: string) {
    const t = this.tickets.get(id);
    return t ? { ...t } : undefined;
  }

  async listQueued(limit: number) {
    return [...this.tickets.values()]
      .filter((t) => t.status === 'queued')
      .sort((a, b) => a.tokenNumber - b.tokenNumber)
      .slice(0, limit)
      .map((t) => ({ ...t }));
  }

  async schedulerSnapshot(): Promise<SchedulerSnapshot> {
    const lastServedAt = new Map<string, string>();
    const started = [...this.tickets.values()].filter((t) => t.startedAt).sort((a, b) => a.startedAt!.localeCompare(b.startedAt!));
    let claimsSinceGuest = 0;
    for (const t of started) {
      lastServedAt.set(t.ownerKey, t.startedAt!);
      claimsSinceGuest = t.ownerKey.startsWith('guest:') ? 0 : claimsSinceGuest + 1;
    }
    return { lastServedAt, claimsSinceGuest };
  }

  async claimSpecific(id: string, deviceId: string, leaseExpiresAt: string) {
    const t = this.tickets.get(id);
    if (!t || t.status !== 'queued') return undefined;
    t.status = 'processing';
    t.deviceId = deviceId;
    t.attempts += 1;
    t.leaseExpiresAt = leaseExpiresAt;
    t.startedAt = new Date().toISOString();
    return { ...t };
  }

  async complete(id: string, deviceId: string, result: string) {
    const t = this.tickets.get(id);
    if (!t || t.status !== 'processing' || t.deviceId !== deviceId) return false;
    t.status = 'completed';
    t.result = result;
    t.completedAt = new Date().toISOString();
    return true;
  }

  async fail(id: string, deviceId: string, errorMessage: string) {
    const t = this.tickets.get(id);
    if (!t || t.status !== 'processing' || t.deviceId !== deviceId) return false;
    t.status = 'failed';
    t.errorMessage = errorMessage;
    t.completedAt = new Date().toISOString();
    return true;
  }

  async cancel(id: string) {
    const t = this.tickets.get(id);
    if (!t || t.status !== 'queued') return false;
    t.status = 'cancelled';
    t.completedAt = new Date().toISOString();
    return true;
  }

  async requeueExpired(nowIso: string) {
    let requeued = 0;
    let failed = 0;
    for (const t of this.tickets.values()) {
      if (t.status !== 'processing' || !t.leaseExpiresAt || t.leaseExpiresAt >= nowIso) continue;
      if (t.attempts >= MAX_ATTEMPTS) {
        t.status = 'failed';
        t.errorMessage = DAEMON_LOST_MESSAGE;
        t.completedAt = nowIso;
        failed++;
      } else {
        t.status = 'queued';
        t.deviceId = undefined;
        t.leaseExpiresAt = undefined;
        requeued++;
      }
    }
    return { requeued, failed };
  }

  async countActive(ownerKey?: string) {
    let n = 0;
    for (const t of this.tickets.values()) {
      if (ACTIVE.includes(t.status) && (!ownerKey || t.ownerKey === ownerKey)) n++;
    }
    return n;
  }

  async positionOf(ticket: Ticket) {
    if (ticket.status !== 'queued') return 0;
    let ahead = 0;
    for (const t of this.tickets.values()) if (t.status === 'queued' && t.tokenNumber < ticket.tokenNumber) ahead++;
    return ahead + 1;
  }

  async purgeFinishedBefore(cutoffIso: string) {
    let n = 0;
    for (const t of this.tickets.values()) {
      if (!ACTIVE.includes(t.status) && t.completedAt && t.completedAt < cutoffIso && t.prompt !== '') {
        t.prompt = '';
        t.payload = '{}';
        t.result = undefined;
        n++;
      }
    }
    return n;
  }

  async latencyStats(sample: number): Promise<LatencyStats> {
    const durations = [...this.tickets.values()]
      .filter((t) => t.status === 'completed' && t.startedAt && t.completedAt)
      .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
      .slice(0, sample)
      .map((t) => Date.parse(t.completedAt!) - Date.parse(t.createdAt))
      .sort((a, b) => a - b);
    return { count: durations.length, p50Ms: percentile(durations, 50), p95Ms: percentile(durations, 95) };
  }

  async findDeviceByTokenHash(tokenHash: string) {
    for (const d of this.devices.values()) if (d.tokenHash === tokenHash && !d.revokedAt) return d;
    return undefined;
  }

  async touchDevice(id: string, at: string) {
    const d = this.devices.get(id);
    if (d) d.lastSeenAt = at;
    // Development device (DAEMON_DEV_TOKEN) has no stored row; track it so liveness is reported.
    else this.devices.set(id, { id, name: id, tokenHash: '', createdAt: at, lastSeenAt: at });
  }

  async lastDeviceSeenAt() {
    let latest: string | undefined;
    for (const d of this.devices.values()) if (!d.revokedAt && d.lastSeenAt && (!latest || d.lastSeenAt > latest)) latest = d.lastSeenAt;
    return latest;
  }

  async createDevice(device: DaemonDevice) {
    this.devices.set(device.id, { ...device });
  }

  async listDevices() {
    return [...this.devices.values()].filter((d) => d.tokenHash !== '').map((d) => ({ ...d }));
  }

  async revokeDevice(id: string, at: string) {
    const d = this.devices.get(id);
    if (!d || d.revokedAt) return false;
    d.revokedAt = at;
    return true;
  }

  async listRecent(limit: number) {
    return [...this.tickets.values()].sort((a, b) => b.tokenNumber - a.tokenNumber).slice(0, limit).map((t) => ({ ...t }));
  }
}

function rowToTicket(row: typeof schema.inferenceTickets.$inferSelect): Ticket {
  return {
    id: row.id,
    kind: row.kind as TicketKind,
    ownerKey: row.ownerKey,
    ticketTokenHash: row.ticketTokenHash,
    tokenNumber: row.tokenNumber,
    prompt: row.prompt,
    payload: row.payload,
    status: row.status as TicketStatus,
    result: row.result ?? undefined,
    errorMessage: row.errorMessage ?? undefined,
    deviceId: row.deviceId ?? undefined,
    attempts: row.attempts ?? 0,
    leaseExpiresAt: row.leaseExpiresAt ?? undefined,
    createdAt: row.createdAt,
    startedAt: row.startedAt ?? undefined,
    completedAt: row.completedAt ?? undefined,
  };
}

export class D1TicketStore implements TicketStore {
  private readonly db;

  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema });
  }

  private readonly t = schema.inferenceTickets;

  async insert(ticket: Omit<Ticket, 'tokenNumber' | 'attempts'>): Promise<Ticket> {
    const row = await this.db
      .insert(this.t)
      .values({
        ...ticket,
        attempts: 0,
        tokenNumber: sql`(SELECT COALESCE(MAX(${this.t.tokenNumber}), 0) + 1 FROM ${this.t})`,
      })
      .returning()
      .get();
    return rowToTicket(row);
  }

  async get(id: string) {
    const row = await this.db.select().from(this.t).where(eq(this.t.id, id)).get();
    return row ? rowToTicket(row) : undefined;
  }

  async listQueued(limit: number) {
    const rows = await this.db.select().from(this.t).where(eq(this.t.status, 'queued')).orderBy(asc(this.t.tokenNumber)).limit(limit).all();
    return rows.map(rowToTicket);
  }

  async schedulerSnapshot(): Promise<SchedulerSnapshot> {
    const served = await this.db
      .select({ ownerKey: this.t.ownerKey, at: sql<string>`MAX(${this.t.startedAt})` })
      .from(this.t)
      .where(isNotNull(this.t.startedAt))
      .groupBy(this.t.ownerKey)
      .all();
    const lastGuest = await this.db
      .select({ at: sql<string | null>`MAX(${this.t.startedAt})` })
      .from(this.t)
      .where(sql`${this.t.ownerKey} LIKE 'guest:%'`)
      .get();
    const since = await this.db
      .select({ n: sql<number>`count(*)` })
      .from(this.t)
      .where(lastGuest?.at ? and(isNotNull(this.t.startedAt), sql`${this.t.startedAt} > ${lastGuest.at}`) : isNotNull(this.t.startedAt))
      .get();
    return {
      lastServedAt: new Map(served.filter((r) => r.at).map((r) => [r.ownerKey, r.at])),
      claimsSinceGuest: Number(since?.n ?? 0),
    };
  }

  async claimSpecific(id: string, deviceId: string, leaseExpiresAt: string) {
    // Conditional update: succeeds only if the ticket is still queued (no double claims).
    const row = await this.db
      .update(this.t)
      .set({ status: 'processing', deviceId, leaseExpiresAt, startedAt: new Date().toISOString(), attempts: sql`${this.t.attempts} + 1` })
      .where(and(eq(this.t.id, id), eq(this.t.status, 'queued')))
      .returning()
      .get();
    return row ? rowToTicket(row) : undefined;
  }

  private async finish(id: string, deviceId: string, values: Partial<typeof schema.inferenceTickets.$inferInsert>) {
    const row = await this.db
      .update(this.t)
      .set({ ...values, completedAt: new Date().toISOString(), leaseExpiresAt: null })
      .where(and(eq(this.t.id, id), eq(this.t.status, 'processing'), eq(this.t.deviceId, deviceId)))
      .returning({ id: this.t.id })
      .get();
    return Boolean(row);
  }

  complete(id: string, deviceId: string, result: string) {
    return this.finish(id, deviceId, { status: 'completed', result });
  }

  fail(id: string, deviceId: string, errorMessage: string) {
    return this.finish(id, deviceId, { status: 'failed', errorMessage });
  }

  async cancel(id: string) {
    const row = await this.db
      .update(this.t)
      .set({ status: 'cancelled', completedAt: new Date().toISOString() })
      .where(and(eq(this.t.id, id), eq(this.t.status, 'queued')))
      .returning({ id: this.t.id })
      .get();
    return Boolean(row);
  }

  async requeueExpired(nowIso: string) {
    const expired = and(eq(this.t.status, 'processing'), isNotNull(this.t.leaseExpiresAt), lt(this.t.leaseExpiresAt, nowIso));
    const failed = await this.db
      .update(this.t)
      .set({ status: 'failed', errorMessage: DAEMON_LOST_MESSAGE, completedAt: nowIso, leaseExpiresAt: null })
      .where(and(expired, sql`${this.t.attempts} >= ${MAX_ATTEMPTS}`))
      .returning({ id: this.t.id })
      .all();
    const requeued = await this.db
      .update(this.t)
      .set({ status: 'queued', deviceId: null, leaseExpiresAt: null })
      .where(expired)
      .returning({ id: this.t.id })
      .all();
    return { requeued: requeued.length, failed: failed.length };
  }

  async countActive(ownerKey?: string) {
    const conds = [inArray(this.t.status, ACTIVE)];
    if (ownerKey) conds.push(eq(this.t.ownerKey, ownerKey));
    const row = await this.db.select({ n: sql<number>`count(*)` }).from(this.t).where(and(...conds)).get();
    return Number(row?.n ?? 0);
  }

  async positionOf(ticket: Ticket) {
    if (ticket.status !== 'queued') return 0;
    const row = await this.db
      .select({ n: sql<number>`count(*)` })
      .from(this.t)
      .where(and(eq(this.t.status, 'queued'), lt(this.t.tokenNumber, ticket.tokenNumber)))
      .get();
    return Number(row?.n ?? 0) + 1;
  }

  async purgeFinishedBefore(cutoffIso: string) {
    const rows = await this.db
      .update(this.t)
      .set({ prompt: '', payload: '{}', result: null })
      .where(and(inArray(this.t.status, ['completed', 'failed', 'cancelled']), lt(this.t.completedAt, cutoffIso), sql`${this.t.prompt} != ''`))
      .returning({ id: this.t.id })
      .all();
    return rows.length;
  }

  async latencyStats(sample: number): Promise<LatencyStats> {
    const rows = await this.db
      .select({ createdAt: this.t.createdAt, completedAt: this.t.completedAt })
      .from(this.t)
      .where(and(eq(this.t.status, 'completed'), isNotNull(this.t.completedAt)))
      .orderBy(sql`${this.t.completedAt} DESC`)
      .limit(sample)
      .all();
    const durations = rows.map((r) => Date.parse(r.completedAt!) - Date.parse(r.createdAt)).filter(Number.isFinite).sort((a, b) => a - b);
    return { count: durations.length, p50Ms: percentile(durations, 50), p95Ms: percentile(durations, 95) };
  }

  async findDeviceByTokenHash(tokenHash: string) {
    const row = await this.db.select().from(schema.daemonDevices).where(eq(schema.daemonDevices.tokenHash, tokenHash)).get();
    if (!row || row.revokedAt) return undefined;
    return {
      id: row.id,
      name: row.name,
      tokenHash: row.tokenHash,
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt ?? undefined,
      revokedAt: row.revokedAt ?? undefined,
    };
  }

  async touchDevice(id: string, at: string) {
    await this.db.update(schema.daemonDevices).set({ lastSeenAt: at }).where(eq(schema.daemonDevices.id, id));
  }

  async lastDeviceSeenAt() {
    const row = await this.db
      .select({ at: sql<string | null>`MAX(${schema.daemonDevices.lastSeenAt})` })
      .from(schema.daemonDevices)
      .where(sql`${schema.daemonDevices.revokedAt} IS NULL`)
      .get();
    return row?.at ?? undefined;
  }

  async createDevice(device: DaemonDevice) {
    await this.db.insert(schema.daemonDevices).values({ id: device.id, name: device.name, tokenHash: device.tokenHash, createdAt: device.createdAt });
  }

  async listDevices() {
    const rows = await this.db.select().from(schema.daemonDevices).orderBy(sql`${schema.daemonDevices.createdAt} DESC`).all();
    return rows.map((r) => ({ id: r.id, name: r.name, tokenHash: r.tokenHash, createdAt: r.createdAt, lastSeenAt: r.lastSeenAt ?? undefined, revokedAt: r.revokedAt ?? undefined }));
  }

  async revokeDevice(id: string, at: string) {
    const row = await this.db
      .update(schema.daemonDevices)
      .set({ revokedAt: at })
      .where(and(eq(schema.daemonDevices.id, id), sql`${schema.daemonDevices.revokedAt} IS NULL`))
      .returning({ id: schema.daemonDevices.id })
      .get();
    return Boolean(row);
  }

  async listRecent(limit: number) {
    const rows = await this.db.select().from(this.t).orderBy(sql`${this.t.tokenNumber} DESC`).limit(limit).all();
    return rows.map(rowToTicket);
  }
}
