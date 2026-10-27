import React, { Suspense } from 'react';
import {GOLD_RESOURCE_PROPS} from './generated-gold-props.js';
import { RESOURCE_VARIANTS } from './generated-resource-variants.js';
import { nodeLayoutClass, nodeRuntimeVariant } from './layout-contract.js';
import type { NodeRendererProps } from './types.js';
import type { ResourceRendererMap } from './types.js';
import { normalizeDesignTokens } from './tokens/normalizer.js';
import { tokensToCssVariables } from './tokens/contract.js';

class ResourceLoadBoundary extends React.Component<
  { slug: string; children: React.ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override render() {
    if (this.state.failed) {
      return (
        <div
          data-testid="resource-load-failure"
          role="alert"
          className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <p className="font-semibold">Could not load resource: {this.props.slug}</p>
          <p className="mt-1">The project reference is preserved. Reload the page to retry this resource.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function createNodeRenderer(defaultRegistry: ResourceRendererMap) {
  const NodeRenderer = ({ node, context }: NodeRendererProps): React.ReactElement | null => {
  const isSelected = context?.selectedNodeId === node.id;
  const isHovered = context?.hoveredNodeId === node.id;
  const viewport = context?.viewport ?? 'desktop';
  const isReducedMotion = context?.reducedMotion ?? false;

  const registry = {
    ...defaultRegistry,
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
      e.preventDefault();
      context.onNodeSelect(node.id);
    }
  };

  const handleDisabledControlPointerDownCapture = (e: React.PointerEvent) => {
    if (context?.onNodeSelect && e.target instanceof Element && e.target.closest(':disabled')) {
      e.preventDefault();
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
  if (node.dnaOverrides || node.tokenOverrides) {
    const effectiveDna = {
      ...(context?.designDNA ?? {}),
      ...node.dnaOverrides,
    };
    const localTokens = normalizeDesignTokens(effectiveDna, {
      reducedMotion: isReducedMotion,
      activeMode:effectiveDna.visualMode==='adaptive'?context?.systemMode:undefined,
      tokenOverrides: {...context?.tokenOverrides,...node.tokenOverrides},
    });
    localStyle = tokensToCssVariables(localTokens) as React.CSSProperties;
  }

  // 3. Render children recursively
  const childContext = {...context,designDNA:{...context?.designDNA,...node.dnaOverrides},tokenOverrides:{...context?.tokenOverrides,...node.tokenOverrides}};

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

    const variant = nodeRuntimeVariant(node,childContext?.designDNA ?? {},context?.systemMode);
    const supportedVariants = RESOURCE_VARIANTS[slug] ?? RESOURCE_VARIANTS[node.resourceRef.id];
    if (variant && supportedVariants && !supportedVariants.includes(variant)) {
      return (
        <div
          data-node-id={node.id}
          data-testid="unsupported-resource-variant"
          data-resource-variant={variant}
          role="alert"
          onClick={handleSelect}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={localStyle}
          className={`rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-xs text-amber-900 font-mono ${selectionClasses}`}
        >
          <div className="font-semibold">Unsupported variant &quot;{variant}&quot; for resource &quot;{slug}&quot;.</div>
          <p className="mt-1">Supported variants: {supportedVariants.join(', ')}.</p>
          <p className="mt-1 text-[11px]">This resource was not rendered; the manifest value remains available to correct.</p>
        </div>
      );
    }
    const mergedProps = {
      ...Object.fromEntries(Object.entries({...node.slots,...node.props}).filter(([key])=>!GOLD_RESOURCE_PROPS[slug] || GOLD_RESOURCE_PROPS[slug]?.includes(key) || key.startsWith('aria-') || key.startsWith('data-'))),
      ...(variant ? { variant } : {}),
    };

    const acceptsExplicitChildren = !GOLD_RESOURCE_PROPS[slug] || GOLD_RESOURCE_PROPS[slug].includes('children');
    const propsHaveChildren = Object.prototype.hasOwnProperty.call(node.props ?? {}, 'children');
    const explicitChildren = propsHaveChildren ? node.props?.children : node.slots?.children;
    const hasExplicitChildren = acceptsExplicitChildren && explicitChildren !== undefined && explicitChildren !== null;
    const hasRenderedChildren = Boolean(renderedChildren && renderedChildren.length > 0);
    const hasChildren = hasExplicitChildren || hasRenderedChildren;
    const childrenToPass = hasExplicitChildren && hasRenderedChildren
      ? <>{explicitChildren as React.ReactNode}{renderedChildren}</>
      : hasExplicitChildren
      ? explicitChildren as React.ReactNode
      : hasRenderedChildren
      ? renderedChildren
      : undefined;

    return (
      <div
        data-node-id={node.id}
        data-resource-variant={variant}
        data-node-type={node.nodeType}
        data-semantic-role={node.semanticRole}
        onPointerDownCapture={handleDisabledControlPointerDownCapture}
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...localStyle,
          ...(node.props?.style as React.CSSProperties ?? {}),
        }}
        className={`@container ${nodeLayoutClass(node)} relative ${motionClasses} ${layoutModifierClasses} ${selectionClasses}`}
      >
        <ResourceLoadBoundary key={slug} slug={slug}>
          <Suspense
            fallback={
              <div role="status" data-testid="resource-loading" className="min-h-12 px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400 motion-reduce:animate-none">
                Loading {slug}…
              </div>
            }
          >
            {hasChildren ? (
              <Component {...mergedProps}>{childrenToPass}</Component>
            ) : (
              <Component {...mergedProps} />
            )}
          </Suspense>
        </ResourceLoadBoundary>
      </div>
    );
  }

  // 8. Generic layout container node
  const domProps = Object.fromEntries(Object.entries(node.props ?? {}).filter(([key])=>key==='id' || key==='title' || key.startsWith('aria-')));
  const hasPropChildren = node.props?.children !== undefined && node.props.children !== null;
  const hasRenderedChildren = Boolean(renderedChildren && renderedChildren.length > 0);
  const content = hasPropChildren && hasRenderedChildren
    ? <>{node.props?.children as React.ReactNode}{renderedChildren}</>
    : hasRenderedChildren
    ? renderedChildren
    : node.props?.children as React.ReactNode;

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
      className={`${nodeLayoutClass(node)} relative ${motionClasses} ${layoutModifierClasses} ${selectionClasses} ${typeof node.props.className==='string' ? node.props.className : ''}`}
      {...domProps}
    >
      {content}
    </div>
  );
  };

  return NodeRenderer;
}
