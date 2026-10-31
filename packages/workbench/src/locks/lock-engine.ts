import type {
  ProjectManifest,
  ProjectNode,
  ProjectMutation,
  NodeLocks,
  LockSpec,
  LockTypeName,
} from '@tessellate/schemas';
import { LOCK_TYPES } from '@tessellate/schemas';
import { findNodeById, getNodePath, flattenTree } from '../utils/tree-helpers.js';

export type LockType = LockTypeName;

export const ALL_LOCK_TYPES: LockType[] = [...LOCK_TYPES];

export class LockViolationError extends Error {
  constructor(
    public readonly targetNodeId: string,
    public readonly lockType: LockType,
    public readonly mutationType: string,
    message?: string
  ) {
    super(
      message ??
        `Mutation "${mutationType}" violates active "${lockType}" lock on node "${targetNodeId}".`
    );
    this.name = 'LockViolationError';
  }
}

/**
 * Checks whether a node has a specific lock or any lock active.
 * Note: if 'node' is locked, all modifications are considered locked.
 */
export function isNodeLocked(node: ProjectNode, lockType?: LockType): boolean {
  if (!node.locks) return false;
  if (node.locks.node) return true; // Master node lock overrides all
  if (!lockType) {
    return Object.values(node.locks).some(Boolean);
  }
  return Boolean(node.locks[lockType]);
}

/**
 * Checks whether any ancestor of a target node has an active lock.
 */
export function isAncestorLocked(
  root: ProjectNode,
  targetId: string,
  lockType?: LockType
): boolean {
  const path = getNodePath(root, targetId);
  if (path.length <= 1) return false; // Target itself is at root, no ancestors
  // Ancestors are all nodes in path except the last (the target itself)
  const ancestors = path.slice(0, -1);
  return ancestors.some((ancestor) => isNodeLocked(ancestor, lockType));
}

/**
 * Returns all descendant node IDs within a subtree that have an active lock.
 */
export function getLockedDescendantIds(root: ProjectNode, lockType?: LockType): string[] {
  const allNodes = flattenTree(root);
  return allNodes
    .filter((n) => isNodeLocked(n, lockType))
    .map((n) => n.id);
}

/**
 * Validates whether a mutation can be safely applied to the manifest without violating locks.
 */
