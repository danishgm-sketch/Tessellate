import { useDialogFocus } from '@tessellate/ui';
import React from 'react';
import { BrowserManifestRenderer as ManifestRenderer } from '@tessellate/renderer/browser';
import { X, ArrowRight, CheckCircle, SplitSquareHorizontal } from 'lucide-react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { compareManifests } from '../../compare/compare-engine.js';
import { DeviceFrame } from '../canvas/DeviceFrame.js';

export const CompareModal: React.FC = () => {
  const isCompareOpen = useWorkbenchStore((state) => state.isCompareOpen);
  const closeCompare = useWorkbenchStore((state) => state.closeCompare);
  const manifest = useWorkbenchStore((state) => state.manifest);
  const compareManifest = useWorkbenchStore((state) => state.compareManifest);
  const devicePreset = useWorkbenchStore((state) => state.devicePreset);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);

  const dialogRef = useDialogFocus<HTMLElement>(isCompareOpen,closeCompare);

  if (!isCompareOpen || !compareManifest) return null;

  const comparison = compareManifests(compareManifest, manifest);

  return (
    <div
      ref={dialogRef as React.Ref<HTMLDivElement>} tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Compare Versions"
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950/90 backdrop-blur-md text-zinc-100"
    >
      {/* Top Header */}
      <header className="flex min-h-14 flex-wrap gap-2 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-6">
        <div className="flex items-center gap-3">
          <SplitSquareHorizontal className="h-5 w-5 text-indigo-400" />
          <h2 className="text-base font-semibold">Compare Mode</h2>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 font-mono">
            {compareManifest.name} <ArrowRight className="inline h-3 w-3 mx-1" /> {manifest.name}
          </span>
        </div>

        <button
          onClick={closeCompare}
          aria-label="Close Compare Mode"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Main Split View */}
      <div className="flex flex-col md:flex-row flex-1 overflow-auto">
        {/* Left Side: Compare Target (Baseline / Prior) */}
        <div className="flex-1 border-r border-zinc-800 flex flex-col bg-zinc-900/40 overflow-hidden">
          <div className="flex h-10 items-center justify-between border-b border-zinc-800/80 px-4 bg-zinc-900/60">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Comparison Target: {compareManifest.name}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Rev {compareManifest.historyMeta.headRevision}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <DeviceFrame preset={devicePreset}>
              <ManifestRenderer manifest={compareManifest} activeScreenId={activeScreenId}/>
            </DeviceFrame>
          </div>
        </div>

        {/* Right Side: Current Active Manifest */}
        <div className="flex-1 flex flex-col bg-zinc-900/20 overflow-hidden">
          <div className="flex h-10 items-center justify-between border-b border-zinc-800/80 px-4 bg-zinc-900/60">
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
              Current Project: {manifest.name}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Rev {manifest.historyMeta.headRevision}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <DeviceFrame preset={devicePreset}>
              <ManifestRenderer manifest={manifest} activeScreenId={activeScreenId}/>
            </DeviceFrame>
          </div>
        </div>

        {/* Differences Sidebar */}
        <div className="w-80 border-l border-zinc-800 bg-zinc-900/80 p-4 flex flex-col overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Difference Summary ({comparison.summary.length})
          </h3>

          {comparison.identical ? (
            <div className="flex items-center gap-2 rounded bg-emerald-950/40 border border-emerald-800/60 p-3 text-xs text-emerald-300">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Versions are identical in DNA and screen structure.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {comparison.summary.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded border border-zinc-800 bg-zinc-950/60 p-2.5 text-xs text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
