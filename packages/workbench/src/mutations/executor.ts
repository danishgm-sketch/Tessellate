import type {
  ProjectManifest,
  ProjectMutation,
  ProjectNode,
  ProjectScreen,
  DesignDNA,
} from '@tessellate/schemas';
import { ProjectManifestSchema, ProjectMutationSchema } from '@tessellate/schemas';
import { canApplyMutation, LockViolationError, applyLockToNode, removeLockFromNode, syncManifestLocks } from '../locks/lock-engine.js';
import { generateInverseMutation } from './inverse.js';
import { updateNodeInTree, deleteNodeInTree, addNodeToTree, findNodeById } from '../utils/tree-helpers.js';

export class PreconditionRevisionError extends Error {
  constructor(
    public readonly expectedRevision: number,
    public readonly receivedRevision: number,
    public readonly mutationId: string
  ) {
    super(
      `Precondition revision mismatch for mutation "${mutationId}": expected revision ${expectedRevision}, but received ${receivedRevision}.`
    );
    this.name = 'PreconditionRevisionError';
  }
}

export interface ExecuteMutationOptions {
  skipRevisionCheck?: boolean;
  skipLockCheck?: boolean;
}

export interface ExecuteMutationResult {
  nextManifest: ProjectManifest;
  inverseMutation: ProjectMutation;
}

/**
 * Executes a single ProjectMutation immutably against a ProjectManifest.
 * Enforces precondition revision checks and active lock constraints.
 * Returns the updated manifest and the calculated inverse mutation.
 */
