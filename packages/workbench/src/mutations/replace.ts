import type {
  ProjectManifest,
  ProjectNode,
  ResourceManifest,
  HistoryOperation,
  ProjectMutation,
} from '@tessellate/schemas';
import {
  bindResourceContent,
  calculateCompatibilityScore,
  evaluateHardConstraints,
  resourceMatchesRole,
  runtimeVariant,
  isResourceComposerEligible,
} from '@tessellate/compatibility';
import {isScopeLocked} from '../utils/dna-helpers.js';
import { findNodeById } from '../utils/tree-helpers.js';
import { createHistoryOperation } from '../history/history-manager.js';
import { getAvailableResources } from './runtime-catalog.js';

export { getAvailableResources, setActiveCatalog } from './runtime-catalog.js';

export interface ReplaceCandidate {
  resource: ResourceManifest;
  compatibilityScore: number;
  rationale: string;
  performanceDelta: number;
  ambitionDelta: number;
  defaultVariant?: string;
}

export interface AlternativeCandidate {
  resource: ResourceManifest;
  relationType: string;
  compatibilityScore: number;
  variant?: string;
}

/**
 * Finds compatible replacement resources for a selected node from the catalog.
 */
export function getReplaceCandidates(
  manifest: ProjectManifest,
  nodeId: string,
  catalog?: ResourceManifest[]
): ReplaceCandidate[] {
  const activeCatalog = catalog && catalog.length > 0 ? catalog : getAvailableResources();
  let targetNode: ProjectNode | null = null;
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      targetNode = found;
      break;
    }
  }

  if (!targetNode) return [];
  const screenId=manifest.screens.find(screen=>findNodeById(screen.rootNode,nodeId))?.id ?? '';
  if(isScopeLocked(manifest,screenId,nodeId,'structure')) return [];

  const currentResource = activeCatalog.find((r: ResourceManifest) => r.id === targetNode?.resourceRef?.id);
  const currentAmbition = currentResource?.visualDNA?.visualAmbition ?? manifest.designDNA.visualAmbition;
  const currentPerfScore = currentResource?.quality?.performance ?? 80;

  const candidates: ReplaceCandidate[] = [];

  for (const res of activeCatalog) {
    // Skip if it's the current exact resource
    if (!isResourceComposerEligible(res) || res.id === targetNode.resourceRef?.id || res.slug===targetNode.resourceRef?.slug) continue;

    // 1. Evaluate hard constraints
    const hardCheck = evaluateHardConstraints({
      resource: res,
      constraints: manifest.constraints,
      requiredAccessibilityFloor: manifest.constraints?.accessibilityFloor,
      performanceCeiling: manifest.constraints?.performanceCeiling,
    });
    if (!hardCheck.pass) {
      continue;
    }

    // 2. Check role and structural type match
    const roleMatch = resourceMatchesRole(res, targetNode.semanticRole);

    if (!roleMatch) continue;

    // 3. Calculate compatibility score
    const scoreResult = calculateCompatibilityScore({
      candidate: res,
      targetDna: manifest.designDNA,
      semanticRole: targetNode.semanticRole,
      currentArchetype: manifest.productModel.productArchetypes[0]?.tag,
      accessibilityFloor: manifest.constraints?.accessibilityFloor,
    });

    const resAmbition = res.visualDNA?.visualAmbition ?? 50;
    const resPerf = res.quality?.performance ?? 80;

    candidates.push({
      resource: res,
      compatibilityScore: scoreResult.totalScore,
      rationale: scoreResult.rationale[0] ?? `Matches role "${targetNode.semanticRole}"`,
      performanceDelta: resPerf - currentPerfScore,
      ambitionDelta: resAmbition - currentAmbition,
      defaultVariant: runtimeVariant(res),
    });
  }

  return candidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

/**
 * Retrieves explicit alternative resources and variants for a selected node.
 */
