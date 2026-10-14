import type { IntentCommand, ProjectManifest, ProjectMutation } from '@tessellate/schemas';
import { IntentCommandSchema } from '@tessellate/schemas';
import { planMutationsFromIntent } from './mutation-planner.js';

/**
 * Client for the host-daemon inference queue (D-033). This is the ONLY path for natural-language
 * intelligence: there is no deterministic or BYO-key fallback. When the host is offline the
 * user is told so plainly; nothing is guessed or applied.
 */

export type TicketKind = 'intent-command' | 'interpret-brief';

export interface QueueProgress {
  status: 'submitting' | 'queued' | 'processing' | 'completed' | 'failed' | 'offline';
  tokenNumber?: number;
  position?: number;
  estimatedWaitSeconds?: number;
  hostOnline?: boolean;
  message: string;
}

export type QueueProgressCallback = (progress: QueueProgress) => void;

export interface QueueClientOptions {
  /** Base URL of the API. Defaults to the same origin (production) or the local wrangler dev port. */
  apiBase?: string;
  /** Turnstile token for signed-out users (required by production deployments). */
  turnstileToken?: string;
  /** Maximum time to wait for a result before cancelling the ticket. */
  timeoutMs?: number;
  pollIntervalMs?: number;
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

export interface SubmittedTicket {
  ticketId: string;
  ticketToken: string;
  tokenNumber: number;
  position: number;
  estimatedWaitSeconds: number;
  hostOnline: boolean;
}

export type TicketOutcome =
  | { status: 'completed'; result: unknown; ticketId: string }
  | { status: 'failed'; error: string; ticketId?: string };

export interface QueueExecutionResult {
  success: boolean;
  command?: IntentCommand;
  mutations: ProjectMutation[];
  explanation: string;
  tokenNumber?: number;
  error?: string;
}

export function defaultApiBase(): string {
  const configured = (globalThis as { __TESSELLATE_API_BASE__?: string }).__TESSELLATE_API_BASE__;
  if (configured !== undefined) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:8787';
  }
  return '';
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

export async function checkHostHealth(options: QueueClientOptions = {}): Promise<{ hostOnline: boolean; pendingTasks: number; reachable: boolean }> {
  const f = options.fetchImpl ?? fetch;
  try {
    const res = await f(`${options.apiBase ?? defaultApiBase()}/api/inference/health`, { credentials: 'include' });
    if (res.ok) {
      const data = await readJson(res);
      return { hostOnline: Boolean(data.hostOnline), pendingTasks: Number(data.pendingTasks ?? 0), reachable: true };
    }
  } catch {
    // network failure: reported as unreachable below
  }
  return { hostOnline: false, pendingTasks: 0, reachable: false };
}

/** Submits a ticket. Throws an Error with a user-readable message on refusal. */
export async function submitTicket(
  kind: TicketKind,
  prompt: string,
  context: Record<string, unknown>,
  options: QueueClientOptions = {},
): Promise<SubmittedTicket> {
  const f = options.fetchImpl ?? fetch;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.turnstileToken) headers['cf-turnstile-response'] = options.turnstileToken;

  let res: Response;
  try {
    res = await f(`${options.apiBase ?? defaultApiBase()}/api/inference/queue`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify({ kind, prompt, context }),
      signal: options.signal,
    });
  } catch {
    throw new Error('Tessellate could not reach its intelligence service. Check your connection and try again.');
  }
  const body = await readJson(res);
  if (res.status !== 202) {
    throw new Error(String(body.message ?? body.error ?? `The request was refused (HTTP ${res.status}).`));
  }
  return body as unknown as SubmittedTicket;
}

