import React from 'react';
import type { NodeRendererProps } from './types.js';
import { DEFAULT_RESOURCE_RENDERERS } from './default-registry.js';

export function NodeRenderer({ node, context }: NodeRendererProps): React.ReactElement {
  const isSelected = context?.selectedNodeId === node.id;
  const registry = {
    ...DEFAULT_RESOURCE_RENDERERS,
    ...(context?.customComponents ?? {}),
  };

  const handleSelect = (e: React.MouseEvent) => {
    if (context?.onNodeSelect) {
      e.stopPropagation();
      context.onNodeSelect(node.id);
    }
  };

  // Render children recursively
  const renderedChildren = node.children?.map((child) => (
    <NodeRenderer key={child.id} node={child} context={context} />
  ));

  // If node references a canonical resource
  if (node.resourceRef) {
    const slug = node.resourceRef.slug;
    const Component = registry[slug] ?? registry[node.resourceRef.id];

    if (!Component) {
      // Recoverable missing resource fallback
      return (
        <div
          data-node-id={node.id}
          onClick={handleSelect}
          className={`rounded border border-dashed border-amber-400 bg-amber-50 p-2.5 text-xs text-amber-900 font-mono transition-all ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="font-semibold">⚠️ Unresolved resource: {slug}</div>
          <div className="text-[10px] text-amber-700">Node ID: {node.id}</div>
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
        onClick={handleSelect}
        className={`inline-block relative transition-all ${
          isSelected ? 'ring-2 ring-[var(--tess-cobalt,#2547E8)] rounded-lg' : ''
        }`}
      >
        <Component {...mergedProps}>
          {node.props?.children as React.ReactNode ?? renderedChildren}
        </Component>
      </div>
    );
  }

  // Otherwise, render generic layout node / container
  return (
    <div
      data-node-id={node.id}
      onClick={handleSelect}
      className={`relative transition-all ${
        isSelected ? 'ring-2 ring-[var(--tess-cobalt,#2547E8)]' : ''
      }`}
      {...node.props}
    >
      {renderedChildren}
    </div>
  );
}
