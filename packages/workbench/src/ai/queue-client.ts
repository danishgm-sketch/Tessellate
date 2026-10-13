import { IntentCommandSchema, type ProjectManifest, type ProjectMutation, type IntentCommand } from '@tessellate/schemas';
import { planMutationsFromIntent } from './mutation-planner.js';
import { tryDeterministicCommandMatch } from './ai-service.js';

export interface QueueProgressCallback {
  (status: { status: 'checking' | 'queued' | 'processing' | 'completed' | 'fallback' | 'unavailable'; tokenNumber?: number; position?: number; estimatedWaitSeconds?: number; message?: string }): void;
}
export interface QueueExecutionResult {
  success: boolean; command?: IntentCommand; mutations: ProjectMutation[]; explanation: string;
  tokenNumber?: number; usedFallback: boolean; error?: string;
}
export interface HostHealth { apiOnline: boolean; hostOnline: boolean; pendingTasks: number }
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8787' : '';
const unavailable = (message: string): QueueExecutionResult => ({ success: false, mutations: [], explanation: message, usedFallback: false, error: message });

export async function checkHostHealth(): Promise<HostHealth> {
  try {
    const response = await fetch(`${API_BASE}/api/inference/health`, { signal: AbortSignal.timeout(4000), cache: 'no-store' });
    if (response.ok) {
      const data = await response.json() as Partial<HostHealth>;
      return { apiOnline: data.apiOnline === true, hostOnline: data.hostOnline === true, pendingTasks: typeof data.pendingTasks === 'number' ? data.pendingTasks : 0 };
    }
  } catch { /* A sleeping laptop or stopped Docker is an explicit offline state. */ }
  return { apiOnline: false, hostOnline: false, pendingTasks: 0 };
}

export async function executeQueuedCommand(manifest: ProjectManifest, activeScreenId: string, userPrompt: string, onProgress?: QueueProgressCallback): Promise<QueueExecutionResult> {
  const prompt = userPrompt.trim();
  if (!prompt) return unavailable('Prompt cannot be empty.');
  const screen = manifest.screens.find(item => item.id === activeScreenId);
  if (!screen) return unavailable('Select a screen before issuing a command.');
  onProgress?.({ status: 'checking', message: 'Checking laptop availability…' });
  const health = await checkHostHealth();
  const local = tryDeterministicCommandMatch(manifest, activeScreenId, prompt);
  if (local) {
      const plan = planMutationsFromIntent(manifest, activeScreenId, local);
      onProgress?.({ status: 'fallback', message: 'Local deterministic command' });
      return { success: true, command: local, mutations: plan.mutations, explanation: `[Deterministic Engine] ${plan.explanation}`, usedFallback: true };
  }
  if (!health.hostOnline) {
    const message = 'Laptop inference is unavailable. Start Docker and the Tessellate host containers, or use the local inspector and deterministic commands.';
    onProgress?.({ status: 'unavailable', message });
    return unavailable(message);
  }
  try {
    const submitted = await fetch(`${API_BASE}/api/inference/queue`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, screenAst: screen.rootNode, designDna: manifest.designDNA }),
      signal: AbortSignal.timeout(5000),
    });
    if (!submitted.ok) throw new Error('Laptop queue is unavailable or busy. Your project has not been changed.');
    const ticket = await submitted.json() as { ticketId: string; accessToken: string; tokenNumber: number; position: number; estimatedWaitSeconds: number };
    if (typeof ticket.ticketId !== 'string' || typeof ticket.accessToken !== 'string') throw new Error('Laptop returned an invalid ticket. Your project has not been changed.');
    onProgress?.({ status: 'queued', tokenNumber: ticket.tokenNumber, position: ticket.position, estimatedWaitSeconds: ticket.estimatedWaitSeconds, message: `Token #${ticket.tokenNumber} · queued on this laptop` });
    const started = Date.now();
    while (Date.now() - started < 45000) {
      await new Promise(resolve => setTimeout(resolve, 750));
      const status = await fetch(`${API_BASE}/api/inference/status/${encodeURIComponent(ticket.ticketId)}`, { headers: { Authorization: `Bearer ${ticket.accessToken}` }, signal: AbortSignal.timeout(5000), cache: 'no-store' });
      if (!status.ok) throw new Error('Laptop connection was lost. Your project has not been changed; the request may be retried when the host is available.');
      const data = await status.json() as { status: string; resultCommand?: unknown; errorMessage?: string; position?: number };
      if (data.status === 'failed') throw new Error(data.errorMessage ?? 'Laptop inference failed. Your project has not been changed.');
      if (data.status === 'completed') {
        const command = IntentCommandSchema.parse(data.resultCommand);
        const plan = planMutationsFromIntent(manifest, activeScreenId, { ...command, preserveLockedNodes: true });
        onProgress?.({ status: 'completed', tokenNumber: ticket.tokenNumber, message: `Token #${ticket.tokenNumber} · completed by the laptop model` });
        return { success: true, command, mutations: plan.mutations, explanation: `[Laptop Model] ${plan.explanation}`, tokenNumber: ticket.tokenNumber, usedFallback: false };
      }
      onProgress?.({ status: data.status === 'processing' ? 'processing' : 'queued', tokenNumber: ticket.tokenNumber, position: data.position, message: `Token #${ticket.tokenNumber} · ${data.status} on laptop` });
    }
    throw new Error('Laptop inference timed out. Your project has not been changed.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Laptop inference is unavailable. Your project has not been changed.';
    onProgress?.({ status: 'unavailable', message });
    return unavailable(message);
  }
}
