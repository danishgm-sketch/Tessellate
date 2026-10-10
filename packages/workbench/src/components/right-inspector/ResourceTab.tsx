import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { RefreshCw } from 'lucide-react';

export function ResourceTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const setActiveLeftTab = useWorkbenchStore((state) => state.setActiveLeftTab);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  if (!selectedNode) {
    return (
      <div data-testid="resource-tab" className="p-6 text-center text-xs text-[#8B8F97]">
        Select a node to inspect its underlying resource metadata.
      </div>
    );
  }

  const res = selectedNode.resourceRef;

  return (
    <div data-testid="resource-tab" className="p-4 space-y-4 text-xs overflow-y-auto">
      {res ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#111217] dark:text-[#F5F7FA]">
                {res.slug}
              </span>
              <span className="rounded bg-[#FAF9F6] dark:bg-[#0B0D10] px-1.5 py-0.5 text-[10px] font-mono text-[#8B8F97]">
                v{res.version}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#8B8F97]">ID: {res.id}</div>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 text-center">
              <span className="text-[10px] text-[#8B8F97] uppercase font-mono">
                Quality Score
              </span>
              <div className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
                98 / 100
              </div>
            </div>
            <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 text-center">
              <span className="text-[10px] text-[#8B8F97] uppercase font-mono">
                Compatibility
              </span>
              <div className="mt-1 text-base font-bold text-[#2547E8] dark:text-[#6782FF]">
                96% Fit
              </div>
            </div>
          </div>

          {/* Dependencies */}
          <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-[#8B8F97]">
              Declared Dependencies
            </span>
            <div className="flex flex-wrap gap-1">
              {['react', 'tailwindcss-v4', 'lucide-react'].map((dep) => (
                <span
                  key={dep}
                  className="rounded bg-[#FAF9F6] dark:bg-[#0B0D10] px-2 py-0.5 text-[10px] font-mono text-[#111217] dark:text-[#F5F7FA]"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>

          {/* Replace Flow Action */}
          <button
            onClick={() => setActiveLeftTab('library')}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2547E8] dark:bg-[#6782FF] py-2.5 text-xs font-semibold text-white dark:text-[#0B0D10] hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Open Library to Replace</span>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-4 space-y-2">
          <div className="font-bold text-[#111217] dark:text-[#F5F7FA]">
            Generic Layout Container
          </div>
          <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA]">
            This node ({selectedNode.semanticRole}) is a structural layout container rather than a catalog component.
          </p>
          <button
            onClick={() => setActiveLeftTab('library')}
            className="mt-2 flex items-center gap-1 text-xs text-[#2547E8] dark:text-[#6782FF] font-semibold hover:underline"
          >
            Browse components in Library →
          </button>
        </div>
      )}
    </div>
  );
}
