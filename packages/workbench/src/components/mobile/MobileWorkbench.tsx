import React, { lazy, Suspense } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { MobileTab } from '../../types.js';
import { BrowserManifestRenderer as ManifestRenderer } from '@tessellate/renderer/browser';
import { TopToolbar } from '../TopToolbar.js';
import {
  Eye,
  FileText,
  Sliders,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

const PagesTab = lazy(() => import('../left-panel/PagesTab.js').then((module) => ({ default: module.PagesTab })));
const LayersTab = lazy(() => import('../left-panel/LayersTab.js').then((module) => ({ default: module.LayersTab })));
const RightInspector = lazy(() => import('../right-inspector/RightInspector.js').then((module) => ({ default: module.RightInspector })));
const CommandBar = lazy(() => import('../CommandBar.js').then((module) => ({ default: module.CommandBar })));
const ReplaceDrawer = lazy(() => import('../replace/ReplaceDrawer.js').then((module) => ({ default: module.ReplaceDrawer })));
const CompareModal = lazy(() => import('../compare/CompareModal.js').then((module) => ({ default: module.CompareModal })));
const BlendModal = lazy(() => import('../blend/BlendModal.js').then((module) => ({ default: module.BlendModal })));
const AuditPanel = lazy(() => import('../audit/AuditPanel.js').then((module) => ({ default: module.AuditPanel })));

export function MobileWorkbench({ historySaveStatus = 'saved', storageWarning = null }: { historySaveStatus?: 'loading' | 'saving' | 'saved' | 'unavailable'; storageWarning?: string | null }) {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const mobileTab = useWorkbenchStore((state) => state.mobileTab);
  const setMobileTab = useWorkbenchStore((state) => state.setMobileTab);
  const isReplaceDrawerOpen = useWorkbenchStore((state) => state.isReplaceDrawerOpen);
  const isCompareOpen = useWorkbenchStore((state) => state.isCompareOpen);
  const isBlendOpen = useWorkbenchStore((state) => state.isBlendOpen);
  const reducedMotion = useWorkbenchStore((state) => state.reducedMotion);
  const lastActionMessage = useWorkbenchStore((state) => state.lastActionMessage);

  const tabs: Array<{ id: MobileTab; label: string; icon: React.ReactNode }> = [
    { id: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" /> },
    { id: 'pages', label: 'Pages', icon: <FileText className="h-4 w-4" /> },
    { id: 'selection', label: 'Inspect', icon: <Sliders className="h-4 w-4" /> },
    { id: 'command', label: 'Command', icon: <Terminal className="h-4 w-4" /> },
    { id: 'audit', label: 'Audit', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <div
      data-testid="mobile-workbench"
      className="flex flex-col h-screen w-full bg-[#0B0D10] text-[#F5F7FA] overflow-hidden"
    >
      <a href="#workbench-main" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:not-sr-only focus:bg-white focus:px-3 focus:py-2 focus:text-[#111217] focus:outline-2 focus:outline-offset-2 focus:outline-[#6782FF]">Skip to editor</a>
      <TopToolbar historySaveStatus={historySaveStatus} />
      {storageWarning && (
        <div role="status" aria-live="polite" data-testid="storage-warning" className="border-b border-amber-500/30 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
          {storageWarning}
        </div>
      )}
      {lastActionMessage && mobileTab !== 'command' && (
        <div
          data-testid="mobile-action-feedback"
          role="status"
          aria-live="polite"
          className="shrink-0 border-b border-[#272C34] bg-[#111217] px-4 py-2 text-xs leading-5 text-[#D7DCE5]"
        >
          {lastActionMessage}
        </div>
      )}
      {/* Main Content Area */}
      <main id="workbench-main" tabIndex={-1} aria-label="Workbench editor" className="relative z-0 flex-1 overflow-y-auto">
        <h1 className="sr-only">Workbench: {manifest.name}</h1>
        {mobileTab === 'preview' && (
          <div className="p-4">
            <div className="rounded-2xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] overflow-hidden shadow-sm">
              <ManifestRenderer
                manifest={manifest}
                activeScreenId={activeScreenId}
                context={{
                  selectedNodeId: selectedNodeId ?? undefined,
                  onNodeSelect: (id) => {
                    selectNode(id);
                    setMobileTab('selection');
                  },
                  viewport: 'mobile',
                  reducedMotion,
                }}
              />
            </div>
          </div>
        )}

        {mobileTab === 'pages' && (
          <div className="dark p-4 space-y-6">
            <Suspense fallback={<div role="status" className="text-xs text-[#A8AFBA]">Loading pages and layers…</div>}>
              <PagesTab />
              <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />
              <LayersTab />
            </Suspense>
          </div>
        )}

        {mobileTab === 'selection' && <Suspense fallback={<div role="status" className="p-4 text-xs text-[#A8AFBA]">Loading inspector…</div>}><RightInspector /></Suspense>}
        {mobileTab === 'command' && <div className="dark p-4 space-y-4"><h2>Project command</h2><p className="text-sm">Use deterministic changes such as “more playful”, “reduce motion”, “replace”, or “compare”. Unsupported commands explain their limits.</p><Suspense fallback={<div role="status" className="text-xs text-[#A8AFBA]">Loading project commands…</div>}><CommandBar /></Suspense></div>}
        {mobileTab === 'audit' && (
          <div className="h-full">
            <Suspense fallback={<div role="status" className="p-4 text-xs text-[#A8AFBA]">Loading project audit…</div>}><AuditPanel /></Suspense>
          </div>
        )}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav aria-label="Mobile Workbench" className="dark h-16 shrink-0 border-t border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] flex items-center justify-around px-2 select-none z-30">
        {tabs.map((tab) => {
          const isActive = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              aria-pressed={isActive} onClick={() => setMobileTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-[#2547E8] dark:text-[#879DFF]'
                  : 'text-[#62666F] dark:text-[#A8AFBA]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      {isReplaceDrawerOpen && <Suspense fallback={<div role="status" className="p-4 text-xs text-[#A8AFBA]">Loading replacement…</div>}><ReplaceDrawer /></Suspense>}
      {isCompareOpen && <Suspense fallback={<div role="status" className="p-4 text-xs text-[#A8AFBA]">Loading comparison…</div>}><CompareModal /></Suspense>}
      {isBlendOpen && <Suspense fallback={<div role="status" className="p-4 text-xs text-[#A8AFBA]">Loading blend controls…</div>}><BlendModal /></Suspense>}
    </div>
  );
}