export function executeMutation(
  manifest: ProjectManifest,
  mutation: ProjectMutation,
  options?: ExecuteMutationOptions
): ExecuteMutationResult {
  // Mutations are a public contract boundary: validate them before lock checks
  // or execution so duplicated target IDs cannot point at different nodes.
  mutation = ProjectMutationSchema.parse(mutation);

  // 1. Revision precondition check
  if (!options?.skipRevisionCheck) {
    const currentRev = manifest.historyMeta.headRevision;
    if (mutation.preconditionRevision !== currentRev) {
      throw new PreconditionRevisionError(currentRev, mutation.preconditionRevision, mutation.id);
    }
  }

  // 2. Lock constraints check
  if (!options?.skipLockCheck) {
    const lockCheck = canApplyMutation(manifest, mutation);
    if (!lockCheck.allowed) {
      throw new LockViolationError(mutation.targetId, 'node', mutation.type, lockCheck.reason);
    }
  }

  // 3. Calculate inverse mutation before applying changes
  const inverseMutation = generateInverseMutation(manifest, mutation);

  // 4. Immutably apply the mutation
  let updatedManifest: ProjectManifest = { ...manifest };

  switch (mutation.type) {
    case 'SET_DESIGN_TOKEN': {
      const { key, value } = mutation.payload;
      if (mutation.targetId === 'project') {
        const dna = { ...manifest.designDNA } as unknown as Record<string, unknown>;
        dna[key] = value;
        updatedManifest.designDNA = dna as unknown as DesignDNA;
      } else {
        updatedManifest = updateNodeEverywhere(updatedManifest, mutation.targetId, (node) => ({
          ...node,
          tokenOverrides: {
            ...(node.tokenOverrides ?? {}),
            [key]: value,
          },
        }));
      }
      break;
    }

    case 'SET_INTENT': {
      const { dimensions } = mutation.payload;
      if (mutation.targetId === 'project') {
        updatedManifest.designDNA = {
          ...manifest.designDNA,
          ...dimensions,
        };
      } else {
        updatedManifest = updateNodeEverywhere(updatedManifest, mutation.targetId, (node) => ({
          ...node,
          dnaOverrides: {
            ...(node.dnaOverrides ?? {}),
            ...dimensions,
          },
        }));
      }
      break;
    }

    case 'SET_PROP': {
      const { prop, value } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, mutation.targetId, (node) => ({
        ...node,
        props: {
          ...(node.props ?? {}),
          [prop]: value,
        },
      }));
      break;
    }

    case 'SET_CONTENT': {
      const { slot, value } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, mutation.targetId, (node) => ({
        ...node,
        slots: {
          ...(node.slots ?? {}),
          [slot]: value,
        },
      }));
      break;
    }

    case 'INSERT_NODE': {
      const { parentId, node, index } = mutation.payload;
      updatedManifest = {
        ...updatedManifest,
        screens: updatedManifest.screens.map((screen) => ({
          ...screen,
          rootNode: addNodeToTree(screen.rootNode, parentId, node, index),
        })),
      };
      break;
    }

    case 'DELETE_NODE': {
      const { nodeId } = mutation.payload;
      updatedManifest = {
        ...updatedManifest,
        screens: updatedManifest.screens.map((screen) => ({
          ...screen,
          rootNode: deleteNodeInTree(screen.rootNode, nodeId),
        })),
      };
      break;
    }

    case 'MOVE_NODE': {
      const { nodeId, newParentId, index } = mutation.payload;
      // First locate the node
      let movingNode: ProjectNode | null = null;
      for (const s of updatedManifest.screens) {
        const found = findNodeById(s.rootNode, nodeId);
        if (found) {
          movingNode = found;
          break;
        }
      }
      if (movingNode) {
        // Delete from old position and add to new position
        updatedManifest = {
          ...updatedManifest,
          screens: updatedManifest.screens.map((screen) => {
            const deleted = deleteNodeInTree(screen.rootNode, nodeId);
            return {
              ...screen,
              rootNode: addNodeToTree(deleted, newParentId, movingNode!, index),
            };
          }),
        };
      }
      break;
    }

    case 'REPLACE_NODE': {
      const { targetNodeId, replacementNode } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, () => replacementNode);
      break;
    }

    case 'CHANGE_RESOURCE': {
      const { targetNodeId, resourceRef } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) => ({
        ...node,
        resourceRef,
      }));
      break;
    }

    case 'CHANGE_VARIANT': {
      const { targetNodeId, variant } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) => ({
        ...node,
        variant,
      }));
      break;
    }

    case 'CHANGE_LAYOUT': {
      const { targetNodeId, layout } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) => ({
        ...node,
        props: {
          ...(node.props ?? {}),
          layout,
        },
      }));
      break;
    }

    case 'LOCK_NODE': {
      const { targetNodeId, lockTypes } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) =>
        applyLockToNode(node, lockTypes)
      );
      updatedManifest = syncManifestLocks(updatedManifest);
      break;
    }

    case 'UNLOCK_NODE': {
      const { targetNodeId, lockTypes } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) =>
        removeLockFromNode(node, lockTypes)
      );
      updatedManifest = syncManifestLocks(updatedManifest);
      break;
    }

    case 'ADD_SCREEN': {
      const { screen, screenNode } = mutation.payload;
      const groups = updatedManifest.screenGraph.groups.map((g, i) =>
        i === 0 ? { ...g, screens: [...g.screens, screenNode] } : g
      );
      updatedManifest = {
        ...updatedManifest,
        screens: [...updatedManifest.screens, screen],
        screenGraph: {
          ...updatedManifest.screenGraph,
          groups,
        },
      };
      break;
    }

    case 'DELETE_SCREEN': {
      const { screenId } = mutation.payload;
      const targetScreen = updatedManifest.screens.find((s) => s.id === screenId);
      if (!targetScreen) throw new Error(`Cannot delete missing screen "${screenId}".`);
      const graphScreenId = targetScreen.screenNodeId;
      const groups = updatedManifest.screenGraph.groups.map((g) => ({
        ...g,
        screens: g.screens.filter((s) => s.id !== graphScreenId),
      }));
      updatedManifest = {
        ...updatedManifest,
        screens: updatedManifest.screens.filter((s) => s.id !== screenId),
        screenGraph: {
          ...updatedManifest.screenGraph,
          groups,
          edges: updatedManifest.screenGraph.edges.filter(
            (edge) => edge.fromScreenId !== graphScreenId && edge.toScreenId !== graphScreenId
          ),
        },
        navigation: {
          ...updatedManifest.navigation,
          primaryItems: updatedManifest.navigation.primaryItems.filter(
            (item) => item.targetScreenId !== screenId
          ),
          secondaryItems: updatedManifest.navigation.secondaryItems?.filter(
            (item) => item.targetScreenId !== screenId
          ),
        },
      };
      break;
    }

    case 'MOVE_SCREEN': {
      const { screenId, newIndex } = mutation.payload;
      const screens = [...updatedManifest.screens];
      const currentIndex = screens.findIndex((s) => s.id === screenId);
      if (currentIndex >= 0) {
        const [moved] = screens.splice(currentIndex, 1);
        if (moved) {
          screens.splice(newIndex, 0, moved);
        }
        updatedManifest = {
          ...updatedManifest,
          screens,
        };
      }
      break;
    }

    case 'SET_NAVIGATION': {
      updatedManifest.navigation = mutation.payload.navigation;
      break;
    }

    case 'SET_MOTION': {
      const { targetNodeId, motionSettings } = mutation.payload;
      if (targetNodeId && targetNodeId !== 'project') {
        updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) => ({
          ...node,
          props: {
            ...(node.props ?? {}),
            motion: motionSettings,
          },
        }));
      }
      break;
    }

    case 'SET_MEDIA': {
      const { targetNodeId, slot, media } = mutation.payload;
      updatedManifest = updateNodeEverywhere(updatedManifest, targetNodeId, (node) => ({
        ...node,
        slots: {
          ...(node.slots ?? {}),
          [slot]: media,
        },
      }));
      break;
    }
  }

  // 5. Bump revisions and metadata
  updatedManifest = {
    ...updatedManifest,
    historyMeta: {
      headRevision: manifest.historyMeta.headRevision + 1,
      totalOperations: manifest.historyMeta.totalOperations + 1,
    },
    updatedAt: new Date().toISOString(),
  };

  // Keep every mutation result inside the same canonical contract consumed by
  // persistence, export, CLI, and MCP callers.
  updatedManifest = ProjectManifestSchema.parse(updatedManifest);

  return {
    nextManifest: updatedManifest,
    inverseMutation,
  };
}

/**
 * Helper to update a target node across all screens.
 */
function updateNodeEverywhere(
  manifest: ProjectManifest,
  targetNodeId: string,
  updater: (node: ProjectNode) => ProjectNode
): ProjectManifest {
  const updatedScreens: ProjectScreen[] = manifest.screens.map((screen) => ({
    ...screen,
    rootNode: updateNodeInTree(screen.rootNode, targetNodeId, updater),
  }));

  return {
    ...manifest,
    screens: updatedScreens,
  };
}
