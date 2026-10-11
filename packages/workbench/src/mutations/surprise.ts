import type {
  ProjectManifest,
  ProjectMutation,
  HistoryOperation,
} from '@tessellate/schemas';
import { flattenTree } from '../utils/tree-helpers.js';
import { isNodeLocked } from '../locks/lock-engine.js';
import { createHistoryOperation } from '../history/history-manager.js';
import { recomposeScreenAroundLocks } from './recomposition.js';

export interface SurpriseMeOptions {
  divergenceLevel?: number; // 0 - 100, default 40
  seed?: string;
}

export interface SurpriseMeResult {
  operation: HistoryOperation;
  explanation: string;
  lockedNodesPreserved: number;
}

class SimpleDeterministicRNG {
  private s: number;
  constructor(seedStr: string) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      h ^= seedStr.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    this.s = h >>> 0;
  }
  next(): number {
    this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
    return this.s / 4294967296;
  }
  pick<T>(arr: readonly T[] | T[]): T {
    return arr[Math.floor(this.next() * arr.length)]!;
  }
}

/**
 * Executes a "Surprise Me" controlled divergence operation.
 * Explores novel design DNA dimensions, composition grammar, navigation topology,
 * motion, typography, surface personalities, and layout hierarchy without altering
 * locked nodes, required product jobs, or hard accessibility/performance constraints.
 * Deterministic repeatability is guaranteed by project seed + divergence level.
 */
