import { drizzle } from 'drizzle-orm/d1';
import { and, asc, eq, inArray, lt, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';

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

/** Persistence for the inference queue. Production uses D1; development/test may use memory. */
export interface TicketStore {
  insert(ticket: Omit<Ticket, 'tokenNumber'>): Promise<Ticket>;
  get(id: string): Promise<Ticket | undefined>;
  /** Atomically claims the oldest queued ticket for a device. */
  claimNext(deviceId: string): Promise<Ticket | undefined>;
  complete(id: string, deviceId: string, result: string): Promise<boolean>;
  fail(id: string, deviceId: string, errorMessage: string): Promise<boolean>;
  cancel(id: string): Promise<boolean>;
  countActive(ownerKey?: string): Promise<number>;
  positionOf(ticket: Ticket): Promise<number>;
  /** Removes prompt/payload/result content from finished tickets older than the cutoff. */
  purgeFinishedBefore(cutoffIso: string): Promise<number>;
  findDeviceByTokenHash(tokenHash: string): Promise<DaemonDevice | undefined>;
  touchDevice(id: string, at: string): Promise<void>;
  lastDeviceSeenAt(): Promise<string | undefined>;
  createDevice(device: DaemonDevice): Promise<void>;
  listDevices(): Promise<DaemonDevice[]>;
  revokeDevice(id: string, at: string): Promise<boolean>;
  listRecent(limit: number): Promise<Ticket[]>;
}

const ACTIVE: TicketStatus[] = ['queued', 'processing'];

export class MemoryTicketStore implements TicketStore {
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

  private readonly tickets = new Map<string, Ticket>();
  private readonly devices = new Map<string, DaemonDevice>();
  private nextToken = 1;

  addDevice(device: DaemonDevice): void {
    this.devices.set(device.id, device);
  }

  async insert(ticket: Omit<Ticket, 'tokenNumber'>): Promise<Ticket> {
    const stored: Ticket = { ...ticket, tokenNumber: this.nextToken++ };
    this.tickets.set(stored.id, stored);
    return stored;
  }

  async get(id: string) {
    return this.tickets.get(id);
  }

  async claimNext(deviceId: string) {
    let oldest: Ticket | undefined;
    for (const t of this.tickets.values()) {
      if (t.status === 'queued' && (!oldest || t.tokenNumber < oldest.tokenNumber)) oldest = t;
    }
    if (!oldest) return undefined;
    oldest.status = 'processing';
    oldest.deviceId = deviceId;
    oldest.startedAt = new Date().toISOString();
    return { ...oldest };
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
    for (const d of this.devices.values()) if (d.lastSeenAt && (!latest || d.lastSeenAt > latest)) latest = d.lastSeenAt;
    return latest;
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
    const rows = await this.db.select().from(schema.inferenceTickets).orderBy(sql`${schema.inferenceTickets.tokenNumber} DESC`).limit(limit).all();
    return rows.map(rowToTicket);
  }

  async insert(ticket: Omit<Ticket, 'tokenNumber'>): Promise<Ticket> {
    const row = await this.db
      .insert(schema.inferenceTickets)
      .values({
        ...ticket,
        tokenNumber: sql`(SELECT COALESCE(MAX(${schema.inferenceTickets.tokenNumber}), 0) + 1 FROM ${schema.inferenceTickets})`,
      })
      .returning()
      .get();
    return rowToTicket(row);
  }

  async get(id: string) {
    const row = await this.db.select().from(schema.inferenceTickets).where(eq(schema.inferenceTickets.id, id)).get();
    return row ? rowToTicket(row) : undefined;
  }

  async claimNext(deviceId: string) {
    // Single-statement claim: the UPDATE only succeeds for a row that is still queued.
    const row = await this.db
      .update(schema.inferenceTickets)
      .set({ status: 'processing', deviceId, startedAt: new Date().toISOString() })
      .where(
        eq(
          schema.inferenceTickets.id,
          sql`(SELECT ${schema.inferenceTickets.id} FROM ${schema.inferenceTickets} WHERE ${schema.inferenceTickets.status} = 'queued' ORDER BY ${schema.inferenceTickets.tokenNumber} ASC LIMIT 1)`,
        ),
      )
      .returning()
      .get();
    return row ? rowToTicket(row) : undefined;
  }

  private async finish(id: string, deviceId: string, values: Partial<typeof schema.inferenceTickets.$inferInsert>) {
    const row = await this.db
      .update(schema.inferenceTickets)
      .set({ ...values, completedAt: new Date().toISOString() })
      .where(
        and(
          eq(schema.inferenceTickets.id, id),
          eq(schema.inferenceTickets.status, 'processing'),
          eq(schema.inferenceTickets.deviceId, deviceId),
        ),
      )
      .returning({ id: schema.inferenceTickets.id })
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
      .update(schema.inferenceTickets)
      .set({ status: 'cancelled', completedAt: new Date().toISOString() })
      .where(and(eq(schema.inferenceTickets.id, id), eq(schema.inferenceTickets.status, 'queued')))
      .returning({ id: schema.inferenceTickets.id })
      .get();
    return Boolean(row);
  }

  async countActive(ownerKey?: string) {
    const conds = [inArray(schema.inferenceTickets.status, ACTIVE)];
    if (ownerKey) conds.push(eq(schema.inferenceTickets.ownerKey, ownerKey));
    const row = await this.db
      .select({ n: sql<number>`count(*)` })
      .from(schema.inferenceTickets)
      .where(and(...conds))
      .get();
    return Number(row?.n ?? 0);
  }

  async positionOf(ticket: Ticket) {
    if (ticket.status !== 'queued') return 0;
    const row = await this.db
      .select({ n: sql<number>`count(*)` })
      .from(schema.inferenceTickets)
      .where(and(eq(schema.inferenceTickets.status, 'queued'), lt(schema.inferenceTickets.tokenNumber, ticket.tokenNumber)))
      .get();
    return Number(row?.n ?? 0) + 1;
  }

  async purgeFinishedBefore(cutoffIso: string) {
    const rows = await this.db
      .update(schema.inferenceTickets)
      .set({ prompt: '', payload: '{}', result: null })
      .where(
        and(
          inArray(schema.inferenceTickets.status, ['completed', 'failed', 'cancelled']),
          lt(schema.inferenceTickets.completedAt, cutoffIso),
          sql`${schema.inferenceTickets.prompt} != ''`,
        ),
      )
      .returning({ id: schema.inferenceTickets.id })
      .all();
    return rows.length;
  }

  async findDeviceByTokenHash(tokenHash: string) {
    const row = await this.db
      .select()
      .from(schema.daemonDevices)
      .where(eq(schema.daemonDevices.tokenHash, tokenHash))
      .get();
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
      .select({ at: schema.daemonDevices.lastSeenAt })
      .from(schema.daemonDevices)
      .orderBy(asc(sql`${schema.daemonDevices.lastSeenAt} IS NULL`), sql`${schema.daemonDevices.lastSeenAt} DESC`)
      .limit(1)
      .get();
    return row?.at ?? undefined;
  }
}
