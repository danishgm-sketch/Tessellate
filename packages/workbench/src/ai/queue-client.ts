import type { ProjectManifest, ProjectMutation } from '@tessellate/schemas';
import type { IntentCommand } from './intent-command.js';
import { planMutationsFromIntent } from './mutation-planner.js';
import { tryDeterministicCommandMatch } from './ai-service.js';

export interface QueueProgressCallback {
  (status: {
    status: 'checking' | 'queued' | 'processing' | 'completed' | 'fallback';
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

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8787'
  : '';

/**
 * Checks if the bespoke host ML worker is currently online and healthy.
 */
export async function checkHostHealth(): Promise<{ hostOnline: boolean; pendingTasks: number }> {
  try {
    const res = await fetch(`${API_BASE}/api/inference/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { hostOnline: Boolean(data.hostOnline), pendingTasks: data.pendingTasks || 0 };
    }
  } catch {
    // If backend is unreachable or local preview
  }
  return { hostOnline: false, pendingTasks: 0 };
}

/**
 * Dispatches a natural-language command to the host queue with real-time token feedback,
 * or falls back seamlessly to the deterministic engine when host is offline.
 */
export async function executeQueuedCommand(
  manifest: ProjectManifest,
  activeScreenId: string,
  userPrompt: string,
  onProgress?: QueueProgressCallback
): Promise<QueueExecutionResult> {
  const trimmed = userPrompt.trim();
  if (!trimmed) {
    return {
      success: false,
      mutations: [],
      explanation: 'Prompt cannot be empty.',
      usedFallback: false,
      error: 'Prompt cannot be empty.',
    };
  }

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);

  // 1. Check Host Liveness
  if (onProgress) onProgress({ status: 'checking', message: 'Checking host worker...' });
  const health = await checkHostHealth();

  if (!health.hostOnline) {
    // Host is offline: Trigger Deterministic Rule Fallback immediately
    if (onProgress) {
      onProgress({
        status: 'fallback',
        message: 'Host DL offline · Deterministic fallback active',
      });
    }

    const detCommand = tryDeterministicCommandMatch(manifest, activeScreenId, trimmed);
    if (detCommand) {
      const plan = planMutationsFromIntent(manifest, activeScreenId, detCommand);
      return {
        success: true,
        command: detCommand,
        mutations: plan.mutations,
        explanation: `[Deterministic Engine] ${plan.explanation}`,
        usedFallback: true,
      };
    }

    // Default recomposition fallback if no keyword matched
    const fallbackCommand: IntentCommand = {
      action: 'recompose-screen',
      summary: `Deterministic fallback: Recomposed "${activeScreen?.name || 'Screen'}"`,
      preserveLockedNodes: true,
      explanation: 'Deterministic engine recomposition',
    };
    const plan = planMutationsFromIntent(manifest, activeScreenId, fallbackCommand);
    return {
      success: true,
      command: fallbackCommand,
      mutations: plan.mutations,
      explanation: `[Deterministic Engine] Recomposed layout around locked nodes.`,
      usedFallback: true,
    };
  }

  // 2. Submit to Host Queue
  try {
    const queueRes = await fetch(`${API_BASE}/api/inference/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: trimmed,
        screenAst: activeScreen?.rootNode || {},
        designDna: manifest.designDNA || {},
      }),
    });

    if (!queueRes.ok) {
      throw new Error(`Queue submission failed (HTTP ${queueRes.status})`);
    }

    const queueData = await queueRes.json();
    const ticketId = queueData.ticketId;
    const tokenNumber = queueData.tokenNumber;

    if (onProgress) {
      onProgress({
        status: 'queued',
        tokenNumber,
        position: queueData.position,
        estimatedWaitSeconds: queueData.estimatedWaitSeconds,
        message: `Token #${tokenNumber} · Position ${queueData.position} in queue`,
      });
    }

    // 3. Poll ticket status until complete (max 30s)
    const startTime = Date.now();
    while (Date.now() - startTime < 30000) {
      await new Promise((r) => setTimeout(r, 1000));

      const statusRes = await fetch(`${API_BASE}/api/inference/status/${ticketId}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();

        if (statusData.status === 'processing' && onProgress) {
          onProgress({
            status: 'processing',
            tokenNumber,
            message: `Token #${tokenNumber} · Processing on Host Hardware...`,
          });
        }

        if (statusData.status === 'completed' && statusData.resultCommand) {
          const command = statusData.resultCommand as IntentCommand;
          const plan = planMutationsFromIntent(manifest, activeScreenId, command);

          if (onProgress) {
            onProgress({
              status: 'completed',
              tokenNumber,
              message: `Token #${tokenNumber} · Completed!`,
            });
          }

          return {
            success: true,
            command,
            mutations: plan.mutations,
            explanation: `[Host DL Model] ${command.summary || plan.explanation}`,
            tokenNumber,
            usedFallback: false,
          };
        }
      }
    }

    throw new Error('Host queue timeout after 30s.');
  } catch (_err) {
    // If queue communication fails at runtime, degrade cleanly to deterministic engine
    if (onProgress) {
      onProgress({
        status: 'fallback',
        message: 'Host communication timed out · Reverting to deterministic engine',
      });
    }

    const detCommand: IntentCommand = tryDeterministicCommandMatch(manifest, activeScreenId, trimmed) || {
      action: 'recompose-screen',
      summary: 'Recomposed screen',
      preserveLockedNodes: true,
      explanation: 'Deterministic engine recomposition',
    };
    const plan = planMutationsFromIntent(manifest, activeScreenId, detCommand);

    return {
      success: true,
      command: detCommand,
      mutations: plan.mutations,
      explanation: `[Deterministic Fallback] ${plan.explanation}`,
      usedFallback: true,
    };
  }
}
