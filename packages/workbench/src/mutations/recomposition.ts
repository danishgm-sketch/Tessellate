import type {
  ProjectManifest,
  ProjectNode,
  HistoryOperation,
} from '@tessellate/schemas';
import { flattenTree } from '../utils/tree-helpers.js';
import { isNodeLocked } from '../locks/lock-engine.js';
import { createHistoryOperation } from '../history/history-manager.js';

export interface RecomposeOptions {
  divergenceLevel?: number; // 0 - 100
  alternativeGrammar?: string;
  seed?: string;
}

export interface RecomposeResult {
  operation: HistoryOperation;
  lockedNodesPreserved: string[];
  recomposedNodesCount: number;
}

/**
 * Recomposes a screen's structure while strictly preserving all locked descendants unchanged.
 * Recomposition rearranges, updates, or replaces unlocked sections while retaining
 * exact frozen nodes for all nodes with active locks.
 */
export function recomposeScreenAroundLocks(
  manifest: ProjectManifest,
  screenId: string,
  options?: RecomposeOptions
): RecomposeResult {
  const screen = manifest.screens.find((s) => s.id === screenId);
  if (!screen) {
    throw new Error(`Screen with id "${screenId}" not found in manifest.`);
  }

  // 1. Identify all locked nodes in the screen
  const allNodes = flattenTree(screen.rootNode);
  const lockedNodes = allNodes.filter((n) => isNodeLocked(n));
  const lockedNodeMap = new Map<string, ProjectNode>();

  for (const n of lockedNodes) {
    // Deep clone the locked node to freeze it completely
    lockedNodeMap.set(n.id, JSON.parse(JSON.stringify(n)) as ProjectNode);
  }

  // 2. Build the recomposed root tree preserving locked nodes
  const newRootNode = reconstructNodeWithLocks(screen.rootNode, lockedNodeMap, options);

  // 3. Verify all locked nodes survived intact
  const newAllNodes = flattenTree(newRootNode);
  for (const lockedId of lockedNodeMap.keys()) {
    const survivingNode = newAllNodes.find((n) => n.id === lockedId);
    if (!survivingNode) {
      throw new Error(`Integrity error: Locked node "${lockedId}" was dropped during recomposition.`);
    }
  }

  // 4. Create the REPLACE_NODE mutation replacing the screen root
  const mutation = {
    id: `mut-recompose-${Date.now()}`,
    type: 'REPLACE_NODE' as const,
    targetId: screen.rootNode.id,
    payload: {
      targetNodeId: screen.rootNode.id,
      replacementNode: newRootNode,
    },
    actor: 'deterministic-engine' as const,
    timestamp: new Date().toISOString(),
    preconditionRevision: manifest.historyMeta.headRevision,
  };

  const operation = createHistoryOperation(
    `Recomposed ${screen.name} around ${lockedNodes.length} locked node(s)`,
    [mutation],
    'deterministic-engine',
    [screen.rootNode.id, ...Array.from(lockedNodeMap.keys())]
  );

  return {
    operation,
    lockedNodesPreserved: Array.from(lockedNodeMap.keys()),
    recomposedNodesCount: allNodes.length - lockedNodes.length,
  };
}

/**
 * Recursively reconstructs a node tree, preserving frozen locked nodes exactly as they were,
 * while applying layout and styling variations to unlocked nodes.
 */
function reconstructNodeWithLocks(
  node: ProjectNode,
  lockedNodeMap: Map<string, ProjectNode>,
  options?: RecomposeOptions
): ProjectNode {
  // If this node itself is locked, return its frozen exact copy
  if (lockedNodeMap.has(node.id)) {
    return lockedNodeMap.get(node.id)!;
  }

  // If node has children, process children
  const children = node.children || [];
  const reconstructedChildren = children.map((child) =>
    reconstructNodeWithLocks(child, lockedNodeMap, options)
  );

  // Apply recomposition alterations to unlocked node
  const divergence = options?.divergenceLevel ?? 50;
  const isHighDivergence = divergence > 60;

  // Adapt unlocked layout or presentation properties
  const modifiedProps = { ...node.props };
  if (node.nodeType === 'layout' || node.nodeType === 'section') {
    modifiedProps['recomposed'] = true;
    modifiedProps['layoutVariant'] = isHighDivergence ? 'split-focus' : 'modular-grid';
  } else if (node.nodeType === 'component') {
    modifiedProps['density'] = isHighDivergence ? 'compact' : 'comfortable';
  }

  return {
    ...node,
    props: modifiedProps,
    children: reconstructedChildren,
  };
}
