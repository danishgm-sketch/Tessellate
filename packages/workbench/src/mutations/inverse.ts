import type {
  ProjectManifest,
  ProjectNode,
  ProjectMutation,
  ProjectScreen,
  ScreenNode,
} from '@tessellate/schemas';
import { findNodeById, findParentNode } from '../utils/tree-helpers.js';

let inverseCounter = 1;

function generateInverseId(originalId: string): string {
  return `inv-${originalId}-${inverseCounter++}`;
}

/**
 * Finds a node by ID across all screens in the manifest.
 */
function findNodeInManifest(
  manifest: ProjectManifest,
  nodeId: string
): { node: ProjectNode; screen: ProjectScreen } | null {
  for (const screen of manifest.screens) {
    const found = findNodeById(screen.rootNode, nodeId);
    if (found) {
      return { node: found, screen };
    }
  }
  return null;
}

/**
 * Computes the exact reversible inverse mutation for any given ProjectMutation
 * applied to a ProjectManifest in its current state.
 */
export function generateInverseMutation(
  manifest: ProjectManifest,
  mutation: ProjectMutation
): ProjectMutation {
  const invId = generateInverseId(mutation.id);
  const now = new Date().toISOString();
  const nextRev = manifest.historyMeta.headRevision + 1;

  switch (mutation.type) {
    case 'SET_DESIGN_TOKEN': {
      const { key } = mutation.payload;
      let prevValue: string | number = '';
      if (mutation.targetId === 'project') {
        const dnaRecord = manifest.designDNA as unknown as Record<string, unknown>;
        prevValue = (dnaRecord[key] as string | number) ?? '';
      } else {
        const found = findNodeInManifest(manifest, mutation.targetId);
        prevValue = (found?.node.tokenOverrides?.[key] as string | number) ?? '';
      }
      return {
        id: invId,
        type: 'SET_DESIGN_TOKEN',
        targetId: mutation.targetId,
        payload: { key, value: prevValue },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'SET_INTENT': {
      const prevDimensions: Record<string, number> = {};
      const requestedKeys = Object.keys(mutation.payload.dimensions);
      if (mutation.targetId === 'project') {
        const dnaRecord = manifest.designDNA as unknown as Record<string, number>;
        for (const k of requestedKeys) {
          prevDimensions[k] = dnaRecord[k] ?? 50;
        }
      } else {
        const found = findNodeInManifest(manifest, mutation.targetId);
        const dnaRecord = (found?.node.dnaOverrides ?? {}) as unknown as Record<string, number>;
        for (const k of requestedKeys) {
          prevDimensions[k] = dnaRecord[k] ?? 50;
        }
      }
      return {
        id: invId,
        type: 'SET_INTENT',
        targetId: mutation.targetId,
        payload: { dimensions: prevDimensions },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'SET_PROP': {
      const found = findNodeInManifest(manifest, mutation.targetId);
      const prevVal = found?.node.props?.[mutation.payload.prop] ?? null;
      return {
        id: invId,
        type: 'SET_PROP',
        targetId: mutation.targetId,
        payload: { prop: mutation.payload.prop, value: prevVal },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'SET_CONTENT': {
      const found = findNodeInManifest(manifest, mutation.targetId);
      const prevVal = found?.node.slots?.[mutation.payload.slot] ?? '';
      return {
        id: invId,
        type: 'SET_CONTENT',
        targetId: mutation.targetId,
        payload: { slot: mutation.payload.slot, value: prevVal },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'INSERT_NODE': {
      // Inverse of inserting a node is deleting that inserted node
      return {
        id: invId,
        type: 'DELETE_NODE',
        targetId: mutation.payload.node.id,
        payload: { nodeId: mutation.payload.node.id },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'DELETE_NODE': {
      // Find deleted node, parent and index
      const found = findNodeInManifest(manifest, mutation.payload.nodeId);
      if (found) {
        const parentResult = findParentNode(found.screen.rootNode, mutation.payload.nodeId);
        const parentId = parentResult?.parent.id ?? found.screen.rootNode.id;
        const index = parentResult?.index ?? 0;
        return {
          id: invId,
          type: 'INSERT_NODE',
          targetId: parentId,
          payload: { parentId, node: found.node, index },
          actor: mutation.actor,
          timestamp: now,
          preconditionRevision: nextRev,
        };
      }
      // Fallback dummy node
      return {
        id: invId,
        type: 'INSERT_NODE',
        targetId: mutation.targetId,
        payload: {
          parentId: mutation.targetId,
          node: {
            id: mutation.payload.nodeId,
            nodeType: 'element',
            semanticRole: 'fallback',
            children: [],
            slots: {},
            props: {},
          },
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'MOVE_NODE': {
      const found = findNodeInManifest(manifest, mutation.payload.nodeId);
      let origParentId = mutation.payload.newParentId;
      let origIndex = 0;
      if (found) {
        const parentResult = findParentNode(found.screen.rootNode, mutation.payload.nodeId);
        if (parentResult) {
          origParentId = parentResult.parent.id;
          origIndex = parentResult.index;
        }
      }
      return {
        id: invId,
        type: 'MOVE_NODE',
        targetId: mutation.payload.nodeId,
        payload: {
          nodeId: mutation.payload.nodeId,
          newParentId: origParentId,
          index: origIndex,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'REPLACE_NODE': {
      const found = findNodeInManifest(manifest, mutation.payload.targetNodeId);
      const originalNode = found?.node ?? mutation.payload.replacementNode;
      return {
        id: invId,
        type: 'REPLACE_NODE',
        targetId: mutation.payload.replacementNode.id,
        payload: {
          targetNodeId: mutation.payload.replacementNode.id,
          replacementNode: originalNode,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'CHANGE_RESOURCE': {
      const found = findNodeInManifest(manifest, mutation.payload.targetNodeId);
      const originalRef = found?.node.resourceRef ?? mutation.payload.resourceRef;
      return {
        id: invId,
        type: 'CHANGE_RESOURCE',
        targetId: mutation.payload.targetNodeId,
        payload: {
          targetNodeId: mutation.payload.targetNodeId,
          resourceRef: originalRef,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'CHANGE_VARIANT': {
      const found = findNodeInManifest(manifest, mutation.payload.targetNodeId);
      const originalVariant = found?.node.variant ?? 'default';
      return {
        id: invId,
        type: 'CHANGE_VARIANT',
        targetId: mutation.payload.targetNodeId,
        payload: {
          targetNodeId: mutation.payload.targetNodeId,
          variant: originalVariant,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'CHANGE_LAYOUT': {
      const found = findNodeInManifest(manifest, mutation.payload.targetNodeId);
      const origLayout = (found?.node.props?.['layout'] as Record<string, unknown>) ?? {};
      return {
        id: invId,
        type: 'CHANGE_LAYOUT',
        targetId: mutation.payload.targetNodeId,
        payload: {
          targetNodeId: mutation.payload.targetNodeId,
          layout: origLayout,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'LOCK_NODE': {
      return {
        id: invId,
        type: 'UNLOCK_NODE',
        targetId: mutation.payload.targetNodeId,
        payload: {
          targetNodeId: mutation.payload.targetNodeId,
          lockTypes: mutation.payload.lockTypes,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'UNLOCK_NODE': {
      return {
        id: invId,
        type: 'LOCK_NODE',
        targetId: mutation.payload.targetNodeId,
        payload: {
          targetNodeId: mutation.payload.targetNodeId,
          lockTypes: mutation.payload.lockTypes,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'ADD_SCREEN': {
      return {
        id: invId,
        type: 'DELETE_SCREEN',
        targetId: mutation.payload.screen.id,
        payload: {
          screenId: mutation.payload.screen.id,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'DELETE_SCREEN': {
      const screenId = mutation.payload.screenId;
      const screen = manifest.screens.find((s) => s.id === screenId);
      let screenNode: ScreenNode | undefined;
      for (const grp of manifest.screenGraph.groups) {
        const sn = grp.screens.find((s) => s.id === screen?.screenNodeId);
        if (sn) {
          screenNode = sn;
          break;
        }
      }
      return {
        id: invId,
        type: 'ADD_SCREEN',
        targetId: screenId,
        payload: {
          screen: screen ?? {
            id: screenId,
            screenNodeId: `sn-${screenId}`,
            name: 'Restored Screen',
            slug: `/${screenId}`,
            rootNode: {
              id: `root-${screenId}`,
              nodeType: 'layout',
              semanticRole: 'screen-root',
              children: [],
              slots: {},
              props: {},
            },
          },
          screenNode: screenNode ?? {
            id: screen?.screenNodeId ?? `sn-${screenId}`,
            name: screen?.name ?? 'Restored Screen',
            slug: screen?.slug ?? `/${screenId}`,
            screenType: 'dashboard',
            purpose: 'Restored screen',
            jobs: [],
            required: false,
            navigationVisibility: 'primary',
            importance: 50,
            expectedData: [],
            requiredRoles: [],
            optionalRoles: [],
          },
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'MOVE_SCREEN': {
      const origIndex = manifest.screens.findIndex((s) => s.id === mutation.payload.screenId);
      return {
        id: invId,
        type: 'MOVE_SCREEN',
        targetId: mutation.payload.screenId,
        payload: {
          screenId: mutation.payload.screenId,
          newIndex: origIndex >= 0 ? origIndex : 0,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'SET_NAVIGATION': {
      return {
        id: invId,
        type: 'SET_NAVIGATION',
        targetId: 'project',
        payload: {
          navigation: manifest.navigation,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'SET_MOTION': {
      const targetId = mutation.payload.targetNodeId ?? 'project';
      return {
        id: invId,
        type: 'SET_MOTION',
        targetId,
        payload: {
          targetNodeId: targetId,
          motionSettings: {},
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }

    case 'SET_MEDIA': {
      const found = findNodeInManifest(manifest, mutation.payload.targetNodeId);
      const prevMedia = (found?.node.slots?.[mutation.payload.slot] as Record<string, unknown>) ?? {};
      return {
        id: invId,
        type: 'SET_MEDIA',
        targetId: mutation.payload.targetNodeId,
        payload: {
          targetNodeId: mutation.payload.targetNodeId,
          slot: mutation.payload.slot,
          media: prevMedia,
        },
        actor: mutation.actor,
        timestamp: now,
        preconditionRevision: nextRev,
      };
    }
  }
}