export function surpriseMe(
  manifest: ProjectManifest,
  options?: SurpriseMeOptions
): SurpriseMeResult {
  const divergence = options?.divergenceLevel ?? 40;
  const seed = options?.seed ?? manifest.seed ?? 'surprise-default-seed';
  const rng = new SimpleDeterministicRNG(`${seed}-div-${divergence}`);

  const currentDNA = manifest.designDNA;
  const appliedExplanations: string[] = [];
  const mutations: ProjectMutation[] = [];

  // 1. Count preserved locked nodes across all screens
  let totalLockedNodes = 0;
  for (const screen of manifest.screens) {
    const nodes = flattenTree(screen.rootNode);
    totalLockedNodes += nodes.filter((n) => isNodeLocked(n)).length;
  }

  // 2. Controlled DNA Adjustments
  const ambitionDelta = Math.min(30, Math.round(divergence * 0.35));
  const newVisualAmbition = Math.min(95, Math.max(10, currentDNA.visualAmbition + ambitionDelta));
  const newStructuralCreativity = Math.min(
    95,
    Math.max(10, currentDNA.structuralCreativity + Math.round(divergence * 0.3))
  );

  appliedExplanations.push(
    `Adjusted Design DNA (visual ambition: ${newVisualAmbition}, structural creativity: ${newStructuralCreativity})`
  );

  const updatedDnaDimensions: Record<string, number> = {
    visualAmbition: newVisualAmbition,
    structuralCreativity: newStructuralCreativity,
  };

  // Surface personality
  if (divergence >= 20) {
    const surfaceOptions = ['flat', 'elevated', 'glass', 'subtle-contrast', 'editorial-bordered'] as const;
    const available = surfaceOptions.filter((s) => s !== currentDNA.surfacePersonality);
    const nextSurface = rng.pick(available);
    mutations.push({
      id: `mut-surprise-surface-${Date.now()}`,
      type: 'SET_DESIGN_TOKEN',
      targetId: 'project',
      payload: {
        key: 'surfacePersonality',
        value: nextSurface,
      },
      actor: 'deterministic-engine',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    });
    appliedExplanations.push(`Shifted surface personality to "${nextSurface}"`);
  }

  // Motion personality
  if (divergence >= 35) {
    const motionOptions = [
      'calm-precision',
      'playful-spring',
      'luxury-glide',
      'technical-mechanical',
    ] as const;
    const available = motionOptions.filter((m) => m !== currentDNA.motionPersonality);
    let nextMotion = rng.pick(available);

    // Respect lightweight constraint
    if (manifest.constraints.performanceCeiling === 'lightweight' && nextMotion === 'playful-spring') {
      nextMotion = 'calm-precision';
    }
    mutations.push({
      id: `mut-surprise-motion-${Date.now()}`,
      type: 'SET_DESIGN_TOKEN',
      targetId: 'project',
      payload: {
        key: 'motionPersonality',
        value: nextMotion,
      },
      actor: 'deterministic-engine',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    });
    appliedExplanations.push(`Shifted motion personality to "${nextMotion}"`);
  }

  // Typography personality
  if (divergence >= 45) {
    const typoOptions = [
      'financial-sans-tabular-mono',
      'technical-mono-geist',
      'editorial-serif-display',
      'modern-geometric',
    ] as const;
    const available = typoOptions.filter((t) => t !== currentDNA.typographyPersonality);
    const nextTypo = rng.pick(available);
    mutations.push({
      id: `mut-surprise-typo-${Date.now()}`,
      type: 'SET_DESIGN_TOKEN',
      targetId: 'project',
      payload: {
        key: 'typographyPersonality',
        value: nextTypo,
      },
      actor: 'deterministic-engine',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    });
    appliedExplanations.push(`Shifted typography personality to "${nextTypo}"`);
  }

  // Preserve accessibility floor
  if (manifest.constraints.accessibilityFloor === 'AAA') {
    updatedDnaDimensions.contrast = Math.max(currentDNA.contrast, 85);
    updatedDnaDimensions.accessibilityPriority = Math.max(currentDNA.accessibilityPriority, 90);
  }

  // Preserve performance ceiling
  if (manifest.constraints.performanceCeiling === 'lightweight') {
    updatedDnaDimensions.motion = Math.min(currentDNA.motion, 25);
    updatedDnaDimensions.videoIntensity = 0;
    updatedDnaDimensions.threeDIntensity = 0;
  }

  mutations.push({
    id: `mut-surprise-dna-${Date.now()}`,
    type: 'SET_INTENT',
    targetId: 'project',
    payload: {
      dimensions: updatedDnaDimensions,
    },
    actor: 'deterministic-engine',
    timestamp: new Date().toISOString(),
    preconditionRevision: manifest.historyMeta.headRevision,
  });

  // 3. Navigation Model Modification (if divergence >= 60)
  if (divergence >= 60) {
    const navCandidates = ['sidebar', 'top-nav', 'command-palette', 'rail'] as const;
    const availableNavs = navCandidates.filter((n) => n !== manifest.navigation.model);
    const nextNav = rng.pick(availableNavs);

    mutations.push({
      id: `mut-surprise-nav-${Date.now()}`,
      type: 'SET_NAVIGATION',
      targetId: 'project',
      payload: {
        navigation: {
          model: nextNav,
          primaryItems: manifest.navigation.primaryItems,
        },
      },
      actor: 'deterministic-engine',
      timestamp: new Date().toISOString(),
      preconditionRevision: manifest.historyMeta.headRevision,
    });

    appliedExplanations.push(`Switched navigation model to "${nextNav}"`);
  }

  // 4. Hierarchy and Layout Transformation
  if (manifest.screens.length > 0) {
    const targetScreen = manifest.screens[0]!;
    const recomposeResult = recomposeScreenAroundLocks(manifest, targetScreen.id, {
      divergenceLevel: divergence,
      seed: `${seed}-screen-recompose`,
    });

    // Append the recomposition mutation
    for (const mut of recomposeResult.operation.mutations) {
      mutations.push(mut);
    }

    appliedExplanations.push(
      `Recomposed layout and hierarchy of screen "${targetScreen.name}" (divergence: ${divergence}%)`
    );
  }

  const explanation = `Surprise Me (divergence: ${divergence}%): ${appliedExplanations.join(
    '; '
  )}. Preserved ${totalLockedNodes} locked node(s).`;

  const operation = createHistoryOperation(
    `Surprise Me: Diverged by ${divergence}%`,
    mutations,
    'deterministic-engine'
  );

  return {
    operation,
    explanation,
    lockedNodesPreserved: totalLockedNodes,
  };
}
