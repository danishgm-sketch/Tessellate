import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProjectManifest } from '@tessellate/schemas';
import { IntentCommandSchema, planMutationsFromIntent, executeQueuedCommand } from '../index.js';
import { createSampleProject } from '../store/sample-project.js';

/** Minimal fake of the queue API used by the host-daemon client (D-033). */
function fakeQueue(behaviour: {
  enqueueStatus?: number;
  enqueueBody?: Record<string, unknown>;
  ticketStates?: Array<Record<string, unknown>>;
  unreachable?: boolean;
}) {
  const calls: Array<{ url: string; method: string }> = [];
  let pollIndex = 0;
  const impl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = init?.method ?? 'GET';
    calls.push({ url, method });
    if (behaviour.unreachable) throw new TypeError('Failed to fetch');
    if (url.endsWith('/api/inference/queue')) {
      return new Response(
        JSON.stringify(
          behaviour.enqueueBody ?? { ticketId: 't1', ticketToken: 'tok', tokenNumber: 7, position: 1, estimatedWaitSeconds: 1, hostOnline: true },
        ),
        { status: behaviour.enqueueStatus ?? 202 },
      );
    }
    if (method === 'DELETE') return new Response(JSON.stringify({ status: 'cancelled' }), { status: 200 });
    const states = behaviour.ticketStates ?? [];
    const state = states[Math.min(pollIndex++, states.length - 1)] ?? { status: 'queued', hostOnline: true, position: 1 };
    return new Response(JSON.stringify(state), { status: 200 });
  });
  return { impl: impl as unknown as typeof fetch, calls };
}

const fast = { apiBase: 'http://api.test', pollIntervalMs: 1 };

describe('Host-daemon natural-language layer (D-033)', () => {
  let sampleProject: ProjectManifest;

  beforeEach(() => {
    sampleProject = createSampleProject();
  });

  describe('3. Natural-Language IntentCommand & Mutation Planning', () => {
    it('validates IntentCommand schema structure', () => {
      const valid = IntentCommandSchema.safeParse({
        action: 'adjust-dna',
        summary: 'Elevate contrast and reduce motion',
        preserveLockedNodes: true,
        dnaDeltas: { contrast: 25, motion: -30 },
      });
      expect(valid.success).toBe(true);

      const invalid = IntentCommandSchema.safeParse({
        action: 'unsupported-arbitrary-action',
        summary: 'Invalid',
      });
      expect(invalid.success).toBe(false);
    });

    it('plans safe validated mutations and respects node locks', () => {
      const activeScreen = sampleProject.screens[0]!;
      const headerNode = activeScreen.rootNode.children[0]!;

      // Lock header node structure
      headerNode.locks = { structure: true };

      // Attempt replace-component on locked header
      const replaceCommand = {
        action: 'replace-component' as const,
        summary: 'Replace locked header',
        targetScreenId: activeScreen.id,
        targetNodeIds: [headerNode.id],
        replacementResourceSlug: 'new-header',
        preserveLockedNodes: true,
      };

      expect(() => {
        planMutationsFromIntent(sampleProject, activeScreen.id, replaceCommand);
      }).toThrow(/Cannot replace node.*Structural lock is active/);

      // Attempt recompose-screen: locked node must survive
      const recomposeCommand = {
        action: 'recompose-screen' as const,
        summary: 'Recompose around locked header',
        targetScreenId: activeScreen.id,
        preserveLockedNodes: true,
      };

      const plan = planMutationsFromIntent(sampleProject, activeScreen.id, recomposeCommand);
      expect(plan.mutations.length).toBeGreaterThan(0);
      expect(plan.mutations[0]?.type).toBe('REPLACE_NODE');
    });

    it('plans DNA and feel mutations cleanly', () => {
      const activeScreen = sampleProject.screens[0]!;
      const feelCommand = {
        action: 'apply-feel' as const,
        summary: 'Apply professional but playful feel',
        feelDescriptors: 'professional but playful',
        preserveLockedNodes: true,
      };

      const plan = planMutationsFromIntent(sampleProject, activeScreen.id, feelCommand);
      expect(plan.mutations.length).toBeGreaterThan(0);
      expect(plan.mutations.some((m) => m.type === 'SET_INTENT')).toBe(true);
    });
  });

  describe('Queue client: no fallback, never guesses', () => {
    it('applies nothing and explains when the daemon cannot interpret the request', async () => {
      const q = fakeQueue({ ticketStates: [{ status: 'failed', error: 'Tessellate could not confidently interpret this request.' }] });
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, 'add a booking calendar', undefined, { ...fast, fetchImpl: q.impl });
      expect(res.success).toBe(false);
      expect(res.mutations).toHaveLength(0);
      expect(res.error).toContain('could not confidently interpret');
    });

    it('plans validated mutations from a completed daemon result', async () => {
      const q = fakeQueue({
        ticketStates: [
          { status: 'processing', hostOnline: true },
          { status: 'completed', result: { action: 'apply-feel', summary: 'Calmer', feelDescriptors: 'calm', preserveLockedNodes: true } },
        ],
      });
      const progress: string[] = [];
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, 'make it calmer', (p) => progress.push(p.status), { ...fast, fetchImpl: q.impl });
      expect(res.success).toBe(true);
      expect(res.command?.action).toBe('apply-feel');
      expect(res.mutations.length).toBeGreaterThan(0);
      expect(progress).toContain('processing');
    });

    it('rejects a schema-invalid daemon result instead of applying it', async () => {
      const q = fakeQueue({ ticketStates: [{ status: 'completed', result: { action: 'drop-database' } }] });
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, 'do it', undefined, { ...fast, fetchImpl: q.impl });
      expect(res.success).toBe(false);
      expect(res.mutations).toHaveLength(0);
    });

    it('reports an unreachable service instead of falling back to a deterministic recompose', async () => {
      const q = fakeQueue({ unreachable: true });
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, 'make it calmer', undefined, { ...fast, fetchImpl: q.impl });
      expect(res.success).toBe(false);
      expect(res.mutations).toHaveLength(0);
      expect(res.error).toMatch(/could not reach/i);
    });

    it('surfaces the server refusal message (e.g. rate limit) verbatim', async () => {
      const q = fakeQueue({ enqueueStatus: 429, enqueueBody: { error: 'Rate Limited', message: 'Too many requests. Please wait a minute and try again.' } });
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, 'make it calmer', undefined, { ...fast, fetchImpl: q.impl });
      expect(res.success).toBe(false);
      expect(res.error).toBe('Too many requests. Please wait a minute and try again.');
    });

    it('cancels the ticket on timeout so a stale command can never apply later', async () => {
      const q = fakeQueue({ enqueueBody: { ticketId: 't9', ticketToken: 'tok', tokenNumber: 9, position: 3, estimatedWaitSeconds: 30, hostOnline: false } });
      const progress: string[] = [];
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, 'make it calmer', (p) => progress.push(p.status), {
        ...fast,
        timeoutMs: 20,
        fetchImpl: q.impl,
      });
      expect(res.success).toBe(false);
      expect(res.mutations).toHaveLength(0);
      expect(progress).toContain('offline');
      expect(q.calls.some((c) => c.method === 'DELETE' && c.url.endsWith('/tickets/t9'))).toBe(true);
    });

    it('refuses an empty prompt without contacting the service', async () => {
      const q = fakeQueue({});
      const res = await executeQueuedCommand(sampleProject, sampleProject.screens[0]!.id, '   ', undefined, { ...fast, fetchImpl: q.impl });
      expect(res.success).toBe(false);
      expect(q.calls).toHaveLength(0);
    });
  });
});
