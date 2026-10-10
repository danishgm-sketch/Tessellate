import React from 'react';
import type { ManifestRendererProps } from './types.js';
import { NodeRenderer } from './node-renderer.js';

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

  return (
    <div className="w-full min-h-full flex flex-col" data-screen-id={targetScreen.id}>
      <NodeRenderer node={targetScreen.rootNode} context={context} />
    </div>
  );
}
