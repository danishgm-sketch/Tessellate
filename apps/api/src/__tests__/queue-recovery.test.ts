import { describe, it, expect } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { D1TicketStore, LEASE_MS, MAX_ATTEMPTS, MemoryTicketStore, claimNextFairly, type TicketStore } from '../inference/store.js';

/** Minimal D1 adapter over node:sqlite so the real D1 store SQL is exercised in unit tests. */
function sqliteD1(): D1Database {
  const db = new DatabaseSync(':memory:');
  const dir = path.resolve(__dirname, '../../migrations');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.sql')).sort()) db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
  const prepare = (query: string) => {
    let params: unknown[] = [];
    const stmt = {
      bind: (...args: unknown[]) => {
        params = args;
        return stmt;
      },
      all: async () => ({ results: db.prepare(query).all(...(params as never[])), success: true, meta: {} }),
      raw: async () => db.prepare(query).all(...(params as never[])).map((r) => Object.values(r as object)),
      first: async () => db.prepare(query).get(...(params as never[])) ?? null,
      run: async () => {
        const info = db.prepare(query).run(...(params as never[]));
        return { success: true, meta: { changes: info.changes }, results: [] };
      },
    };
    return stmt;
  };
  return { prepare, batch: async () => [], exec: async () => ({ count: 0, duration: 0 }), dump: async () => new ArrayBuffer(0) } as unknown as D1Database;
}

async function enqueue(store: TicketStore, ownerKey: string, n: number) {
  for (let i = 0; i < n; i++) {
    await store.insert({
      id: `t-${ownerKey}-${i}`,
      kind: 'intent-command',
      ownerKey,
      ticketTokenHash: 'h',
      prompt: `p${i}`,
      payload: '{}',
      status: 'queued',
      createdAt: new Date(Date.UTC(2026, 9, 14, 12, 0, i)).toISOString(),
    });
  }
}

for (const [label, make] of [
  ['memory', () => new MemoryTicketStore()],
  ['D1 (sqlite)', () => new D1TicketStore(sqliteD1())],
] as const) {
  describe(`Queue crash recovery and fairness — ${label} store (Phase 27 gate)`, () => {
    it('re-queues a ticket whose daemon died, and serves it again', async () => {
      const store: TicketStore = make();
      await enqueue(store, 'user:a', 1);
      const t0 = new Date('2026-10-14T12:00:00Z');
      const first = await claimNextFairly(store, 'dev-1', t0);
      expect(first?.attempts).toBe(1);

      // Daemon crashes; nothing is claimable while the lease is valid.
      expect(await claimNextFairly(store, 'dev-2', new Date(t0.getTime() + 1000))).toBeUndefined();

      // After the lease expires the ticket is re-queued and a restarted daemon picks it up.
      const later = new Date(t0.getTime() + LEASE_MS + 1000);
      const second = await claimNextFairly(store, 'dev-2', later);
      expect(second?.id).toBe(first?.id);
      expect(second?.attempts).toBe(2);
      // The crashed device can no longer complete it; the new owner can.
      expect(await store.complete(first!.id, 'dev-1', '{}')).toBe(false);
      expect(await store.complete(first!.id, 'dev-2', '{"action":"surprise-me"}')).toBe(true);
    });

    it(`fails a ticket honestly after ${MAX_ATTEMPTS} lost attempts instead of looping forever`, async () => {
      const store: TicketStore = make();
      await enqueue(store, 'user:a', 1);
      let now = new Date('2026-10-14T12:00:00Z');
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        expect(await claimNextFairly(store, `dev-${i}`, now)).toBeDefined();
        now = new Date(now.getTime() + LEASE_MS + 1000);
      }
      expect(await claimNextFairly(store, 'dev-x', now)).toBeUndefined();
      const [t] = await store.listRecent(1);
      expect(t?.status).toBe('failed');
      expect(t?.errorMessage).toMatch(/stopped responding/);
    });

    it('serves 200 tickets with owner round-robin and no losses', async () => {
      const store: TicketStore = make();
      await enqueue(store, 'user:heavy', 150);
      for (let u = 0; u < 10; u++) await enqueue(store, `user:light-${u}`, 3);
      await enqueue(store, 'guest:g1', 20);

      const served: string[] = [];
      let now = new Date('2026-10-14T12:00:00Z');
      for (;;) {
        now = new Date(now.getTime() + 10);
        const t = await claimNextFairly(store, 'dev-1', now);
        if (!t) break;
        served.push(t.ownerKey);
        expect(await store.complete(t.id, 'dev-1', '{}')).toBe(true);
      }
      expect(served).toHaveLength(200);
      // All ten light users are served within the first ~25 claims despite 150 heavy tickets ahead.
      const firstLight = new Set(served.slice(0, 25).filter((o) => o.startsWith('user:light')));
      expect(firstLight.size).toBe(10);
      // The guest is not starved: served at least once in the first 10 claims.
      expect(served.slice(0, 10)).toContain('guest:g1');
      expect(await store.countActive()).toBe(0);
    });
  });
}
