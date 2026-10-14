/**
 * Fair scheduling for the single-host intelligence queue (D-035).
 *
 * - Round-robin across owners: an owner with many queued tickets cannot starve others.
 * - Signed-in users are served before guests, but guests are guaranteed at least one slot in every
 *   GUEST_EVERY claims, so they cannot be starved either.
 * - Within one owner, tickets are served oldest first.
 */
export const GUEST_EVERY = 3;

export interface SchedulableTicket {
  id: string;
  ownerKey: string;
  tokenNumber: number;
}

export interface SchedulerState {
  /** ownerKey → claim sequence number of that owner's last served ticket. */
  lastServed: Map<string, number>;
  /** Monotonic claim counter. */
  sequence: number;
  /** Claims since a guest was last served. */
  sinceGuest: number;
}

export function createSchedulerState(): SchedulerState {
  return { lastServed: new Map(), sequence: 0, sinceGuest: 0 };
}

const isGuest = (ownerKey: string) => ownerKey.startsWith('guest:');

/** Picks the next ticket to serve, or undefined when nothing is queued. Pure apart from `state` updates via `markServed`. */
export function pickNext<T extends SchedulableTicket>(queued: readonly T[], state: SchedulerState): T | undefined {
  if (queued.length === 0) return undefined;

  // Oldest ticket per owner.
  const heads = new Map<string, T>();
  for (const t of queued) {
    const current = heads.get(t.ownerKey);
    if (!current || t.tokenNumber < current.tokenNumber) heads.set(t.ownerKey, t);
  }

  const byFairness = (a: T, b: T) => {
    const la = state.lastServed.get(a.ownerKey) ?? -1;
    const lb = state.lastServed.get(b.ownerKey) ?? -1;
    return la - lb || a.tokenNumber - b.tokenNumber;
  };

  const owners = [...heads.values()];
  const users = owners.filter((t) => !isGuest(t.ownerKey)).sort(byFairness);
  const guests = owners.filter((t) => isGuest(t.ownerKey)).sort(byFairness);

  const guestDue = guests.length > 0 && state.sinceGuest >= GUEST_EVERY - 1;
  if (guestDue || users.length === 0) return guests[0] ?? users[0];
  return users[0];
}

export function markServed(ticket: SchedulableTicket, state: SchedulerState): void {
  state.sequence++;
  state.lastServed.set(ticket.ownerKey, state.sequence);
  state.sinceGuest = isGuest(ticket.ownerKey) ? 0 : state.sinceGuest + 1;
  // Bound memory: forget owners not served in the last 10k claims.
  if (state.lastServed.size > 5000) {
    for (const [owner, seq] of state.lastServed) if (state.sequence - seq > 10_000) state.lastServed.delete(owner);
  }
}
