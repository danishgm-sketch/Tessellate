import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { MobileTab } from '../../types.js';
import { ManifestRenderer } from '@tessellate/renderer';
import { PagesTab } from '../left-panel/PagesTab.js';
import { LayersTab } from '../left-panel/LayersTab.js';
import { IntentTab } from '../right-inspector/IntentTab.js';
import { StyleTab } from '../right-inspector/StyleTab.js';
import { ConstraintsTab } from '../right-inspector/ConstraintsTab.js';
import {
  Eye,
  FileText,
  Sliders,
  Terminal,
} from 'lucide-react';

export function MobileWorkbench() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const mobileTab = useWorkbenchStore((state) => state.mobileTab);
  const setMobileTab = useWorkbenchStore((state) => state.setMobileTab);
  const reducedMotion = useWorkbenchStore((state) => state.reducedMotion);

  const tabs: Array<{ id: MobileTab; label: string; icon: React.ReactNode }> = [
    { id: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" /> },
    { id: 'pages', label: 'Pages', icon: <FileText className="h-4 w-4" /> },
    { id: 'selection', label: 'Inspect', icon: <Sliders className="h-4 w-4" /> },
    { id: 'command', label: 'Command', icon: <Terminal className="h-4 w-4" /> },
  ];

  return (
    <div
      data-testid="mobile-workbench"
      className="flex flex-col h-full w-full bg-[#FAF9F6] dark:bg-[#0B0D10] text-[#111217] dark:text-[#F5F7FA] overflow-hidden"
    >
      {/* Mobile Top Header */}
      <header className="h-12 shrink-0 border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-[#2547E8] text-white flex items-center justify-center font-bold text-xs">
            T
          </div>
          <span className="font-bold text-xs truncate max-w-[180px]">
            {manifest.name}
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#8B8F97]">
          {mobileTab.toUpperCase()}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
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
          <div className="p-4 space-y-6">
            <PagesTab />
            <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />
            <LayersTab />
          </div>
        )}

        {mobileTab === 'selection' && (
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <IntentTab />
              <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />
              <StyleTab />
              <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />
              <ConstraintsTab />
            </div>
          </div>
        )}

        {mobileTab === 'command' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="font-bold text-sm">Mobile Quick Commands</div>
            <p className="text-[#62666F] dark:text-[#A8AFBA]">
              Tap a quick operation to alter project intent deterministically:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  useWorkbenchStore.getState().updateProjectDNA({ professionalism: 95 })
                }
                className="p-3 rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] font-semibold text-left"
              >
                Max Professionalism
              </button>
              <button
                onClick={() =>
                  useWorkbenchStore.getState().updateProjectDNA({ playfulness: 85, curvature: 60 })
                }
                className="p-3 rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] font-semibold text-left"
              >
                More Playful
              </button>
              <button
                onClick={() =>
                  useWorkbenchStore.getState().updateProjectDNA({ motion: 10 })
                }
                className="p-3 rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] font-semibold text-left"
              >
                Reduce Motion
              </button>
              <button
                onClick={() =>
                  useWorkbenchStore.getState().updateProjectDNA({ curvature: 0 })
                }
                className="p-3 rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] font-semibold text-left"
              >
                Sharp Edges
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="h-16 shrink-0 border-t border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] flex items-center justify-around px-2 select-none z-30">
        {tabs.map((tab) => {
          const isActive = mobileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                isActive
                  ? 'text-[#2547E8] dark:text-[#6782FF]'
                  : 'text-[#62666F] dark:text-[#A8AFBA]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
