import type {
  ProjectManifest,
  ProjectMutation,
  HistoryOperation,
} from '@tessellate/schemas';
import { flattenTree } from '../utils/tree-helpers.js';
import { isNodeLocked } from '../locks/lock-engine.js';
import { createHistoryOperation } from '../history/history-manager.js';

export interface SurpriseMeOptions {
  divergenceLevel?: number; // 0 - 100, default 40
  seed?: string;
}

export interface SurpriseMeResult {
  operation: HistoryOperation;
  explanation: string;
  lockedNodesPreserved: number;
}

/**
 * Executes a "Surprise Me" controlled divergence operation.
 * Explores novel design DNA dimensions and layout treatments without altering
 * locked nodes, required product jobs, or hard accessibility/performance constraints.
 */
export function surpriseMe(
  manifest: ProjectManifest,
  options?: SurpriseMeOptions
): SurpriseMeResult {
  const divergence = options?.divergenceLevel ?? 40;
  const currentDNA = manifest.designDNA;

  // 1. Calculate controlled DNA adjustments
  // Controlled divergence subtly increases visual ambition, shifts geometry and typography
  const ambitionDelta = Math.min(25, Math.round(divergence * 0.3));
  const newVisualAmbition = Math.min(95, Math.max(10, currentDNA.visualAmbition + ambitionDelta));
  const newStructuralCreativity = Math.min(90, Math.max(10, currentDNA.structuralCreativity + Math.round(divergence * 0.25)));

  // Cycle personality stopping short of jarring chaos
  const surfacePersonalities = ['flat', 'elevated', 'glass', 'editorial-bordered'];
  const nextSurfacePersonality =
    surfacePersonalities[(surfacePersonalities.indexOf(currentDNA.surfacePersonality) + 1) % surfacePersonalities.length] ?? 'elevated';

  const explanations: string[] = [
    `Increased visual ambition to ${newVisualAmbition} (+${ambitionDelta})`,
    `Shifted surface personality to "${nextSurfacePersonality}"`,
  ];

  // 2. Count preserved locked nodes across all screens
  let totalLockedNodes = 0;
  for (const screen of manifest.screens) {
    const nodes = flattenTree(screen.rootNode);
    totalLockedNodes += nodes.filter((n) => isNodeLocked(n)).length;
  }

  // 3. Construct SET_INTENT mutation
  const mutation: ProjectMutation = {
    id: `mut-surprise-${Date.now()}`,
    type: 'SET_INTENT',
    targetId: 'project',
    payload: {
      dimensions: {
        visualAmbition: newVisualAmbition,
        structuralCreativity: newStructuralCreativity,
      },
    },
    actor: 'deterministic-engine',
    timestamp: new Date().toISOString(),
    preconditionRevision: manifest.historyMeta.headRevision,
  };

  const explanation = `Surprise Me (divergence: ${divergence}%): ${explanations.join(', ')}. Preserved ${totalLockedNodes} locked node(s).`;

  const operation = createHistoryOperation(
    `Surprise Me: Diverged by ${divergence}%`,
    [mutation],
    'deterministic-engine'
  );

  return {
    operation,
    explanation,
    lockedNodesPreserved: totalLockedNodes,
  };
}
