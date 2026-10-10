import React from 'react';
import type { NodeRendererProps } from './types.js';
import { DEFAULT_RESOURCE_RENDERERS } from './default-registry.js';

export function NodeRenderer({ node, context }: NodeRendererProps): React.ReactElement | null {
  const isSelected = context?.selectedNodeId === node.id;
  const viewport = context?.viewport ?? 'desktop';
  const isReducedMotion = context?.reducedMotion ?? false;

  const registry = {
    ...DEFAULT_RESOURCE_RENDERERS,
    ...(context?.customComponents ?? {}),
  };

  // 1. Responsive Strategy Application
  const responsiveStrategy = node.responsiveOverrides?.strategy as string | undefined;
  if (viewport === 'mobile') {
    if (responsiveStrategy === 'omit-nonessential') {
      return null;
    }
  }

  const handleSelect = (e: React.MouseEvent) => {
    if (context?.onNodeSelect) {
      e.stopPropagation();
      context.onNodeSelect(node.id);
    }
  };

  // 2. Render children recursively
  const renderedChildren = node.children?.map((child) => (
    <NodeRenderer key={child.id} node={child} context={context} />
  ));

  // 3. Motion classes
  const motionClasses = isReducedMotion
    ? 'transition-none duration-0 animate-none'
    : 'transition-all duration-[var(--tess-duration-normal,200ms)] ease-[var(--tess-easing,ease-out)]';

  // 4. Responsive layout modifiers
  let layoutModifierClasses = '';
  if (viewport === 'mobile') {
    if (responsiveStrategy === 'stack') {
      layoutModifierClasses = 'flex flex-col gap-4 w-full';
    } else if (responsiveStrategy === 'collapse') {
      layoutModifierClasses = 'overflow-hidden max-h-48';
    }
  }

  // 5. If node references a canonical resource
  if (node.resourceRef) {
    const slug = node.resourceRef.slug;
    const Component = registry[slug] ?? registry[node.resourceRef.id];

    if (!Component) {
      // Recoverable missing resource fallback placeholder
      return (
        <div
          data-node-id={node.id}
          data-testid="missing-resource-recovery"
          onClick={handleSelect}
          className={`rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-xs text-amber-900 font-mono transition-all ${
            isSelected ? 'ring-2 ring-[var(--tess-cobalt,#2547E8)]' : ''
          }`}
        >
          <div className="font-semibold flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Unresolved resource: {slug}</span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            Node ID: {node.id} — Preserved in manifest for seamless recovery.
          </div>
        </div>
      );
    }

    const mergedProps = {
      ...(node.props ?? {}),
      ...(node.variant ? { variant: node.variant } : {}),
    };

    return (
      <div
        data-node-id={node.id}
        data-node-type={node.nodeType}
        data-semantic-role={node.semanticRole}
        onClick={handleSelect}
        className={`relative ${motionClasses} ${layoutModifierClasses} ${
          isSelected ? 'ring-2 ring-[var(--tess-cobalt,#2547E8)] rounded-lg' : ''
        }`}
      >
        <Component {...mergedProps}>
          {node.props?.children as React.ReactNode ?? renderedChildren}
        </Component>
      </div>
    );
  }

  // 6. Generic layout container node
  const content =
    renderedChildren && renderedChildren.length > 0
      ? renderedChildren
      : (node.props?.children as React.ReactNode);

  return (
    <div
      data-node-id={node.id}
      data-node-type={node.nodeType}
      data-semantic-role={node.semanticRole}
      onClick={handleSelect}
      className={`relative ${motionClasses} ${layoutModifierClasses} ${
        isSelected ? 'ring-2 ring-[var(--tess-cobalt,#2547E8)]' : ''
      }`}
      {...node.props}
    >
      {content}
    </div>
  );
}
