import {
  isNonActionableIntentPrompt,
  IntentCommandSchema,
  type ProjectManifest,
  type ProjectMutation,
  type IntentCommand,
} from '@tessellate/schemas';
import { planMutationsFromIntent } from './mutation-planner.js';
import { tryDeterministicCommandMatch } from './ai-service.js';

export interface QueueProgressCallback {
  (status: {
    status: 'checking' | 'queued' | 'processing' | 'completed' | 'fallback' | 'unavailable';
    tokenNumber?: number;
    position?: number;
    estimatedWaitSeconds?: number;
    message?: string;
  }): void;
}
export interface QueueExecutionResult {
  success: boolean;
  command?: IntentCommand;
  mutations: ProjectMutation[];
  explanation: string;
  tokenNumber?: number;
  usedFallback: boolean;
  error?: string;
}
export interface HostHealth {
  apiOnline: boolean;
  hostOnline: boolean;
  pendingTasks: number;
}
interface QueueTicket {
  ticketId: string;
  accessToken: string;
  tokenNumber: number;
  position: number;
  estimatedWaitSeconds: number;
}
const OFFLINE_HEALTH: HostHealth = { apiOnline: false, hostOnline: false, pendingTasks: 0 };
function getApiBase(): string | null {
  if (
    typeof window === 'undefined' ||
    !['localhost', '127.0.0.1'].includes(window.location.hostname)
  )
    return '';
  if (window.location.port === '4323') return ''; // Local Sites Worker owns the server-side proxy.
  return null;
}
const unavailable = (message: string): QueueExecutionResult => ({
  success: false,
  mutations: [],
  explanation: message,
  usedFallback: false,
  error: message,
});

