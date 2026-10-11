import React from 'react';
import type { NodeRendererProps } from './types.js';
import { DEFAULT_RESOURCE_RENDERERS } from './default-registry.js';
import { normalizeDesignTokens } from './tokens/normalizer.js';
import { tokensToCssVariables } from './tokens/contract.js';

export function NodeRenderer({ node, context }: NodeRendererProps): React.ReactElement | null {
  const isSelected = context?.selectedNodeId === node.id;
  const isHovered = context?.hoveredNodeId === node.id;
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

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (context?.onNodeHover) {
      e.stopPropagation();
      context.onNodeHover(node.id);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (context?.onNodeHover && isHovered) {
      e.stopPropagation();
      context.onNodeHover(null);
    }
  };

  // 2. Compute local DNA overrides if present
  let localStyle: React.CSSProperties = {};
  if (node.dnaOverrides && Object.keys(node.dnaOverrides).length > 0) {
    const effectiveDna = {
      ...(context?.designDNA ?? {}),
      ...node.dnaOverrides,
    };
    const localTokens = normalizeDesignTokens(effectiveDna, {
      reducedMotion: isReducedMotion,
      tokenOverrides: node.tokenOverrides,
    });
    localStyle = tokensToCssVariables(localTokens) as React.CSSProperties;
  }

  // 3. Render children recursively
  const childContext = node.dnaOverrides && Object.keys(node.dnaOverrides).length > 0
    ? {
        ...context,
        designDNA: {
          ...(context?.designDNA ?? {}),
          ...node.dnaOverrides,
        },
      }
    : context;

  const renderedChildren = node.children?.map((child) => (
    <NodeRenderer key={child.id} node={child} context={childContext} />
  ));

  // 4. Motion classes
  const motionClasses = isReducedMotion
    ? 'transition-none duration-0 animate-none'
    : 'transition-all duration-[var(--tess-duration-normal,200ms)] ease-[var(--tess-easing,ease-out)]';

  // 5. Responsive layout modifiers
  let layoutModifierClasses = '';
  if (viewport === 'mobile') {
    if (responsiveStrategy === 'stack') {
      layoutModifierClasses = 'flex flex-col gap-4 w-full';
    } else if (responsiveStrategy === 'collapse') {
      layoutModifierClasses = 'overflow-hidden max-h-48';
    }
  }

  // 6. Highlight classes for selection & hover
  const selectionClasses = isSelected
    ? 'ring-2 ring-[var(--tess-cobalt,#2547E8)] outline-none rounded-lg'
    : isHovered
    ? 'ring-1 ring-dashed ring-neutral-400 dark:ring-neutral-500 rounded-lg'
    : '';

  // 6.5. Explicit diagnostic for fail-closed unresolved required role
  if (node.props?.unresolvedRequiredRole) {
    const diag = node.props.diagnostic as { role?: string; reason?: string } | undefined;
    return (
      <div
        data-node-id={node.id}
        data-testid="unresolved-required-role-diagnostic"
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={localStyle}
        className={`rounded-xl border border-dashed border-amber-300 bg-amber-50/90 dark:border-amber-700/60 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-200 transition-all ${selectionClasses}`}
      >
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-base">⚠️</span>
          <span>Unresolved Required Role: {diag?.role ?? node.semanticRole}</span>
        </div>
        <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-300/80">
          {diag?.reason ?? 'No candidate resource met the strict accessibility or performance hard constraints.'}
        </p>
      </div>
    );
  }

  // 7. If node references a canonical resource
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={localStyle}
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

    const hasChildren = Boolean(node.props?.children) || Boolean(renderedChildren && renderedChildren.length > 0);
    const childrenToPass = (node.props?.children as React.ReactNode) ?? (renderedChildren && renderedChildren.length > 0 ? renderedChildren : undefined);

    return (
      <div
        data-node-id={node.id}
        data-node-type={node.nodeType}
        data-semantic-role={node.semanticRole}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...localStyle,
          ...(node.props?.style as React.CSSProperties ?? {}),
        }}
        className={`relative ${motionClasses} ${layoutModifierClasses} ${selectionClasses}`}
      >
        {hasChildren ? (
          <Component {...mergedProps}>{childrenToPass}</Component>
        ) : (
          <Component {...mergedProps} />
        )}
      </div>
    );
  }

  // 8. Generic layout container node
  const { layoutVariant: _lv, layoutFamily: _lf, children: _c, style: _s, ...domProps } = (node.props ?? {}) as Record<string, unknown>;
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...localStyle,
        ...(node.props?.style as React.CSSProperties ?? {}),
      }}
      className={`relative ${motionClasses} ${layoutModifierClasses} ${selectionClasses}`}
      {...domProps}
    >
      {content}
    </div>
  );
}
