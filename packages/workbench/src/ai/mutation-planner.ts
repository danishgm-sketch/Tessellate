import {
  type ProjectManifest,
  type ProjectMutation,
  type ProjectNode,
  ProjectMutationSchema,
} from '@tessellate/schemas';
import { parseFeelDescriptors } from '@tessellate/dna';
import { findNodeById } from '../utils/tree-helpers.js';
import { canApplyMutation, isNodeLocked } from '../locks/lock-engine.js';
import { recomposeScreenAroundLocks } from '../mutations/recomposition.js';
import { surpriseMe } from '../mutations/surprise.js';
import { type IntentCommand } from './intent-command.js';

export interface MutationPlanResult {
  mutations: ProjectMutation[];
  explanation: string;
  warnings: string[];
  affectedNodeIds: string[];
}

/**
 * Deterministically translates a validated IntentCommand into a safe sequence
 * of ProjectMutation objects, respecting node locks and manifest invariants.
 */
export function planMutationsFromIntent(
  manifest: ProjectManifest,
  activeScreenId: string,
  command: IntentCommand
): MutationPlanResult {
  const warnings: string[] = [];
  const plannedMutations: ProjectMutation[] = [];
  const affectedNodeIds = new Set<string>();

  const targetScreenId = command.targetScreenId || activeScreenId;
  const screen = manifest.screens.find((s) => s.id === targetScreenId);
  if (!screen) {
    throw new Error(`Target screen "${targetScreenId}" not found in project manifest.`);
  }

  const baseRevision = manifest.historyMeta.headRevision;
  let nextRevision = baseRevision;

  const createMutationId = (prefix: string) =>
    `mut-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. Process Lock and Unlock commands
  if (command.action === 'lock-nodes') {
    const lockDimensions = command.lockDimensions ?? ['structure'];
    for (const nodeId of command.targetNodeIds ?? []) {
      const node = findNodeById(screen.rootNode, nodeId);
      if (!node) {
        warnings.push(`Node "${nodeId}" not found for locking.`);
        continue;
      }
      plannedMutations.push({
        id: createMutationId('lock'),
        type: 'LOCK_NODE',
        targetId: node.id,
        payload: {
          targetNodeId: node.id,
          lockTypes: lockDimensions,
        },
        actor: 'ai',
        timestamp: new Date().toISOString(),
        preconditionRevision: nextRevision++,
      });
      affectedNodeIds.add(node.id);
    }
  } else if (command.action === 'unlock-nodes') {
    const lockDimensions = command.lockDimensions ?? ['structure'];
    for (const nodeId of command.targetNodeIds ?? []) {
      const node = findNodeById(screen.rootNode, nodeId);
      if (!node) {
        warnings.push(`Node "${nodeId}" not found for unlocking.`);
        continue;
      }
      plannedMutations.push({
        id: createMutationId('unlock'),
        type: 'UNLOCK_NODE',
        targetId: node.id,
        payload: {
          targetNodeId: node.id,
          lockTypes: lockDimensions,
        },
        actor: 'ai',
        timestamp: new Date().toISOString(),
        preconditionRevision: nextRevision++,
      });
      affectedNodeIds.add(node.id);
    }
  }

  // 2. Process Recomposition or Rethink Screen commands
  else if (command.action === 'recompose-screen' || command.action === 'rethink-screen') {
    // If target nodes were explicitly marked to lock before recomposing
    if (command.targetNodeIds && command.targetNodeIds.length > 0) {
      for (const targetId of command.targetNodeIds) {
        const node = findNodeById(screen.rootNode, targetId);
        if (node && !isNodeLocked(node)) {
          plannedMutations.push({
            id: createMutationId('prelock'),
            type: 'LOCK_NODE',
            targetId: node.id,
            payload: {
              targetNodeId: node.id,
              lockTypes: ['structure'],
            },
            actor: 'ai',
            timestamp: new Date().toISOString(),
            preconditionRevision: nextRevision++,
          });
          affectedNodeIds.add(node.id);
        }
      }
    }

    const recomposeRes = recomposeScreenAroundLocks(manifest, screen.id, {
      divergenceLevel: command.action === 'rethink-screen' ? 70 : 40,
    });

    for (const m of recomposeRes.operation.mutations) {
      plannedMutations.push({
        ...m,
        id: createMutationId('recompose'),
        actor: 'ai',
        preconditionRevision: nextRevision++,
      });
    }
    affectedNodeIds.add(screen.rootNode.id);
  }

  // 3. Process Replace Component
  else if (command.action === 'replace-component') {
    const targetNodeId = command.targetNodeIds?.[0];
    if (!targetNodeId) {
      throw new Error('replace-component requires at least one targetNodeId.');
    }
    const node = findNodeById(screen.rootNode, targetNodeId);
    if (!node) {
      throw new Error(`Target node "${targetNodeId}" not found.`);
    }

    if (isNodeLocked(node, 'structure') || isNodeLocked(node, 'node')) {
      throw new Error(`Cannot replace node "${targetNodeId}": Structural lock is active.`);
    }

    // Build replacement node keeping id or creating fresh
    const replacementNode: ProjectNode = {
      ...node,
      semanticRole: command.replacementResourceSlug
        ? `${command.replacementResourceSlug}`
        : `${node.semanticRole}`,
      props: {
        ...node.props,
        replacedByAI: true,
        catalogSlug: command.replacementResourceSlug ?? (node.props['catalogSlug'] as string | undefined),
      },
    };

    plannedMutations.push({
      id: createMutationId('replace'),
      type: 'REPLACE_NODE',
      targetId: node.id,
      payload: {
        targetNodeId: node.id,
        replacementNode,
      },
      actor: 'ai',
      timestamp: new Date().toISOString(),
      preconditionRevision: nextRevision++,
    });
    affectedNodeIds.add(node.id);
  }

  // 4. Process DNA and Feel adjustments
  else if (command.action === 'adjust-dna' || command.action === 'apply-feel') {
    // Target nodes vs Project scope
    if (command.targetNodeIds && command.targetNodeIds.length > 0) {
      for (const targetId of command.targetNodeIds) {
        const node = findNodeById(screen.rootNode, targetId);
        if (!node) {
          warnings.push(`Target node "${targetId}" not found.`);
          continue;
        }

        if (isNodeLocked(node, 'style') || isNodeLocked(node, 'dna')) {
          warnings.push(`Node "${targetId}" has style/DNA locks active. Skipped.`);
          continue;
        }

        if (command.dnaDeltas) {
          for (const [key, val] of Object.entries(command.dnaDeltas)) {
            plannedMutations.push({
              id: createMutationId('set-token'),
              type: 'SET_DESIGN_TOKEN',
              targetId: node.id,
              payload: {
                key,
                value: typeof val === 'number' ? val : Number(val),
              },
              actor: 'ai',
              timestamp: new Date().toISOString(),
              preconditionRevision: nextRevision++,
            });
          }
          affectedNodeIds.add(node.id);
        }
      }
    } else {
      // Project Scope DNA
      if (command.dnaDeltas && Object.keys(command.dnaDeltas).length > 0) {
        // Dimensions bounded to 0..100
        const dimensions: Record<string, number> = {};
        for (const [k, v] of Object.entries(command.dnaDeltas)) {
          const current = (manifest.designDNA as unknown as Record<string, unknown>)[k];
          const baseNum = typeof current === 'number' ? current : 50;
          const deltaNum = typeof v === 'number' ? v : Number(v);
          dimensions[k] = Math.max(0, Math.min(100, Math.round(baseNum + deltaNum)));
        }

        plannedMutations.push({
          id: createMutationId('set-intent'),
          type: 'SET_INTENT',
          targetId: manifest.id,
          payload: { dimensions },
          actor: 'ai',
          timestamp: new Date().toISOString(),
          preconditionRevision: nextRevision++,
        });
        affectedNodeIds.add(manifest.id);
      }

      // Feel descriptor text
      if (command.feelDescriptors) {
        const parsedFeel = parseFeelDescriptors(command.feelDescriptors);
        const feelDimensions: Record<string, number> = {};
        for (const [k, delta] of Object.entries(parsedFeel.accumulatedDeltas)) {
          if (typeof delta === 'number') {
            const current = (manifest.designDNA as unknown as Record<string, unknown>)[k];
            const baseNum = typeof current === 'number' ? current : 50;
            feelDimensions[k] = Math.max(0, Math.min(100, Math.round(baseNum + delta)));
          }
        }
        if (Object.keys(feelDimensions).length > 0) {
          plannedMutations.push({
            id: createMutationId('set-intent-feel'),
            type: 'SET_INTENT',
            targetId: manifest.id,
            payload: { dimensions: feelDimensions },
            actor: 'ai',
            timestamp: new Date().toISOString(),
            preconditionRevision: nextRevision++,
          });
          affectedNodeIds.add(manifest.id);
        }

        for (const [catKey, catVal] of Object.entries(parsedFeel.categoricalSuggestions)) {
          plannedMutations.push({
            id: createMutationId('token-cat'),
            type: 'SET_DESIGN_TOKEN',
            targetId: manifest.id,
            payload: {
              key: catKey,
              value: String(catVal),
            },
            actor: 'ai',
            timestamp: new Date().toISOString(),
            preconditionRevision: nextRevision++,
          });
          affectedNodeIds.add(manifest.id);
        }
      }

      // Categorical DNA values
      if (command.categoricalDna) {
        for (const [k, v] of Object.entries(command.categoricalDna)) {
          if (v) {
            plannedMutations.push({
              id: createMutationId('token-cat-explicit'),
              type: 'SET_DESIGN_TOKEN',
              targetId: manifest.id,
              payload: {
                key: k,
                value: String(v),
              },
              actor: 'ai',
              timestamp: new Date().toISOString(),
              preconditionRevision: nextRevision++,
            });
            affectedNodeIds.add(manifest.id);
          }
        }
      }
    }
  }

  // 5. Process Surprise Me
  else if (command.action === 'surprise-me') {
    const surpriseResult = surpriseMe(manifest);
    for (const m of surpriseResult.operation.mutations) {
      plannedMutations.push({
        ...m,
        id: createMutationId('surprise'),
        actor: 'ai',
        preconditionRevision: nextRevision++,
      });
      affectedNodeIds.add(m.targetId);
    }
  }

  // 6. Validate every planned mutation against ProjectMutationSchema and Locks
  const validatedMutations: ProjectMutation[] = [];
  for (const mut of plannedMutations) {
    const parseResult = ProjectMutationSchema.safeParse(mut);
    if (!parseResult.success) {
      throw new Error(
        `Planned mutation "${mut.id}" failed schema validation: ${JSON.stringify(parseResult.error.issues)}`
      );
    }

    const lockCheck = canApplyMutation(manifest, parseResult.data);
    if (!lockCheck.allowed) {
      warnings.push(`Mutation "${mut.id}" skipped due to active lock: ${lockCheck.reason}`);
      continue;
    }

    validatedMutations.push(parseResult.data);
  }

  return {
    mutations: validatedMutations,
    explanation: command.explanation || command.summary,
    warnings,
    affectedNodeIds: Array.from(affectedNodeIds),
  };
}
