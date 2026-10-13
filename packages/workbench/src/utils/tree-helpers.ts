import type { ProjectNode, NodeLocks } from '@tessellate/schemas';

/**
 * Searches a node tree recursively for a node with the given ID.
 */
export function findNodeById(root: ProjectNode, id: string): ProjectNode | null {
  if (root.id === id) {
    return root;
  }
  if (!root.children || root.children.length === 0) {
    return null;
  }
  for (const child of root.children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

/**
 * Finds the parent node and index of a target node in the tree.
 */
export function findParentNode(
  root: ProjectNode,
  targetId: string
): { parent: ProjectNode; index: number } | null {
  if (!root.children || root.children.length === 0) {
    return null;
  }
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    if (!child) continue;
    if (child.id === targetId) {
      return { parent: root, index: i };
    }
    const deeper = findParentNode(child, targetId);
    if (deeper) return deeper;
  }
  return null;
}

/**
 * Returns the path from the root node to the target node as an array of ProjectNodes.
 */
export function getNodePath(root: ProjectNode, targetId: string): ProjectNode[] {
  if (root.id === targetId) {
    return [root];
  }
  if (!root.children || root.children.length === 0) {
    return [];
  }
  for (const child of root.children) {
    const childPath = getNodePath(child, targetId);
    if (childPath.length > 0) {
      return [root, ...childPath];
    }
  }
  return [];
}

/**
 * Immutably updates a node in the tree by applying an updater function.
 */
export function updateNodeInTree(
  root: ProjectNode,
  targetId: string,
  updater: (node: ProjectNode) => ProjectNode
): ProjectNode {
  if (root.id === targetId) {
    return updater(root);
  }
  if (!root.children || root.children.length === 0) {
    return root;
  }
  const updatedChildren = root.children.map((child) =>
    updateNodeInTree(child, targetId, updater)
  );
  return {
    ...root,
    children: updatedChildren,
  };
}

/**
 * Immutably deletes a node from the tree.
 */
export function deleteNodeInTree(root: ProjectNode, targetId: string): ProjectNode {
  if (!root.children || root.children.length === 0) {
    return root;
  }
  const filtered = root.children
    .filter((child) => child.id !== targetId)
    .map((child) => deleteNodeInTree(child, targetId));
  return {
    ...root,
    children: filtered,
  };
}

/**
 * Immutably adds a new child node to a specified parent in the tree.
 */
export function addNodeToTree(
  root: ProjectNode,
  parentId: string,
  newNode: ProjectNode,
  index?: number
): ProjectNode {
  if (root.id === parentId) {
    const existing = root.children ? [...root.children] : [];
    if (typeof index === 'number' && index >= 0 && index <= existing.length) {
      existing.splice(index, 0, newNode);
    } else {
      existing.push(newNode);
    }
    return {
      ...root,
      children: existing,
    };
  }
  if (!root.children || root.children.length === 0) {
    return root;
  }
  return {
    ...root,
    children: root.children.map((child) => addNodeToTree(child, parentId, newNode, index)),
  };
}

/**
 * Flattens all nodes in the tree into an array in depth-first order.
 */
export function flattenTree(root: ProjectNode): ProjectNode[] {
  const result: ProjectNode[] = [root];
  if (root.children && root.children.length > 0) {
    for (const child of root.children) {
      result.push(...flattenTree(child));
    }
  }
  return result;
}

/**
 * Checks whether a node has any lock or a specific lock type set.
 */
export function isNodeLocked(node: ProjectNode, lockType?: keyof NodeLocks): boolean {
  if (!node.locks) return false;
  if (lockType) {
    return Boolean(node.locks[lockType]);
  }
  return Object.values(node.locks).some(Boolean);
}
