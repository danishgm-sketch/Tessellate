/**
 * Cloudflare Worker entry point. `index.ts` holds the Hono app (importable by Node tests); this module
 * adds the runtime-only pieces: the QueueHub Durable Object and scheduled maintenance.
 */
import app from './index.js';
import { QueueHub } from './queue/hub.js';
import { completeTicket, getStore, QUEUE_LIMITS } from './routes/inference.js';
import type { Env } from './types.js';

QueueHub.storeFactory = (env) => getStore(env);
QueueHub.completeHandler = async (env, deviceId, ticketId, result, error) => {
  const outcome = await completeTicket(env, deviceId, ticketId, result, error);
  return outcome.status === 200 ? null : String(outcome.body.message ?? outcome.body.error ?? 'Rejected');
};

/** Lease recovery and privacy retention (prompts purged after QUEUE_LIMITS.retentionMs). */
export async function runMaintenance(env: Env, now = new Date()): Promise<{ requeued: number; failed: number; purged: number }> {
  const store = getStore(env);
  const { requeued, failed } = await store.requeueExpired(now.toISOString());
  const purged = await store.purgeFinishedBefore(new Date(now.getTime() - QUEUE_LIMITS.retentionMs).toISOString());
  return { requeued, failed, purged };
}

export { QueueHub };

export default {
  fetch: app.fetch,
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      runMaintenance(env).then((r) => {
        console.log(`[maintenance] requeued=${r.requeued} failed=${r.failed} purged=${r.purged}`);
      }),
    );
  },
} satisfies ExportedHandler<Env>;