export function canApplyMutation(
  manifest: ProjectManifest,
  mutation: ProjectMutation
): { allowed: boolean; reason?: string } {
  // Lock toggles are always allowed
  if (mutation.type === 'LOCK_NODE' || mutation.type === 'UNLOCK_NODE') {
    return { allowed: true };
  }

  // Screen level additions / deletions
  if (mutation.type === 'ADD_SCREEN' || mutation.type === 'SET_NAVIGATION') {
    return { allowed: true };
  }

  if (mutation.type === 'DELETE_SCREEN' || mutation.type === 'MOVE_SCREEN') {
    // If all root nodes in screen are unlocked, screen can be manipulated
    const screenId = mutation.payload.screenId;
    const screen = manifest.screens.find((s) => s.id === screenId);
    if (!screen) return { allowed: false, reason: `Screen "${screenId}" does not exist.` };
    if (isNodeLocked(screen.rootNode, 'structure') || isNodeLocked(screen.rootNode, 'node')) {
      return {
        allowed: false,
        reason: `Screen root node "${screen.rootNode.id}" is locked with structure/node lock.`,
      };
    }
    if (mutation.type === 'DELETE_SCREEN') {
      const lockedNodes = getLockedDescendantIds(screen.rootNode);
      if (lockedNodes.length > 0) {
        return {
          allowed: false,
          reason: `Screen contains locked node${lockedNodes.length === 1 ? '' : 's'}: ${lockedNodes.join(', ')}.`,
        };
      }
    }
    return { allowed: true };
  }

  // Node level mutations
  // Locate target node across all screens
  let targetNode: ProjectNode | null = null;
  let targetScreen = manifest.screens[0];

  for (const s of manifest.screens) {
    const found = findNodeById(s.rootNode, mutation.targetId);
    if (found) {
      targetNode = found;
      targetScreen = s;
      break;
    }
  }

  if (!targetNode || !targetScreen) {
    // Could be project-level or non-existent node
    return { allowed: true };
  }

  // Check master node lock
  if (isNodeLocked(targetNode, 'node')) {
    return {
      allowed: false,
      reason: `Node "${targetNode.id}" has a master node lock active.`,
    };
  }

  // Map mutation types to required lock checks
  switch (mutation.type) {
    case 'DELETE_NODE':
    case 'MOVE_NODE':
    case 'REPLACE_NODE': {
      if (isNodeLocked(targetNode, 'structure')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against structural changes.`,
        };
      }
      if (isAncestorLocked(targetScreen.rootNode, targetNode.id, 'structure')) {
        return {
          allowed: false,
          reason: `Ancestor of node "${targetNode.id}" is locked against structural changes.`,
        };
      }
      break;
    }

    case 'INSERT_NODE': {
      const parentId = mutation.payload.parentId;
      const parent = findNodeById(targetScreen.rootNode, parentId);
      if (parent && isNodeLocked(parent, 'structure')) {
        return {
          allowed: false,
          reason: `Parent node "${parent.id}" is locked against child insertion.`,
        };
      }
      break;
    }

    case 'SET_CONTENT':
    case 'SET_MEDIA': {
      if (isNodeLocked(targetNode, 'content') || isNodeLocked(targetNode, 'media')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against content/media modification.`,
        };
      }
      break;
    }

    case 'SET_PROP': {
      if (isNodeLocked(targetNode, 'content') && isNodeLocked(targetNode, 'style')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against property modifications.`,
        };
      }
      break;
    }

    case 'SET_DESIGN_TOKEN': {
      if (isNodeLocked(targetNode, 'style') || isNodeLocked(targetNode, 'dna')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against design token/style modification.`,
        };
      }
      break;
    }

    case 'SET_INTENT': {
      if (isNodeLocked(targetNode, 'dna')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against DNA/intent modification.`,
        };
      }
      break;
    }

    case 'SET_MOTION': {
      if (isNodeLocked(targetNode, 'motion')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against motion modifications.`,
        };
      }
      break;
    }

    case 'CHANGE_RESOURCE':
    case 'CHANGE_VARIANT':
    case 'CHANGE_LAYOUT': {
      if (isNodeLocked(targetNode, 'structure') || isNodeLocked(targetNode, 'style')) {
        return {
          allowed: false,
          reason: `Node "${targetNode.id}" is locked against resource or layout changes.`,
        };
      }
      break;
    }
  }

  return { allowed: true };
}

/**
 * Immutably applies lock types to a ProjectNode.
 */
export function applyLockToNode(node: ProjectNode, lockTypes: LockType[]): ProjectNode {
  const currentLocks: NodeLocks = { ...(node.locks ?? {}) };
  for (const lt of lockTypes) {
    currentLocks[lt] = true;
  }
  return {
    ...node,
    locks: currentLocks,
  };
}

/**
 * Immutably removes lock types from a ProjectNode.
 */
export function removeLockFromNode(node: ProjectNode, lockTypes: LockType[]): ProjectNode {
  const currentLocks: NodeLocks = { ...(node.locks ?? {}) };
  for (const lt of lockTypes) {
    delete currentLocks[lt];
  }
  return {
    ...node,
    locks: currentLocks,
  };
}

/**
 * Synchronizes the top-level manifest.locks array with individual node.locks in screens.
 */
export function syncManifestLocks(manifest: ProjectManifest): ProjectManifest {
  const allLocks: LockSpec[] = [];

  for (const screen of manifest.screens) {
    const nodes = flattenTree(screen.rootNode);
    for (const node of nodes) {
      if (node.locks) {
        const activeTypes = (Object.keys(node.locks) as LockType[]).filter(
          (k) => Boolean(node.locks?.[k])
        );
        if (activeTypes.length > 0) {
          allLocks.push({
            targetNodeId: node.id,
            lockTypes: activeTypes,
          });
        }
      }
    }
  }

  return {
    ...manifest,
    locks: allLocks,
  };
}
