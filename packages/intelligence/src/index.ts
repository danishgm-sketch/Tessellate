import { BriefInterpretationSchema, type BriefInterpretation } from '@tessellate/schemas';

/**
 * Client for the host-daemon intelligence queue (D-033). This is the ONLY path for natural-language
 * intelligence in Tessellate (site, Workbench, CLI and MCP): there is no deterministic or BYO-key
 * fallback. When the host is offline the caller is told so plainly; nothing is guessed.
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
  /** Shorter wait used when the host is offline at submission time (default 20 s). */
  offlineTimeoutMs?: number;
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
  const error =
    'Tessellate’s intelligence host is offline or busy, so the request was cancelled. Nothing was changed. Check the status page, or edit directly in the Workbench.';
  onProgress?.({ status: 'failed', tokenNumber: ticket.tokenNumber, message: error });
  return { status: 'failed', error, ticketId: ticket.ticketId };
}

export interface InterpretationResult {
  success: boolean;
  interpretation?: BriefInterpretation;
  error?: string;
}

/**
 * Sends a product brief to the host daemon for interpretation (D-033). There is no keyword fallback:
 * if the host is offline or unsure, the user is told so and nothing is invented.
 */
export async function requestInterpretation(
  brief: string,
  onProgress?: QueueProgressCallback,
  options: QueueClientOptions = {},
): Promise<InterpretationResult> {
  const text = brief.trim();
  if (text.length < 12) {
    return { success: false, error: 'Describe the product in a sentence or two: who uses it and what they do in it.' };
  }
  onProgress?.({ status: 'submitting', message: 'Sending your brief to Tessellate…' });
  let ticket: SubmittedTicket;
  try {
    ticket = await submitTicket('interpret-brief', text, {}, options);
  } catch (err) {
    const error = (err as Error).message;
    onProgress?.({ status: 'failed', message: error });
    return { success: false, error };
  }
  onProgress?.({
    status: ticket.hostOnline ? 'queued' : 'offline',
    tokenNumber: ticket.tokenNumber,
    position: ticket.position,
    estimatedWaitSeconds: ticket.estimatedWaitSeconds,
    hostOnline: ticket.hostOnline,
    message: ticket.hostOnline ? `In queue, position ${ticket.position}` : 'The intelligence host is offline. Your brief is waiting in the queue.',
  });
  const waitOptions = ticket.hostOnline
    ? options
    : { ...options, timeoutMs: Math.min(options.timeoutMs ?? 60_000, options.offlineTimeoutMs ?? 20_000) };
  const outcome = await waitForTicket(ticket, onProgress, waitOptions);
  if (outcome.status === 'failed') return { success: false, error: outcome.error };
  const parsed = BriefInterpretationSchema.safeParse(outcome.result);
  if (!parsed.success) {
    return { success: false, error: 'Tessellate returned an interpretation it could not use safely. Please try again.' };
  }
  return { success: true, interpretation: parsed.data };
}
