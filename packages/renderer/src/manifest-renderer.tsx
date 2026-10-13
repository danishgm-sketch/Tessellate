import React from 'react';
import type { ManifestRendererProps } from './types.js';
import { NodeRenderer } from './node-renderer.js';
import { normalizeDesignTokens } from './tokens/normalizer.js';
import { tokensToCssVariables } from './tokens/contract.js';

export function ManifestRenderer({
  manifest,
  activeScreenId,
  context,
}: ManifestRendererProps): React.ReactElement {
  const targetScreen =
    manifest.screens.find((s) => s.id === activeScreenId) ?? manifest.screens[0];

  if (!targetScreen) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
        No screens found in project manifest.
      </div>
    );
  }

  // Combine project DNA with render context overrides
  const effectiveDna = {
    ...(manifest.designDNA ?? {}),
    ...(context?.designDNA ?? {}),
  };

  const normalizedTokens = normalizeDesignTokens(effectiveDna, {
    reducedMotion: context?.reducedMotion,
    tokenOverrides: context?.tokenOverrides,
  });

  const cssVariables = tokensToCssVariables(normalizedTokens) as React.CSSProperties;

  return (
    <div
      style={cssVariables}
      className="w-full min-h-full flex flex-col font-[var(--tess-font-body,sans-serif)] bg-[var(--tess-canvas,#F4F2ED)] text-[var(--tess-ink,#111217)]"
      data-screen-id={targetScreen.id}
      data-viewport={context?.viewport ?? 'desktop'}
      data-reduced-motion={context?.reducedMotion ? 'true' : 'false'}
    >
      <NodeRenderer node={targetScreen.rootNode} context={context} />
    </div>
  );
}
