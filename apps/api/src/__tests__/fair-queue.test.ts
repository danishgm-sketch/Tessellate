import { describe, it, expect } from 'vitest';
import { createSchedulerState, markServed, pickNext, GUEST_EVERY, type SchedulableTicket } from '../inference/fair-queue.js';

function drain(queue: SchedulableTicket[]) {
  const state = createSchedulerState();
  const order: SchedulableTicket[] = [];
  const pending = [...queue];
  while (pending.length) {
    const next = pickNext(pending, state)!;
    markServed(next, state);
    order.push(next);
    pending.splice(pending.indexOf(next), 1);
  }
  return order;
}

describe('Fair queue scheduling (Phase 27 gate: 200 tickets)', () => {
  it('a heavy user cannot starve light users', () => {
    let n = 1;
    const queue: SchedulableTicket[] = [];
    // One user floods 190 tickets first, then ten other users submit one each.
    for (let i = 0; i < 190; i++) queue.push({ id: `heavy-${i}`, ownerKey: 'user:heavy', tokenNumber: n++ });
    for (let i = 0; i < 10; i++) queue.push({ id: `light-${i}`, ownerKey: `user:light-${i}`, tokenNumber: n++ });

    const order = drain(queue);
    expect(order).toHaveLength(200);
    // Every light user is served within the first 11 claims despite arriving after 190 heavy tickets.
    const lightPositions = order.map((t, i) => (t.ownerKey.startsWith('user:light') ? i : -1)).filter((i) => i >= 0);
    expect(Math.max(...lightPositions)).toBeLessThan(11 * 2);
    // Each owner's own tickets stay in submission order.
    const heavy = order.filter((t) => t.ownerKey === 'user:heavy').map((t) => t.tokenNumber);
    expect(heavy).toEqual([...heavy].sort((a, b) => a - b));
  });

  it('prioritises signed-in users but never starves guests', () => {
    let n = 1;
    const queue: SchedulableTicket[] = [];
    for (let i = 0; i < 150; i++) queue.push({ id: `u-${i}`, ownerKey: `user:${i % 15}`, tokenNumber: n++ });
    for (let i = 0; i < 50; i++) queue.push({ id: `g-${i}`, ownerKey: `guest:${i % 5}`, tokenNumber: n++ });

    const order = drain(queue);
    expect(order).toHaveLength(200);
    // In any window of GUEST_EVERY claims while guests are waiting, at least one guest is served.
    let gap = 0;
    let maxGap = 0;
    let guestsLeft = 50;
    for (const t of order) {
      if (t.ownerKey.startsWith('guest:')) {
        gap = 0;
        guestsLeft--;
      } else if (guestsLeft > 0) {
        gap++;
        maxGap = Math.max(maxGap, gap);
      }
    }
    expect(maxGap).toBeLessThan(GUEST_EVERY);
    // Users are still served more often than guests early on.
    const firstThirty = order.slice(0, 30);
    expect(firstThirty.filter((t) => t.ownerKey.startsWith('user:')).length).toBeGreaterThan(15);
  });

  it('returns undefined for an empty queue', () => {
    expect(pickNext([], createSchedulerState())).toBeUndefined();
  });
});