/** Waits for a ticket to finish, reporting progress. Cancels the ticket if it times out. */
export async function waitForTicket(
  ticket: SubmittedTicket,
  onProgress?: QueueProgressCallback,
  options: QueueClientOptions = {},
): Promise<TicketOutcome> {
  const f = options.fetchImpl ?? fetch;
  const base = options.apiBase ?? defaultApiBase();
  const timeoutMs = options.timeoutMs ?? 60_000;
  const interval = options.pollIntervalMs ?? 1_000;
  const started = Date.now();
  const auth = { 'X-Ticket-Token': ticket.ticketToken };

  while (Date.now() - started < timeoutMs) {
    await sleep(interval, options.signal);
    let data: Record<string, unknown>;
    try {
      const res = await f(`${base}/api/inference/tickets/${encodeURIComponent(ticket.ticketId)}`, {
        credentials: 'include',
        headers: auth,
        signal: options.signal,
      });
      if (!res.ok) continue;
      data = await readJson(res);
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err;
      continue;
    }

    const status = String(data.status);
    if (status === 'completed') {
      onProgress?.({ status: 'completed', tokenNumber: ticket.tokenNumber, message: 'Done.' });
      return { status: 'completed', result: data.result, ticketId: ticket.ticketId };
    }
    if (status === 'failed' || status === 'cancelled') {
      const error = String(data.error ?? 'The request could not be completed.');
      onProgress?.({ status: 'failed', tokenNumber: ticket.tokenNumber, message: error });
      return { status: 'failed', error, ticketId: ticket.ticketId };
    }
    const hostOnline = Boolean(data.hostOnline);
    const position = Number(data.position ?? 0);
    onProgress?.({
      status: status === 'processing' ? 'processing' : hostOnline ? 'queued' : 'offline',
      tokenNumber: ticket.tokenNumber,
      position,
      estimatedWaitSeconds: Number(data.estimatedWaitSeconds ?? 0),
      hostOnline,
      message:
        status === 'processing'
          ? 'Working on it…'
          : hostOnline
            ? `In queue, position ${position}`
            : 'The intelligence host is offline. Your request is waiting in the queue.',
    });
  }

  // Timed out: cancel so a stale command can never be applied to a project that has since changed.
  try {
    await f(`${base}/api/inference/tickets/${encodeURIComponent(ticket.ticketId)}`, { method: 'DELETE', credentials: 'include', headers: auth });
  } catch {
    // best effort
  }
  const error = 'Tessellate’s intelligence host did not respond in time, so the request was cancelled. Nothing was changed.';
  onProgress?.({ status: 'failed', tokenNumber: ticket.tokenNumber, message: error });
  return { status: 'failed', error, ticketId: ticket.ticketId };
}

/**
 * Sends a natural-language command to the host daemon and returns the validated mutation plan.
 * Never applies anything itself and never guesses: on any failure `success` is false and
 * `mutations` is empty.
 */
export async function executeQueuedCommand(
  manifest: ProjectManifest,
  activeScreenId: string,
  userPrompt: string,
  onProgress?: QueueProgressCallback,
  options: QueueClientOptions = {},
): Promise<QueueExecutionResult> {
  const prompt = userPrompt.trim();
  if (!prompt) {
    return { success: false, mutations: [], explanation: '', error: 'Type what you want to change first.' };
  }

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  onProgress?.({ status: 'submitting', message: 'Sending to Tessellate…' });

  let ticket: SubmittedTicket;
  try {
    ticket = await submitTicket(
      'intent-command',
      prompt,
      { screenAst: activeScreen?.rootNode ?? {}, designDna: manifest.designDNA ?? {}, activeScreenId },
      options,
    );
  } catch (err) {
    const error = (err as Error).message;
    onProgress?.({ status: 'failed', message: error });
    return { success: false, mutations: [], explanation: '', error };
  }

  onProgress?.({
    status: ticket.hostOnline ? 'queued' : 'offline',
    tokenNumber: ticket.tokenNumber,
    position: ticket.position,
    estimatedWaitSeconds: ticket.estimatedWaitSeconds,
    hostOnline: ticket.hostOnline,
    message: ticket.hostOnline
      ? `In queue, position ${ticket.position}`
      : 'The intelligence host is offline. Your request is waiting in the queue.',
  });

  const outcome = await waitForTicket(ticket, onProgress, options);
  if (outcome.status === 'failed') {
    return { success: false, mutations: [], explanation: '', error: outcome.error, tokenNumber: ticket.tokenNumber };
  }

  const parsed = IntentCommandSchema.safeParse(outcome.result);
  if (!parsed.success) {
    const error = 'Tessellate returned an answer it could not apply safely. Nothing was changed.';
    return { success: false, mutations: [], explanation: '', error, tokenNumber: ticket.tokenNumber };
  }

  const plan = planMutationsFromIntent(manifest, activeScreenId, parsed.data);
  return {
    success: true,
    command: parsed.data,
    mutations: plan.mutations,
    explanation: parsed.data.summary || plan.explanation,
    tokenNumber: ticket.tokenNumber,
  };
}
