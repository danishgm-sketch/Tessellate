import React from 'react';
import { calculateCompatibilityScore } from '@tessellate/compatibility';
import { roleLabel } from '@tessellate/composer';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { useLibraryStore } from '../../store/library-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { RefreshCw, Plus } from 'lucide-react';

const card = 'rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-3';
const label = 'text-[10px] uppercase font-mono text-[#62666F] dark:text-[#A8AFBA]';

export function ResourceTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const setActiveLeftTab = useWorkbenchStore((state) => state.setActiveLeftTab);
  const openReplaceDrawer = useWorkbenchStore((state) => state.openReplaceDrawer);
  const library = useLibraryStore((state) => state.resources);
  const libraryStatus = useLibraryStore((state) => state.status);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode = activeScreen && selectedNodeId ? findNodeById(activeScreen.rootNode, selectedNodeId) : null;

  if (!selectedNode) {
    return (
      <div data-testid="resource-tab" className="p-6 text-center text-xs text-[#62666F] dark:text-[#A8AFBA]">
        Select a section on the canvas to see the resource behind it.
      </div>
    );
  }

  if (selectedNode.props?.unresolvedRequiredRole) {
    const diag = selectedNode.props.diagnostic as { reason?: string } | undefined;
    return (
      <div data-testid="resource-tab" className="p-4 space-y-3 text-xs">
        <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1.5">
          <p className="font-semibold text-sm text-amber-950 dark:text-amber-100">Gap: {roleLabel(selectedNode.semanticRole)}</p>
          <p className="text-amber-900 dark:text-amber-200">{diag?.reason ?? 'No resource fills this section yet.'}</p>
        </div>
        <button
          type="button"
          data-testid="fill-gap-btn"
          onClick={() => openReplaceDrawer()}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2547E8] dark:bg-[#6782FF] py-2.5 text-xs font-semibold text-white dark:text-[#0B0D10] hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Pick a resource
        </button>
      </div>
    );
  }

  const ref = selectedNode.resourceRef;
  if (!ref) {
    return (
      <div data-testid="resource-tab" className="p-4 text-xs">
        <div className={`${card} space-y-2`}>
          <div className="font-bold text-[#111217] dark:text-[#F5F7FA]">Layout container</div>
          <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA]">
            This node ({selectedNode.semanticRole}) arranges other sections; it is not a library resource.
          </p>
          <button
            onClick={() => setActiveLeftTab('library')}
            className="mt-2 flex items-center gap-1 text-xs text-[#2547E8] dark:text-[#6782FF] font-semibold hover:underline"
          >
            Browse the library →
          </button>
        </div>
      </div>
    );
  }

  const resource = library.find((r) => r.id === ref.id || r.slug === ref.slug);
  const fit = resource
    ? calculateCompatibilityScore({
        candidate: resource,
        targetDna: manifest.designDNA,
        semanticRole: selectedNode.semanticRole,
        currentArchetype: manifest.productModel.productArchetypes[0]?.tag,
        accessibilityFloor: manifest.constraints?.accessibilityFloor,
      }).totalScore
    : null;
  const deps = resource ? [...resource.dependencies.filter((d) => d.kind !== 'dev').map((d) => d.package), ...resource.registry.registryDependencies] : [];

  return (
    <div data-testid="resource-tab" className="p-4 space-y-4 text-xs overflow-y-auto">
      <div className={`${card} space-y-1.5`}>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm text-[#111217] dark:text-[#F5F7FA]">{resource?.name ?? ref.slug}</span>
          <span className="rounded bg-[#FAF9F6] dark:bg-[#0B0D10] px-1.5 py-0.5 text-[10px] font-mono text-[#62666F] dark:text-[#A8AFBA]">v{ref.version}</span>
        </div>
        <div className="text-[11px] font-mono text-[#62666F] dark:text-[#A8AFBA]">{ref.slug} · fills “{roleLabel(selectedNode.semanticRole)}”</div>
        {resource && <p className="text-[11px] text-[#4A4E57] dark:text-[#C9CED6]">{resource.description}</p>}
        {resource && (
          <p className="text-[11px] text-[#62666F] dark:text-[#A8AFBA]">
            Status: <span className="font-semibold">{resource.status}</span> · Accessibility target WCAG {resource.accessibility.levelTarget}
            {resource.accessibility.keyboardVerified ? '' : ' (keyboard not yet verified)'}
          </p>
        )}
      </div>

      {libraryStatus !== 'ready' ? (
        <p role="status" className="text-[11px] text-[#62666F] dark:text-[#A8AFBA]">
          {libraryStatus === 'error' ? 'Library unavailable; details cannot be shown.' : 'Loading library details…'}
        </p>
      ) : resource ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className={`${card} text-center`}>
              <span className={label}>Quality (declared)</span>
              <div className="mt-1 text-base font-bold text-[#111217] dark:text-[#F5F7FA]">{resource.quality.overall} / 100</div>
            </div>
            <div className={`${card} text-center`}>
              <span className={label}>Fit for this project</span>
              <div className="mt-1 text-base font-bold text-[#2547E8] dark:text-[#6782FF]">{fit}%</div>
            </div>
          </div>
          <div className={`${card} space-y-1.5`}>
            <span className={label}>Dependencies</span>
            <div className="flex flex-wrap gap-1">
              {deps.length === 0 ? (
                <span className="text-[11px] text-[#62666F] dark:text-[#A8AFBA]">None beyond React</span>
              ) : (
                deps.map((dep) => (
                  <span key={dep} className="rounded bg-[#FAF9F6] dark:bg-[#0B0D10] px-2 py-0.5 text-[10px] font-mono text-[#111217] dark:text-[#F5F7FA]">
                    {dep}
                  </span>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-[11px] text-amber-800 dark:text-amber-300">This resource is not in the current library version.</p>
      )}

      <button
        data-testid="open-replace-drawer-btn"
        onClick={() => openReplaceDrawer()}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2547E8] dark:bg-[#6782FF] py-2.5 text-xs font-semibold text-white dark:text-[#0B0D10] hover:opacity-90 transition-opacity"
      >
        <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        <span>Replace resource</span>
      </button>
    </div>
  );
}
