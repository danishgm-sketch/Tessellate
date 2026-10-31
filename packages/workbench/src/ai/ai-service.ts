import {
  type ProjectManifest,
  type ProjectMutation,
  isNonActionableIntentPrompt,
} from '@tessellate/schemas';
import { credentialStore } from './credential-store.js';
import { getProviderAdapter } from './adapters/index.js';
import { type AIProviderConfig } from './adapters/types.js';
import { generateWithConstrainedRepair } from './repair.js';
import { type IntentCommand, IntentCommandSchema } from './intent-command.js';
import { planMutationsFromIntent } from './mutation-planner.js';

export interface AICommandExecutionSuccess {
  success: true;
  command: IntentCommand;
  mutations: ProjectMutation[];
  explanation: string;
  warnings: string[];
  repaired?: boolean;
}

export interface AICommandExecutionFailure {
  success: false;
  preservedPrompt: string;
  error: string;
  providerId?: string;
  deterministicAlternativeAvailable?: boolean;
}

export type AICommandResult = AICommandExecutionSuccess | AICommandExecutionFailure;

/**
 * High-level AI assistant service for Tessellate Workbench.
 * HARD SAFETY CONTRACT:
 * - If provider fails or output is invalid, NO project mutations are applied.
 * - Manifest remains 100% unaltered (failure leaves state completely intact).
 * - Preserves the user prompt for review or retry.
 */
export async function executeNaturalLanguageCommand(
  manifest: ProjectManifest,
  activeScreenId: string,
  userPrompt: string,
  options: {
    providerConfig?: AIProviderConfig;
    fetchFn?: typeof fetch;
  } = {}
): Promise<AICommandResult> {
  const trimmedPrompt = userPrompt.trim();
  if (!trimmedPrompt) {
    return {
      success: false,
      preservedPrompt: userPrompt,
      error: 'Command prompt cannot be empty.',
    };
  }

  // 1. Resolve active provider configuration
  const config = options.providerConfig || credentialStore.getActiveCredential();

  // If no AI provider configured, check if command maps to deterministic keywords
  if (!config || !config.apiKey.trim()) {
    const deterministicCommand = tryDeterministicCommandMatch(manifest, activeScreenId, trimmedPrompt);
    if (deterministicCommand) {
      const plan = planMutationsFromIntent(manifest, activeScreenId, deterministicCommand);
      return {
        success: true,
        command: deterministicCommand,
        mutations: plan.mutations,
        explanation: plan.explanation,
        warnings: plan.warnings,
      };
    }

    return {
      success: false,
      preservedPrompt: userPrompt,
      error: 'No AI provider configured. Connect a BYO API key in Settings, or use deterministic command keywords (recompose, surprise me, reduce motion, lock, unlock).',
      deterministicAlternativeAvailable: true,
    };
  }

  // 2. Build structured request for IntentCommand
  try {
    const adapter = getProviderAdapter(config.id);

    const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
    const screenSummary = activeScreen
      ? `Active Screen: "${activeScreen.name}" (id: "${activeScreen.id}")`
      : 'No active screen';

    const systemPrompt = [
      'You are Tessellate Interface Assistant.',
      'Convert natural-language design intentions into a strictly structured IntentCommand JSON.',
      'Allowed actions: "recompose-screen", "rethink-screen", "adjust-dna", "apply-feel", "lock-nodes", "unlock-nodes", "replace-component", "surprise-me".',
      'Preserve locked nodes unless explicitly asked otherwise.',
    ].join('\n\n');

    const prompt = [
      `User Instruction: "${trimmedPrompt}"`,
      screenSummary,
      `Project Archetype: ${manifest.productModel.productArchetypes[0]?.tag ?? 'system'}`,
    ].join('\n');

    const repairableResult = await generateWithConstrainedRepair(
      adapter,
      config,
      {
        schemaName: 'IntentCommand',
        schemaDescription: 'Structured UI intent directive for deterministic planner',
        schema: IntentCommandSchema,
        systemPrompt,
        prompt,
        temperature: 0.1,
      },
      options.fetchFn
    );

    const intentCommand = repairableResult.data;

    // 3. Plan deterministic mutations from IntentCommand
    const plan = planMutationsFromIntent(manifest, activeScreenId, intentCommand);

    return {
      success: true,
      command: intentCommand,
      mutations: plan.mutations,
      explanation: plan.explanation,
      warnings: plan.warnings,
      repaired: repairableResult.repaired,
    };
  } catch (err) {
    const sanitizedError = credentialStore.sanitizeError(err);
    // FAILURE GUARANTEE: Returns failure object without applying any mutations.
    // The project manifest is 100% untouched.
    return {
      success: false,
      preservedPrompt: userPrompt,
      error: sanitizedError.message,
      providerId: config.id,
      deterministicAlternativeAvailable: true,
    };
  }
}

/**
 * Deterministic command parser for zero-AI environments.
 */
export function tryDeterministicCommandMatch(
  _manifest: ProjectManifest,
  activeScreenId: string,
  prompt: string
): IntentCommand | null {
  const lower = prompt.toLowerCase().trim();

  // This small parser cannot safely determine intent scope for questions,
  // negations, or prompts that explicitly preserve the current design.
  if (isNonActionableIntentPrompt(lower)) return null;

  if (lower.includes('recompose') || lower.includes('rethink structure') || lower.includes('rethink')) {
    return {
      action: 'recompose-screen',
      summary: 'Recompose screen around locked nodes',
      targetScreenId: activeScreenId,
      preserveLockedNodes: true,
      explanation: 'Recomposing unlocked nodes while freezing locked elements.',
    };
  }

  if (lower.includes('surprise') || lower.includes('surprise me')) {
    return {
      action: 'surprise-me',
      summary: 'Controlled creative divergence',
      targetScreenId: activeScreenId,
      preserveLockedNodes: true,
      explanation: 'Applying controlled aesthetic variation.',
    };
  }

  if (lower.includes('reduce motion') || lower.includes('less motion')) {
    return {
      action: 'adjust-dna',
      summary: 'Reduce motion for accessibility',
      preserveLockedNodes: true,
      dnaDeltas: { motion: -40, motionPlayfulness: -40 },
      explanation: 'Lowered motion intensity to prioritize calm accessibility.',
    };
  }

  if (lower.includes('sharp') || lower.includes('zero radius')) {
    return {
      action: 'adjust-dna',
      summary: 'Set geometry curvature to sharp (0px)',
      preserveLockedNodes: true,
      dnaDeltas: { curvature: -80 },
      categoricalDna: { geometryFamily: 'sharp' },
      explanation: 'Set sharp rectangular geometry.',
    };
  }

  if (lower.includes('pill') || lower.includes('round')) {
    return {
      action: 'adjust-dna',
      summary: 'Set geometry curvature to pill (9999px)',
      preserveLockedNodes: true,
      dnaDeltas: { curvature: 80 },
      categoricalDna: { geometryFamily: 'pill' },
      explanation: 'Set pill-shaped rounded geometry.',
    };
  }

  if (lower.includes('playful') || lower.includes('warm')) {
    return {
      action: 'apply-feel',
      summary: 'Apply playful and warm feel',
      preserveLockedNodes: true,
      feelDescriptors: 'playful and warm',
      explanation: 'Elevating playfulness and warm tonal geometry.',
    };
  }

  if (lower.includes('professional') || lower.includes('institutional')) {
    return {
      action: 'apply-feel',
      summary: 'Apply professional institutional feel',
      preserveLockedNodes: true,
      feelDescriptors: 'professional and institutional',
      explanation: 'Elevating professionalism and high trust precision.',
    };
  }

  return null;
}