export async function checkHostHealth(): Promise<HostHealth> {
  const apiBase = getApiBase();
  // The static Astro preview has no server-side API proxy. Avoid probing a
  // laptop service the user has not explicitly enabled for local development.
  if (apiBase === null) return OFFLINE_HEALTH;
  try {
    const response = await fetch(`${apiBase}/api/inference/health`, {
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (response.ok) {
      const data = (await response.json()) as Partial<HostHealth>;
      return {
        apiOnline: data.apiOnline === true,
        hostOnline: data.hostOnline === true,
        pendingTasks: typeof data.pendingTasks === 'number' ? data.pendingTasks : 0,
      };
    }
  } catch {
    /* A sleeping laptop or stopped Docker is an explicit offline state. */
  }
  return OFFLINE_HEALTH;
}

export async function executeQueuedCommand(
  manifest: ProjectManifest,
  activeScreenId: string,
  userPrompt: string,
  onProgress?: QueueProgressCallback,
  options: { useExperimentalHost?: boolean } = {}
): Promise<QueueExecutionResult> {
  const prompt = userPrompt.trim();
  if (!prompt) return unavailable('Prompt cannot be empty.');
  if (isNonActionableIntentPrompt(prompt)) {
    return unavailable('Questions, negated intent, and requests to keep the current design are not sent to the laptop model. Rephrase as a direct request; your project was not changed.');
  }
  const screen = manifest.screens.find((item) => item.id === activeScreenId);
  if (!screen) return unavailable('Select a screen before issuing a command.');
  const local = tryDeterministicCommandMatch(manifest, activeScreenId, prompt);
  if (local) {
    const plan = planMutationsFromIntent(manifest, activeScreenId, local);
    onProgress?.({ status: 'fallback', message: 'Local deterministic command' });
    return {
      success: true,
      command: local,
      mutations: plan.mutations,
      explanation: `[Deterministic Engine] ${plan.explanation}`,
      usedFallback: true,
    };
  }
  if (!options.useExperimentalHost) {
    return unavailable(
      'No deterministic command matches. Laptop inference is unavailable unless you explicitly enable the experimental Lab. Your project has not been changed.'
    );
  }
  onProgress?.({ status: 'checking', message: 'Checking laptop availability…' });
  const health = await checkHostHealth();
  if (!health.hostOnline) {
    const message =
      getApiBase() === null
        ? 'Laptop inference is not connected to this local Astro preview. Use the configured Sites runtime; local inspection and deterministic commands remain available.'
        : 'Laptop inference is unavailable. The Site backend and this laptop’s Docker host must be running; local inspection and deterministic commands remain available.';
    onProgress?.({ status: 'unavailable', message });
    return unavailable(message);
  }
  let activeApiBase: string | null = null;
  let pendingTicket: QueueTicket | null = null;
  try {
    const apiBase = getApiBase();
    if (apiBase === null)
      return unavailable(
        'Laptop inference is not configured for this local preview. Use the Sites runtime or explicitly enable the local development backend.'
      );
    activeApiBase = apiBase;
    const submitted = await fetch(`${apiBase}/api/inference/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, screenAst: screen.rootNode, designDna: manifest.designDNA }),
      signal: AbortSignal.timeout(5000),
    });
    if (!submitted.ok) {
      const failure: unknown = await submitted.json().catch(() => null);
      const serverMessage =
        typeof failure === 'object' && failure !== null && 'message' in failure &&
        typeof failure.message === 'string' && failure.message.length <= 240
          ? failure.message
          : null;
      throw new Error(serverMessage ?? 'Laptop queue is unavailable or busy. Your project has not been changed.');
    }
    const ticket = (await submitted.json()) as QueueTicket;
    if (typeof ticket.ticketId !== 'string' || typeof ticket.accessToken !== 'string')
      throw new Error('Laptop returned an invalid ticket. Your project has not been changed.');
    pendingTicket = ticket;
    onProgress?.({
      status: 'queued',
      tokenNumber: ticket.tokenNumber,
      position: ticket.position,
      estimatedWaitSeconds: ticket.estimatedWaitSeconds,
      message: `Token #${ticket.tokenNumber} · queued on this laptop`,
    });
    const started = Date.now();
    while (Date.now() - started < 45000) {
      await new Promise((resolve) => setTimeout(resolve, 750));
      const status = await fetch(
        `${apiBase}/api/inference/status/${encodeURIComponent(ticket.ticketId)}`,
        {
          headers: { Authorization: `Bearer ${ticket.accessToken}` },
          signal: AbortSignal.timeout(5000),
          cache: 'no-store',
        }
      );
      if (!status.ok)
        throw new Error(
          'Laptop connection was lost. Your project has not been changed; the request may be retried when the host is available.'
        );
      const data = (await status.json()) as {
        status: string;
        resultCommand?: unknown;
        errorMessage?: string;
        position?: number;
      };
      if (data.status === 'failed')
        throw new Error(
          data.errorMessage ?? 'Laptop inference failed. Your project has not been changed.'
        );
      if (data.status === 'completed') {
        const command = IntentCommandSchema.parse(data.resultCommand);
        const plan = planMutationsFromIntent(manifest, activeScreenId, {
          ...command,
          preserveLockedNodes: true,
        });
        onProgress?.({
          status: 'completed',
          tokenNumber: ticket.tokenNumber,
          message: `Token #${ticket.tokenNumber} · completed by the laptop model`,
        });
        pendingTicket = null;
        return {
          success: true,
          command,
          mutations: plan.mutations,
          explanation: `[Laptop Model] ${plan.explanation}`,
          tokenNumber: ticket.tokenNumber,
          usedFallback: false,
        };
      }
      onProgress?.({
        status: data.status === 'processing' ? 'processing' : 'queued',
        tokenNumber: ticket.tokenNumber,
        position: data.position,
        message: `Token #${ticket.tokenNumber} · ${data.status} on laptop`,
      });
    }
    throw new Error('Laptop inference timed out. Your project has not been changed.');
  } catch (error) {
    if (activeApiBase !== null && pendingTicket !== null) {
      try {
        await fetch(`${activeApiBase}/api/inference/cancel/${encodeURIComponent(pendingTicket.ticketId)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${pendingTicket.accessToken}` },
          signal: AbortSignal.timeout(3000),
        });
      } catch {
        // A disconnected host is already fail-safe; cancellation is best effort.
      }
    }
    const message =
      error instanceof Error
        ? error.message
        : 'Laptop inference is unavailable. Your project has not been changed.';
    onProgress?.({ status: 'unavailable', message });
    return unavailable(message);
  }
}
