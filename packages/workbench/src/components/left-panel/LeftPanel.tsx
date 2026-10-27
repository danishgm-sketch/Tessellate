import React, { lazy, Suspense } from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { LeftTab } from '../../types.js';
import { FileText, Layers, Grid, BookOpen } from 'lucide-react';

const BriefTab = lazy(() => import('./BriefTab.js').then((module) => ({ default: module.BriefTab })));
const PagesTab = lazy(() => import('./PagesTab.js').then((module) => ({ default: module.PagesTab })));
const LayersTab = lazy(() => import('./LayersTab.js').then((module) => ({ default: module.LayersTab })));
const LibraryTab = lazy(() => import('./LibraryTab.js').then((module) => ({ default: module.LibraryTab })));

export function LeftPanel() {
  const activeLeftTab = useWorkbenchStore((state) => state.activeLeftTab);
  const setActiveLeftTab = useWorkbenchStore((state) => state.setActiveLeftTab);

  const tabs: Array<{ id: LeftTab; label: string; icon: React.ReactNode }> = [
    { id: 'layers', label: 'Layers', icon: <Layers className="h-3.5 w-3.5" /> },
    { id: 'pages', label: 'Pages', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'library', label: 'Library', icon: <Grid className="h-3.5 w-3.5" /> },
    { id: 'brief', label: 'Brief', icon: <BookOpen className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside
      data-testid="left-panel"
      aria-label="Workbench navigation"
      className="dark w-[280px] shrink-0 border-r border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#111419] flex flex-col h-full select-none"
    >
      {/* Tab Switcher Header */}
      <div className="flex items-center border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] p-1">
        {tabs.map((tab) => {
          const isActive = activeLeftTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveLeftTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FAF9F6] dark:bg-[#171B21] text-[#2547E8] dark:text-[#879DFF] shadow-xs'
                  : 'text-[#62666F] dark:text-[#A8AFBA] hover:text-[#111217] dark:hover:text-[#F5F7FA]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<div role="status" className="p-4 text-xs text-[var(--text-muted)]">Loading {activeLeftTab}…</div>}>
          {activeLeftTab === 'brief' && <BriefTab />}
          {activeLeftTab === 'pages' && <PagesTab />}
          {activeLeftTab === 'layers' && <LayersTab />}
          {activeLeftTab === 'library' && <LibraryTab />}
        </Suspense>
      </div>
    </aside>
  );
}
