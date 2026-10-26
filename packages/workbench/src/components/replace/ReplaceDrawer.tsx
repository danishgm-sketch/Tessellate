import { useDialogFocus } from '@tessellate/ui';
import React, { useEffect, useState } from 'react';
import { X, RefreshCw, Check, Sparkles, Zap, Award } from 'lucide-react';
import { isGoldResource } from '@tessellate/catalog/gold';
import { NodeRenderer } from '@tessellate/renderer';
import { runtimeVariant } from '@tessellate/compatibility';
import { loadActiveCatalog } from '../../mutations/runtime-catalog.js';
import { useRuntimeCatalogStatus } from '../useRuntimeCatalogStatus.js';
import type { ResourceManifest } from '@tessellate/schemas';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import {
  createReplaceOperation,
  getReplaceCandidates,
  getAlternativeCandidates,
} from '../../mutations/replace.js';

function ResourceVisualPreview({ resource,variant }: { resource: ResourceManifest;variant?:string }) {
  const manifest=useWorkbenchStore(state=>state.manifest);
  const selected=useWorkbenchStore(state=>state.selectedNodeId);
  const operation=selected?createReplaceOperation(manifest,selected,resource,variant):null;
  const mutation=operation?.mutations[0];
  const node=mutation?.type==='REPLACE_NODE'?mutation.payload.replacementNode:null;
  const isGold = isGoldResource(resource.slug);
  return (
    <div className="relative my-2 rounded-md border border-zinc-800/80 bg-zinc-900/90 p-2.5 overflow-hidden">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 pb-1 border-b border-zinc-800/50">
        <span className="font-mono text-zinc-400 truncate max-w-[150px]">{resource.slug}</span>
        <div className="flex items-center gap-1.5">
          {isGold && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-semibold flex items-center gap-0.5">
              <Award className="h-2.5 w-2.5" /> Gold
            </span>
          )}
          <span className="text-[9px] text-zinc-400 uppercase">{resource.resourceType}</span>
        </div>
      </div>

      <div role="region" aria-label={`${resource.name} actual preview`} tabIndex={0} className="max-h-64 overflow-auto bg-white text-neutral-900">
        <NodeRenderer node={node ?? {id:`preview-${resource.slug}`,nodeType:'component',semanticRole:resource.roles[0] ?? 'preview',resourceRef:{id:resource.id,slug:resource.slug,version:resource.version},variant:runtimeVariant(resource),props:resource.preview?.defaultProps ?? {},slots:{},children:[]}} context={{designDNA:manifest.designDNA}}/>
      </div>
    </div>
  );
}

export const ReplaceDrawer: React.FC = () => {
  const isReplaceDrawerOpen = useWorkbenchStore((state) => state.isReplaceDrawerOpen);
  const closeReplaceDrawer = useWorkbenchStore((state) => state.closeReplaceDrawer);
  const manifest = useWorkbenchStore((state) => state.manifest);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const replaceNodeWithResource = useWorkbenchStore((state) => state.replaceNodeWithResource);
  const catalogStatus = useRuntimeCatalogStatus();

  const [activeTab, setActiveTab] = useState<'compatible' | 'alternatives'>('compatible');

  const dialogRef = useDialogFocus<HTMLDivElement>(isReplaceDrawerOpen,closeReplaceDrawer);

  useEffect(() => {
    if (isReplaceDrawerOpen) void loadActiveCatalog().catch(() => undefined);
  }, [isReplaceDrawerOpen]);

  if (!isReplaceDrawerOpen || !selectedNodeId) return null;

  const replaceCandidates = getReplaceCandidates(manifest, selectedNodeId);
  const alternativeCandidates = getAlternativeCandidates(manifest, selectedNodeId);

  return (
    <div
      ref={dialogRef as React.Ref<HTMLDivElement>} tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Replace Resource"
      className="fixed inset-y-0 right-0 z-50 w-[min(100vw,384px)] border-l border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col text-zinc-100"
    >
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-800 px-5 bg-zinc-900/90">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold">Replace Resource</h2>
        </div>
        <button
          onClick={closeReplaceDrawer}
          aria-label="Close Replace Drawer"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('compatible')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'compatible'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Compatible Candidates ({catalogStatus === 'ready' ? replaceCandidates.length : '…'})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('alternatives')}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'alternatives'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Alternatives & Variants ({catalogStatus === 'ready' ? alternativeCandidates.length : '…'})
        </button>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'compatible' && (
          <>
            {catalogStatus === 'loading' || catalogStatus === 'idle' ? (
              <div role="status" className="p-8 text-center text-xs text-zinc-300">Loading compatible candidates from the verified catalogue…</div>
            ) : catalogStatus === 'error' ? (
              <div role="alert" className="p-8 text-center text-xs text-zinc-300 space-y-3"><p>The catalogue is unavailable. Replacement is paused; your project is unchanged.</p><button type="button" className="underline" onClick={() => void loadActiveCatalog().catch(() => undefined)}>Retry catalogue</button></div>
            ) : replaceCandidates.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No compatible candidate resources found matching the current semantic role and constraints.
              </div>
            ) : (
              replaceCandidates.map((cand) => (
                <div
                  key={cand.resource.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 hover:border-zinc-700 transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-zinc-200">
                        {cand.resource.name}
                      </h3>
                      <span className="rounded bg-indigo-950/60 border border-indigo-800/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                        {cand.compatibilityScore}% fit
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {cand.resource.description}
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 italic">
                      {cand.rationale}
                    </p>

                    <ResourceVisualPreview resource={cand.resource} variant={cand.defaultVariant} />

                    <div className="mt-2.5 flex items-center gap-3 text-[10px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-emerald-400" />
                        Perf: {cand.performanceDelta >= 0 ? `+${cand.performanceDelta}` : cand.performanceDelta}
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        Ambition: {cand.ambitionDelta >= 0 ? `+${cand.ambitionDelta}` : cand.ambitionDelta}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid="apply-replacement-btn"
                    data-resource-slug={cand.resource.slug}
                    onClick={() => replaceNodeWithResource(selectedNodeId, cand.resource, cand.defaultVariant)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-800 py-1.5 text-xs font-medium text-zinc-200 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Apply Replacement
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'alternatives' && (
          <>
            {catalogStatus === 'loading' || catalogStatus === 'idle' ? (
              <div role="status" className="p-8 text-center text-xs text-zinc-300">Loading alternatives from the verified catalogue…</div>
            ) : catalogStatus === 'error' ? (
              <div role="alert" className="p-8 text-center text-xs text-zinc-300 space-y-3"><p>The catalogue is unavailable. Alternatives are paused; your project is unchanged.</p><button type="button" className="underline" onClick={() => void loadActiveCatalog().catch(() => undefined)}>Retry catalogue</button></div>
            ) : alternativeCandidates.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No direct alternative relationships or variants available for this node.
              </div>
            ) : (
              alternativeCandidates.map((alt, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 hover:border-zinc-700 transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold text-zinc-200">
                        {alt.resource.name} {alt.variant && `(${alt.variant})`}
                      </h3>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                        {alt.relationType}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {alt.resource.description}
                    </p>
                    <ResourceVisualPreview resource={alt.resource} variant={alt.variant} />
                  </div>

                  <button
                    type="button"
                    onClick={() => replaceNodeWithResource(selectedNodeId, alt.resource, alt.variant)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-800 py-1.5 text-xs font-medium text-zinc-200 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Switch to Alternative
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
