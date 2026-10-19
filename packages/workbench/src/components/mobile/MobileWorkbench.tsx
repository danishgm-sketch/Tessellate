import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import type { MobileTab } from '../../types.js';
import { ManifestRenderer } from '@tessellate/renderer';
import { PagesTab } from '../left-panel/PagesTab.js';
import { LayersTab } from '../left-panel/LayersTab.js';
import { TopToolbar } from '../TopToolbar.js';
import { RightInspector } from '../right-inspector/RightInspector.js';
import { CommandBar } from '../CommandBar.js';
import { ReplaceDrawer } from '../replace/ReplaceDrawer.js';
import { CompareModal } from '../compare/CompareModal.js';
import { BlendModal } from '../blend/BlendModal.js';
import {
  Eye,
  FileText,
  Sliders,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { AuditPanel } from '../audit/AuditPanel.js';

export function MobileWorkbench() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const mobileTab = useWorkbenchStore((state) => state.mobileTab);
  const setMobileTab = useWorkbenchStore((state) => state.setMobileTab);
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
      <TopToolbar />
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
      <div className="relative z-0 flex-1 overflow-y-auto">
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
            <PagesTab />
            <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />
            <LayersTab />
          </div>
        )}

        {mobileTab === 'selection' && <RightInspector />}
        {mobileTab === 'command' && <div className="dark p-4 space-y-4"><h2>Project command</h2><p className="text-sm">Use deterministic changes such as “more playful”, “reduce motion”, “replace”, or “compare”. Unsupported commands explain their limits.</p><CommandBar /></div>}
        {mobileTab === 'audit' && (
          <div className="h-full">
            <AuditPanel />
          </div>
        )}
      </div>

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
      <ReplaceDrawer /><CompareModal /><BlendModal />
    </div>
  );
}
