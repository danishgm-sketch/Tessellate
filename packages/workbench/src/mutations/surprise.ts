import type {
  ProjectManifest,
  ProjectMutation,
  HistoryOperation,
} from '@tessellate/schemas';
import {applyNavigationLayout} from '../utils/navigation-layout.js';
import { flattenTree, findNodeById } from '../utils/tree-helpers.js';
import { isNodeLocked } from '../locks/lock-engine.js';
import { createHistoryOperation } from '../history/history-manager.js';
import { recomposeScreenAroundLocks } from './recomposition.js';
import { getSupportedResourceVariants, nodeRuntimeVariant } from '@tessellate/renderer/resource-variants';

export interface SurpriseMeOptions {
  screenId?:string;
  divergenceLevel?: number; // 0 - 100, default 40
  /** @deprecated Do not use `divergence`. Use `divergenceLevel`. */
  divergence?: never;
  seed?: string;
}

export interface SurpriseMeResult {
  operation: HistoryOperation;
  explanation: string;
  lockedNodesPreserved: number;
}

interface VisibleVariantCandidate {
  nodeId: string;
  slug: string;
  effectiveDNA: ProjectManifest['designDNA'];
}

function findVisibleVariantCandidate(
  root: ProjectManifest['screens'][number]['rootNode'],
  designDNA: ProjectManifest['designDNA'],
): VisibleVariantCandidate | undefined {
  const visit = (
    node: ProjectManifest['screens'][number]['rootNode'],
    inheritedDNA: ProjectManifest['designDNA'],
    insideLockedSubtree: boolean,
  ): VisibleVariantCandidate | undefined => {
    const effectiveDNA = { ...inheritedDNA, ...node.dnaOverrides };
    const locked = insideLockedSubtree || isNodeLocked(node);
    if (!locked && node.resourceRef && node.semanticRole !== 'navigation') {
      const variants = getSupportedResourceVariants(node.resourceRef.slug, node.resourceRef.id);
      const currentVariant = nodeRuntimeVariant(node, effectiveDNA) ?? 'quiet';
      if (variants?.some((variant) => variant !== currentVariant)) {
        return { nodeId: node.id, slug: node.resourceRef.slug, effectiveDNA };
      }
    }
    if (locked) return undefined;
    for (const child of node.children) {
      const candidate = visit(child, effectiveDNA, false);
      if (candidate) return candidate;
    }
    return undefined;
  };

  return visit(root, designDNA, false);
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
  const targetScreen = manifest.screens.find((screen) => screen.id === options?.screenId) ?? manifest.screens[0];
  const visualVariantCandidate = targetScreen
    ? findVisibleVariantCandidate(targetScreen.rootNode, currentDNA)
    : undefined;

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
    const isFinancialProduct = manifest.productModel.productArchetypes[0]?.tag === 'fintech';
    const typoOptions = [
      ...(isFinancialProduct ? ['financial-sans-tabular-mono'] : []),
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

  let nextNavigation:string|undefined;
  // 3. Navigation Model Modification (if divergence >= 60)
  if (divergence >= 60) {
    const navCandidates = ['sidebar', 'top-nav', 'command-palette', 'rail'] as const;
    const availableNavs = navCandidates.filter((n) => n !== manifest.navigation.model);
    const nextNav = rng.pick(availableNavs);
    nextNavigation=nextNav;
    mutations.push({id:`mut-surprise-dna-nav-${Date.now()}`,type:'SET_DESIGN_TOKEN',targetId:'project',payload:{key:'navigationModel',value:nextNav},actor:'deterministic-engine',timestamp:new Date().toISOString(),preconditionRevision:manifest.historyMeta.headRevision});

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
  let recomposeReplacement: Extract<ProjectMutation, { type: 'REPLACE_NODE' }> | undefined;
  if (targetScreen) {
    const recomposeResult = recomposeScreenAroundLocks(manifest, targetScreen.id, {
      divergenceLevel: divergence,
      seed: `${seed}-screen-recompose`,
    });

    // Append the recomposition mutation
    for (const mut of recomposeResult.operation.mutations) {
      if (!isNodeLocked(targetScreen.rootNode)) {
        mutations.push(mut);
        if (mut.type === 'REPLACE_NODE' && mut.targetId === targetScreen.rootNode.id) {
          recomposeReplacement = mut;
        }
      }
    }

    appliedExplanations.push(
      `Recomposed layout and hierarchy of screen "${targetScreen.name}" (divergence: ${divergence}%)`
    );
  }

  if(nextNavigation)for(const screen of manifest.screens){
    if(isNodeLocked(screen.rootNode))continue;
    const existing=mutations.find((mutation):mutation is Extract<ProjectMutation,{type:'REPLACE_NODE'}>=>mutation.type==='REPLACE_NODE' && mutation.targetId===screen.rootNode.id);
    const root=existing?.payload.replacementNode as typeof screen.rootNode | undefined;
    const replacement=applyNavigationLayout(root ?? screen.rootNode,nextNavigation);
    if(existing)existing.payload.replacementNode=replacement;
    else if(replacement!==screen.rootNode)mutations.push({id:`mut-surprise-layout-${screen.id}`,type:'REPLACE_NODE',targetId:screen.rootNode.id,payload:{targetNodeId:screen.rootNode.id,replacementNode:replacement},actor:'deterministic-engine',timestamp:new Date().toISOString(),preconditionRevision:manifest.historyMeta.headRevision});
  }

  if (targetScreen && visualVariantCandidate) {
    const replacement = mutations.find(
      (mutation): mutation is Extract<ProjectMutation, { type: 'REPLACE_NODE' }> =>
        mutation.type === 'REPLACE_NODE' && mutation.targetId === targetScreen.rootNode.id,
    ) ?? recomposeReplacement;
    const resultingRoot = replacement?.payload.replacementNode ?? targetScreen.rootNode;
    const resultingNode = findNodeById(resultingRoot, visualVariantCandidate.nodeId);
    const variants = resultingNode?.resourceRef
      ? getSupportedResourceVariants(resultingNode.resourceRef.slug, resultingNode.resourceRef.id)
      : undefined;
    const currentRenderedVariant = resultingNode
      ? nodeRuntimeVariant(resultingNode, visualVariantCandidate.effectiveDNA) ?? 'quiet'
      : 'quiet';
    const nextVariant = variants?.filter((variant) => variant !== currentRenderedVariant);
    if (resultingNode?.resourceRef && nextVariant?.length) {
      const variant = rng.pick(nextVariant);
      mutations.push({
        id: `mut-surprise-variant-${Date.now()}`,
        type: 'CHANGE_VARIANT',
        targetId: resultingNode.id,
        payload: { targetNodeId: resultingNode.id, variant },
        actor: 'deterministic-engine',
        timestamp: new Date().toISOString(),
        preconditionRevision: manifest.historyMeta.headRevision,
      });
      appliedExplanations.push(
        `Changed the visible variant for ${visualVariantCandidate.slug} from ${currentRenderedVariant} to ${variant}`,
      );
    }
  } else if (targetScreen) {
    appliedExplanations.push('No unlocked runtime component on the active screen supports a visual variant change');
  }
  const explanation = `Surprise Me (divergence: ${divergence}%): ${appliedExplanations.join(
    '; '
  )}. Preserved ${totalLockedNodes} locked node(s).`;

  const operation = createHistoryOperation(
    explanation,
    mutations,
    'deterministic-engine'
  );

  return {
    operation,
    explanation,
    lockedNodesPreserved: totalLockedNodes,
  };
}
