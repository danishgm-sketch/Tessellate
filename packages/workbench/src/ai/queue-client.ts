import type { IntentCommand, ProjectManifest, ProjectMutation } from '@tessellate/schemas';
import { IntentCommandSchema } from '@tessellate/schemas';
import { submitTicket, waitForTicket, type QueueClientOptions, type QueueProgressCallback, type SubmittedTicket } from '@tessellate/intelligence';
import { planMutationsFromIntent } from './mutation-planner.js';

export * from '@tessellate/intelligence';

/** Workbench natural-language commands over the shared intelligence queue client (D-033). */

export interface QueueExecutionResult {
  success: boolean;
  command?: IntentCommand;
  mutations: ProjectMutation[];
  explanation: string;
  tokenNumber?: number;
  error?: string;
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
  options: QueueClientOptions & { selectedNodeId?: string | null } = {},
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
      { screenAst: activeScreen?.rootNode ?? {}, designDna: manifest.designDNA ?? {}, activeScreenId, selectedNodeId: options.selectedNodeId ?? null },
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

  // When the host is offline, do not keep the user waiting for a full minute: wait briefly in case it
  // reconnects, then cancel and say so plainly.
  const waitOptions = ticket.hostOnline
    ? options
    : { ...options, timeoutMs: Math.min(options.timeoutMs ?? 60_000, options.offlineTimeoutMs ?? 20_000) };
  const outcome = await waitForTicket(ticket, onProgress, waitOptions);
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
