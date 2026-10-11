import React, { useState } from 'react';
import { X, RefreshCw, Check, Sparkles, Zap, Award } from 'lucide-react';
import { isGoldResource } from '@tessellate/catalog/gold';
import type { ResourceManifest } from '@tessellate/schemas';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import {
  getReplaceCandidates,
  getAlternativeCandidates,
} from '../../mutations/replace.js';

function ResourceVisualPreview({ resource }: { resource: ResourceManifest }) {
  const isGold = isGoldResource(resource.slug);
  return (
    <div className="relative my-2 rounded-md border border-zinc-800/80 bg-zinc-900/90 p-2.5 overflow-hidden">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 pb-1 border-b border-zinc-800/50">
        <span className="font-mono text-zinc-500 truncate max-w-[150px]">{resource.slug}</span>
        <div className="flex items-center gap-1.5">
          {isGold && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-semibold flex items-center gap-0.5">
              <Award className="h-2.5 w-2.5" /> Gold
            </span>
          )}
          <span className="text-[9px] text-zinc-500 uppercase">{resource.resourceType}</span>
        </div>
      </div>

      {resource.resourceType === 'primitive' || resource.roles.includes('action-button') ? (
        <div className="flex items-center justify-center py-2">
          <div className="px-3 py-1 rounded border border-zinc-700 bg-zinc-800 text-[11px] font-medium text-zinc-200 shadow-sm">
            <span>{typeof resource.preview?.defaultProps?.label === 'string' ? resource.preview.defaultProps.label : resource.name}</span>
          </div>
        </div>
      ) : resource.roles.includes('data-chart') || resource.categories.includes('charts') ? (
        <div className="py-1">
          <div className="h-10 w-full rounded bg-zinc-950/60 border border-zinc-800/50 p-1 flex items-end gap-1">
            <div className="h-4 w-1/6 bg-indigo-500/40 rounded-t" />
            <div className="h-7 w-1/6 bg-indigo-500/60 rounded-t" />
            <div className="h-5 w-1/6 bg-indigo-500/50 rounded-t" />
            <div className="h-8 w-1/6 bg-indigo-500/70 rounded-t" />
            <div className="h-6 w-1/6 bg-indigo-500/55 rounded-t" />
            <div className="h-9 w-1/6 bg-indigo-500/80 rounded-t" />
          </div>
        </div>
      ) : resource.roles.includes('metric-kpi') || resource.categories.includes('cards') ? (
        <div className="rounded bg-zinc-950/60 border border-zinc-800/50 p-2 text-left">
          <div className="text-[10px] text-zinc-400 font-medium">Metric KPI</div>
          <div className="text-sm font-bold font-mono text-zinc-200 mt-0.5">$124,500</div>
        </div>
      ) : (
        <div className="rounded bg-zinc-950/60 border border-zinc-800/50 p-2 space-y-1">
          <div className="h-2 w-3/4 bg-zinc-800 rounded" />
          <div className="h-1.5 w-1/2 bg-zinc-800/60 rounded" />
        </div>
      )}
    </div>
  );
}

export const ReplaceDrawer: React.FC = () => {
  const isReplaceDrawerOpen = useWorkbenchStore((state) => state.isReplaceDrawerOpen);
  const closeReplaceDrawer = useWorkbenchStore((state) => state.closeReplaceDrawer);
  const manifest = useWorkbenchStore((state) => state.manifest);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const replaceNodeWithResource = useWorkbenchStore((state) => state.replaceNodeWithResource);

  const [activeTab, setActiveTab] = useState<'compatible' | 'alternatives'>('compatible');

  if (!isReplaceDrawerOpen || !selectedNodeId) return null;

  const replaceCandidates = getReplaceCandidates(manifest, selectedNodeId);
  const alternativeCandidates = getAlternativeCandidates(manifest, selectedNodeId);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Replace Resource"
      className="fixed inset-y-0 right-0 z-50 w-96 border-l border-zinc-800 bg-zinc-900 shadow-2xl flex flex-col text-zinc-100"
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
          Compatible Candidates ({replaceCandidates.length})
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
          Alternatives & Variants ({alternativeCandidates.length})
        </button>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'compatible' && (
          <>
            {replaceCandidates.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
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
                      <h4 className="text-xs font-semibold text-zinc-200">
                        {cand.resource.name}
                      </h4>
                      <span className="rounded bg-indigo-950/60 border border-indigo-800/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-300">
                        {cand.compatibilityScore}% fit
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {cand.resource.description}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1 italic">
                      {cand.rationale}
                    </p>

                    <ResourceVisualPreview resource={cand.resource} />

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
            {alternativeCandidates.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
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
                      <h4 className="text-xs font-semibold text-zinc-200">
                        {alt.resource.name} {alt.variant && `(${alt.variant})`}
                      </h4>
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                        {alt.relationType}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                      {alt.resource.description}
                    </p>
                    <ResourceVisualPreview resource={alt.resource} />
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
    </aside>
  );
};
