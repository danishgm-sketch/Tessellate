import type { ProjectNode } from '@tessellate/schemas';
import { isNodeLocked } from '../locks/lock-engine.js';

/** Update navigation topology without replacing or duplicating content resources. */
export function applyNavigationLayout(root: ProjectNode, model: string): ProjectNode {
  if (isNodeLocked(root) || root.semanticRole === 'marketing-page') return root;
  const navigationNode = root.children.find((child) => child.semanticRole === 'navigation');
  if (!navigationNode || isNodeLocked(navigationNode)) return root;

  const other = root.children.filter((child) => child !== navigationNode);
  const contentPane = other.length === 1 && ['main-content-scroll', 'workspace-multi-pane'].includes(other[0]!.semanticRole)
    ? other[0]
    : undefined;
  const content = contentPane ? contentPane.children : other;
  const navigation = {
    ...navigationNode,
    props: { ...navigationNode.props, orientation: model === 'top-nav' ? 'horizontal' : 'vertical' },
  };

  if (model === 'top-nav') {
    // A locked pane is an intentional structural boundary. Keep the wrapper and
    // its subtree intact when top navigation would otherwise flatten it.
    const topNavigationContent = contentPane && isNodeLocked(contentPane) ? [contentPane] : content;
    return { ...root, semanticRole: 'top-nav-page-canvas', children: [navigation, ...topNavigationContent] };
  }

  const pane = contentPane ?? {
    id: `navigation-content-${root.id}`,
    nodeType: 'layout' as const,
    semanticRole: 'main-content-scroll',
    children: content,
    slots: {},
    props: {},
  };
  return {
    ...root,
    semanticRole: model === 'sidebar' ? 'sidebar-shell' : 'workspace-dock-shell',
    children: [navigation, isNodeLocked(pane) ? pane : { ...pane, semanticRole: model === 'sidebar' ? 'main-content-scroll' : 'workspace-multi-pane' }],
  };
}
