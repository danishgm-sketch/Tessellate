import React,{useEffect,useState} from 'react';
import type { ComponentType } from 'react';
import type { ManifestRendererProps, NodeRendererProps } from './types.js';
import { MANIFEST_LAYOUT_CSS } from './layout-contract.js';
import { normalizeDesignTokens } from './tokens/normalizer.js';
import { tokensToCssVariables } from './tokens/contract.js';

export function createManifestRenderer(NodeRenderer: ComponentType<NodeRendererProps>) {
  const ManifestRenderer = ({
  manifest,
  activeScreenId,
  context,
  }: ManifestRendererProps): React.ReactElement => {
  const [systemMode,setSystemMode]=useState<'light'|'dark'>('light');
  useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const update=()=>setSystemMode(media.matches?'dark':'light');update();media.addEventListener('change',update);return ()=>media.removeEventListener('change',update);},[]);
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
    activeMode:effectiveDna.visualMode==='adaptive'?systemMode:undefined,
    tokenOverrides: context?.tokenOverrides,
  });

  const cssVariables = tokensToCssVariables(normalizedTokens) as React.CSSProperties;

  return (
    <div
      style={cssVariables}
      className="tess-screen w-full min-h-full flex flex-col font-[var(--tess-font-body,sans-serif)] bg-[var(--tess-canvas,#F4F2ED)] text-[var(--tess-ink,#111217)]"
      data-screen-id={targetScreen.id}
      data-viewport={context?.viewport ?? 'desktop'}
      data-reduced-motion={context?.reducedMotion ? 'true' : 'false'}
    >
      <style>{MANIFEST_LAYOUT_CSS}</style>
      <NodeRenderer node={targetScreen.rootNode} context={{...context,designDNA:effectiveDna,systemMode}} />
    </div>
  );
  };

  return ManifestRenderer;
}
