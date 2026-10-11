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
  /** @deprecated Do not use `divergence`. Use `divergenceLevel`. */
  divergence?: never;
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
 * Recomposition rearranges, updates, or transforms unlocked sections while retaining
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

  // 2. Perform graph transformation based on divergence level
  const divergence = options?.divergenceLevel ?? 50;
  const newRootNode = transformScreenGraph(screen.rootNode, lockedNodeMap, divergence, options?.seed);

  // 3. Verify all locked nodes survived intact
  const newAllNodes = flattenTree(newRootNode);
  for (const [lockedId, originalLockedNode] of lockedNodeMap.entries()) {
    const survivingNode = newAllNodes.find((n) => n.id === lockedId);
    if (!survivingNode) {
      throw new Error(`Integrity error: Locked node "${lockedId}" was dropped during recomposition.`);
    }

    // Verify byte-level integrity for locked attributes
    if (originalLockedNode.locks?.node) {
      if (JSON.stringify(survivingNode) !== JSON.stringify(originalLockedNode)) {
        throw new Error(`Integrity error: Master-locked node "${lockedId}" was modified during recomposition.`);
      }
    } else {
      if (originalLockedNode.locks?.structure) {
        if (
          survivingNode.semanticRole !== originalLockedNode.semanticRole ||
          survivingNode.resourceRef?.id !== originalLockedNode.resourceRef?.id
        ) {
          throw new Error(`Integrity error: Structure-locked node "${lockedId}" had structure modified.`);
        }
      }
      if (originalLockedNode.locks?.content) {
        if (JSON.stringify(survivingNode.props) !== JSON.stringify(originalLockedNode.props)) {
          throw new Error(`Integrity error: Content-locked node "${lockedId}" had props modified.`);
        }
      }
      if (originalLockedNode.locks?.style) {
        if (survivingNode.variant !== originalLockedNode.variant) {
          throw new Error(`Integrity error: Style-locked node "${lockedId}" had variant modified.`);
        }
      }
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
    `Recomposed ${screen.name} around ${lockedNodes.length} locked node(s) (divergence ${divergence})`,
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
 * Real graph transformation:
 * - divergence <= 35: Modest structural reordering and density tuning
 * - divergence 36 - 80: Materially different hierarchy (parent/child nesting, split containers)
 * - divergence > 80: Radical alternative (dock workspace shell, section splitting / merging)
 */
function transformScreenGraph(
  root: ProjectNode,
  lockedNodeMap: Map<string, ProjectNode>,
  divergence: number,
  seed?: string
): ProjectNode {
  return transformNodeTree(root, lockedNodeMap, divergence, seed);
}

function transformNodeTree(
  node: ProjectNode,
  lockedNodeMap: Map<string, ProjectNode>,
  divergence: number,
  seed?: string
): ProjectNode {
  // If this node is locked, return frozen node exactly
  if (lockedNodeMap.has(node.id)) {
    return lockedNodeMap.get(node.id)!;
  }

  const children = node.children || [];
  if (children.length === 0) {
    return {
      ...node,
      props: {
        ...node.props,
        recomposed: true,
      },
    };
  }

  // Categorize direct children
  const lockedChildren: ProjectNode[] = [];
  const unlockedChildren: ProjectNode[] = [];

  for (const child of children) {
    const subtree = flattenTree(child);
    const hasLocked = subtree.some((n) => lockedNodeMap.has(n.id));
    if (hasLocked) {
      // Recurse into child so its inner unlocked children also get transformed
      lockedChildren.push(transformNodeTree(child, lockedNodeMap, divergence, seed));
    } else {
      unlockedChildren.push(child);
    }
  }

  let transformedChildren: ProjectNode[] = [];

  if (divergence <= 35) {
    // CASE 1: Modest Divergence (<= 35, e.g. divergence 20)
    const modifiedUnlocked = unlockedChildren.map((child) => ({
      ...child,
      props: {
        ...child.props,
        recomposed: true,
        density: 'comfortable',
      },
    }));

    if (modifiedUnlocked.length > 1) {
      const first = modifiedUnlocked.shift()!;
      modifiedUnlocked.push(first);
    }

    transformedChildren = [...lockedChildren, ...modifiedUnlocked];
  } else if (divergence <= 80) {
    // CASE 2: Materially Different Hierarchy (36 - 80, e.g. divergence 70)
    const modifiedUnlocked = unlockedChildren.map((child) => ({
      ...child,
      variant: child.variant === 'quiet' ? 'expressive' : child.variant,
      props: {
        ...child.props,
        recomposed: true,
        layoutVariant: 'split-focus',
      },
    }));

    if (modifiedUnlocked.length >= 2) {
      const containerId = `container-split-${(seed || '70').replace(/[^a-z0-9]/gi, '')}-${node.id}`;
      const splitPaneContainer: ProjectNode = {
        id: containerId,
        nodeType: 'layout',
        semanticRole: 'grid-dashboard-container',
        variant: 'quiet',
        children: modifiedUnlocked,
        slots: {},
        props: {
          recomposed: true,
          layoutVariant: 'split-focus',
        },
      };
      transformedChildren = [...lockedChildren, splitPaneContainer];
    } else {
      transformedChildren = [...lockedChildren, ...modifiedUnlocked];
    }
  } else {
    // CASE 3: Radical Divergence (> 80, e.g. divergence 95)
    if (unlockedChildren.length >= 2) {
      const firstTwo = unlockedChildren.slice(0, 2);
      const remainder = unlockedChildren.slice(2);

      const compoundId = `compound-block-${(seed || '95').replace(/[^a-z0-9]/gi, '')}-${node.id}`;
      const compoundBlock: ProjectNode = {
        id: compoundId,
        nodeType: 'section',
        semanticRole: 'compound-workspace-pane',
        variant: 'nocturne',
        children: firstTwo.map((c) => ({
          ...c,
          props: {
            ...c.props,
            recomposed: true,
            layoutVariant: 'dock-pane',
          },
        })),
        slots: {},
        props: {
          recomposed: true,
          compound: true,
          layoutVariant: 'radical-alternative',
        },
      };

      transformedChildren = [
        ...lockedChildren,
        compoundBlock,
        ...remainder.map((r) => ({
          ...r,
          variant: 'nocturne',
          props: { ...r.props, recomposed: true, layoutVariant: 'dock-pane' },
        })),
      ];
    } else if (unlockedChildren.length === 1) {
      const target = unlockedChildren[0]!;
      const splitLeft: ProjectNode = {
        id: `${target.id}-split-primary`,
        nodeType: 'block',
        semanticRole: `${target.semanticRole}-primary`,
        variant: 'nocturne',
        children: [],
        slots: {},
        props: {
          recomposed: true,
          splitRole: 'primary',
        },
      };
      const splitRight: ProjectNode = {
        id: `${target.id}-split-secondary`,
        nodeType: 'block',
        semanticRole: `${target.semanticRole}-secondary`,
        variant: 'nocturne',
        children: [],
        slots: {},
        props: {
          recomposed: true,
          splitRole: 'secondary',
        },
      };

      const containerNode: ProjectNode = {
        id: `${target.id}-split-container`,
        nodeType: 'layout',
        semanticRole: 'split-workspace-columns',
        variant: 'nocturne',
        children: [splitLeft, splitRight],
        slots: {},
        props: {
          recomposed: true,
          layoutVariant: 'radical-alternative',
        },
      };

      transformedChildren = [...lockedChildren, containerNode];
    } else {
      transformedChildren = lockedChildren;
    }
  }

  const isRootOrShell =
    node.nodeType === 'layout' &&
    (node.semanticRole.includes('shell') ||
      node.id.includes('shell') ||
      node.id.includes('root'));

  return {
    ...node,
    semanticRole:
      divergence > 80 && isRootOrShell ? 'workspace-dock-shell' : node.semanticRole,
    props: {
      ...node.props,
      recomposed: true,
      layoutVariant:
        divergence > 80
          ? 'radical-dock-workspace'
          : divergence > 35
          ? 'split-focus'
          : 'modular-grid',
    },
    children: transformedChildren,
  };
}