export function getAlternativeCandidates(
  manifest: ProjectManifest,
  nodeId: string,
  catalog?: ResourceManifest[]
): AlternativeCandidate[] {
  const activeCatalog = catalog && catalog.length > 0 ? catalog : getAvailableResources();
  let targetNode: ProjectNode | null = null;
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      targetNode = found;
      break;
    }
  }

  if (!targetNode) return [];
  const screenId=manifest.screens.find(screen=>findNodeById(screen.rootNode,nodeId))?.id ?? '';
  if(isScopeLocked(manifest,screenId,nodeId,'structure')) return [];

  const currentResource = activeCatalog.find((r: ResourceManifest) => r.id === targetNode?.resourceRef?.id);
  const results: AlternativeCandidate[] = [];

  if (currentResource) {
    // 1. Other variants of the current resource
    for (const v of currentResource.variants) {
      const variant = runtimeVariant(currentResource, v.id || v.name);
      if (variant !== targetNode.variant) {
        results.push({
          resource: currentResource,
          relationType: 'VARIANT',
          compatibilityScore: 95,
          variant,
        });
      }
    }

    // 2. Direct relationships declared in resource manifest
    for (const rel of currentResource.relationships) {
      const related = activeCatalog.find((r: ResourceManifest) => r.id === rel.target || r.slug === rel.target);
      if (related && isResourceComposerEligible(related) && getReplaceCandidates(manifest,nodeId,activeCatalog).some(candidate=>candidate.resource.id===related.id)) {
        results.push({
          resource: related,
          relationType: rel.type,
          compatibilityScore: 85,
          variant: runtimeVariant(related),
        });
      }
    }
  }

  // 3. Fallback to top replace candidates if no direct relationships declared
  if (results.length === 0) {
    const topReplacements = getReplaceCandidates(manifest, nodeId, activeCatalog).slice(0, 3);
    for (const rep of topReplacements) {
      results.push({
        resource: rep.resource,
        relationType: 'COMPATIBLE_ALTERNATIVE',
        compatibilityScore: rep.compatibilityScore,
        variant: rep.defaultVariant,
      });
    }
  }

  return results;
}

/**
 * Constructs a HistoryOperation to replace a target node with a new resource.
 */
export function createReplaceOperation(
  manifest: ProjectManifest,
  nodeId: string,
  replacementResource: ResourceManifest,
  variant?: string
): HistoryOperation {
  let originalNode: ProjectNode | null = null;
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      originalNode = found;
      break;
    }
  }

  if(!originalNode) throw new Error(`Node ${nodeId} does not exist.`);
  const hardCheck=evaluateHardConstraints({resource:replacementResource,constraints:manifest.constraints,requiredAccessibilityFloor:manifest.constraints.accessibilityFloor,performanceCeiling:manifest.constraints.performanceCeiling,targetDevices:manifest.constraints.targetDevices});
  if(!isResourceComposerEligible(replacementResource) || !resourceMatchesRole(replacementResource,originalNode.semanticRole) || !hardCheck.pass) throw new Error('Replacement does not satisfy this semantic role and the project hard constraints.');

  const defaultSlots: Record<string, unknown> = {};
  for (const slot of replacementResource.slots ?? []) {
    if (slot.defaultValue !== undefined) {
      defaultSlots[slot.id] = slot.defaultValue;
    }
  }

  const ownerScreen=manifest.screens.find(screen=>findNodeById(screen.rootNode,nodeId));
  const graphNodes=manifest.screenGraph.groups.flatMap(group=>group.screens);
  const screenNode=graphNodes.find(screen=>screen.id===ownerScreen?.screenNodeId);
  const boundContent=screenNode?bindResourceContent(manifest.productModel,screenNode,originalNode.semanticRole,graphNodes,replacementResource.slug,manifest.description):{};
  const replacementNode: ProjectNode = {
    id: nodeId, // preserve ID so tree references and locks stay stable
    nodeType: originalNode?.nodeType ?? 'component',
    semanticRole: originalNode?.semanticRole ?? replacementResource.roles[0] ?? 'component',
    resourceRef: {
      id: replacementResource.id,
      slug: replacementResource.slug,
      version: replacementResource.version,
    },
    variant: runtimeVariant(replacementResource, variant),
    slots: {
      ...defaultSlots,
      ...(originalNode?.slots ?? {}),
    },
    props: {
      ...(replacementResource.preview?.defaultProps ?? {}),
      ...boundContent,
      ...Object.fromEntries(Object.entries(originalNode.props ?? {}).filter(([key])=>key in boundContent)),
    },
    children: originalNode?.children ?? [],
    locks: originalNode?.locks,
    tokenOverrides: originalNode.tokenOverrides,
    dnaOverrides: {...originalNode?.dnaOverrides,visualMode:runtimeVariant(replacementResource,variant)==='nocturne' ? 'dark' : 'light'},
  };

  const mutation: ProjectMutation = {
    id: `mut-replace-${Date.now()}`,
    type: 'REPLACE_NODE',
    targetId: nodeId,
    payload: {
      targetNodeId: nodeId,
      replacementNode,
    },
    actor: 'user',
    timestamp: new Date().toISOString(),
    preconditionRevision: manifest.historyMeta.headRevision,
  };

  return createHistoryOperation(
    `Replaced with "${replacementResource.name}"`,
    [mutation],
    'user',
    [nodeId]
  );
}
