import type {
  ProjectManifest,
  ProjectNode,
  ResourceManifest,
  HistoryOperation,
  ProjectMutation,
} from '@tessellate/schemas';
import {
  calculateCompatibilityScore,
  evaluateHardConstraints,
} from '@tessellate/compatibility';
import { CANONICAL_ROLES, resourceFulfilsRole } from '@tessellate/composer';
import { findNodeById } from '../utils/tree-helpers.js';
import { createHistoryOperation } from '../history/history-manager.js';

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

/** The live resource catalogue, loaded by the Workbench from /data/catalog.json (see loadLibrary). */
let _activeCatalog: ResourceManifest[] = [];

export function setActiveCatalog(catalog: ResourceManifest[]): void {
  _activeCatalog = catalog;
}

export function getAvailableResources(): ResourceManifest[] {
  return _activeCatalog;
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

  const currentResource = activeCatalog.find((r: ResourceManifest) => r.id === targetNode?.resourceRef?.id);
  const currentAmbition = currentResource?.visualDNA?.visualAmbition ?? manifest.designDNA.visualAmbition;
  const currentPerfScore = currentResource?.quality?.performance ?? 80;

  const candidates: ReplaceCandidate[] = [];

  for (const res of activeCatalog) {
    // Skip if it's the current exact resource
    if (res.id === targetNode.resourceRef?.id) continue;

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

    // 2. Role match: canonical roles (Phase 29) accept only the resources the taxonomy lists; older
    // projects with free-form roles keep the structural heuristic.
    const targetRoleLower = targetNode.semanticRole.toLowerCase();
    const roleMatch = CANONICAL_ROLES[targetNode.semanticRole]
      ? resourceFulfilsRole(targetNode.semanticRole, res)
      : res.roles.includes(targetNode.semanticRole) ||
      res.roles.some((r: string) => r.toLowerCase() === targetRoleLower) ||
      res.roles.some((r: string) => r.toLowerCase().includes(targetRoleLower) || targetRoleLower.includes(r.toLowerCase())) ||
      (targetNode.nodeType === 'element' && res.resourceType === 'primitive') ||
      (targetNode.nodeType === 'section' && res.resourceType === 'section') ||
      (targetNode.nodeType === 'component' && (res.resourceType === 'block' || res.resourceType === 'primitive' || res.resourceType === 'ai-pattern' || res.resourceType === 'data-visualization' || res.resourceType === 'state'));

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
      defaultVariant: res.variants[0]?.name ?? 'default',
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

  const currentResource = activeCatalog.find((r: ResourceManifest) => r.id === targetNode?.resourceRef?.id);
  const results: AlternativeCandidate[] = [];

  if (currentResource) {
    // 1. Other variants of the current resource
    for (const v of currentResource.variants) {
      if (v.name !== targetNode.variant) {
        results.push({
          resource: currentResource,
          relationType: 'VARIANT',
          compatibilityScore: 95,
          variant: v.name,
        });
      }
    }

    // 2. Direct relationships declared in resource manifest
    for (const rel of currentResource.relationships) {
      const related = activeCatalog.find((r: ResourceManifest) => r.id === rel.target || r.slug === rel.target);
      if (related) {
        results.push({
          resource: related,
          relationType: rel.type,
          compatibilityScore: 85,
          variant: related.variants[0]?.name ?? 'default',
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
/** Filling a gap removes its "unresolved" marker; the section's content props are kept. */
function withoutGapFlags(props: Record<string, unknown> | undefined): Record<string, unknown> {
  const { unresolvedRequiredRole: _gap, diagnostic: _diag, ...rest } = props ?? {};
  return rest;
}

/**
 * Resources that fit the node's role but are held back by the project's hard constraints (for example an
 * AA-only resource in an AAA project). Shown as a count so the user knows why a gap has no candidates.
 */
export function countRoleMatchesBelowConstraints(manifest: ProjectManifest, nodeId: string, catalog?: ResourceManifest[]): number {
  const activeCatalog = catalog && catalog.length > 0 ? catalog : getAvailableResources();
  const node = manifest.screens.map((s) => findNodeById(s.rootNode, nodeId)).find(Boolean);
  if (!node || !CANONICAL_ROLES[node.semanticRole]) return 0;
  return activeCatalog.filter(
    (res) =>
      resourceFulfilsRole(node.semanticRole, res) &&
      !evaluateHardConstraints({
        resource: res,
        constraints: manifest.constraints,
        requiredAccessibilityFloor: manifest.constraints?.accessibilityFloor,
        performanceCeiling: manifest.constraints?.performanceCeiling,
      }).pass,
  ).length;
}

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

  const defaultSlots: Record<string, unknown> = {};
  for (const slot of replacementResource.slots ?? []) {
    if (slot.defaultValue !== undefined) {
      defaultSlots[slot.id] = slot.defaultValue;
    }
  }

  const replacementNode: ProjectNode = {
    id: nodeId, // preserve ID so tree references and locks stay stable
    nodeType: originalNode?.nodeType ?? (replacementResource.resourceType === 'primitive' ? 'element' : 'component'),
    semanticRole: originalNode?.semanticRole ?? replacementResource.roles[0] ?? 'component',
    resourceRef: {
      id: replacementResource.id,
      slug: replacementResource.slug,
      version: replacementResource.version,
    },
    variant: variant ?? replacementResource.variants[0]?.name ?? 'default',
    slots: {
      ...defaultSlots,
      ...(originalNode?.slots ?? {}),
    },
    props: withoutGapFlags(originalNode?.props),
    children: originalNode?.children ?? [],
    locks: originalNode?.locks,
    dnaOverrides: originalNode?.dnaOverrides,
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
