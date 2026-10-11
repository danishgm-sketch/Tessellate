import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import type { RightTab } from '../../types.js';
import { IntentTab } from './IntentTab.js';
import { StyleTab } from './StyleTab.js';
import { MotionTab } from './MotionTab.js';
import { ContentTab } from './ContentTab.js';
import { ConstraintsTab } from './ConstraintsTab.js';
import { ResourceTab } from './ResourceTab.js';
import {
  Sparkles,
  Palette,
  Play,
  Edit3,
  Shield,
  Box,
  RotateCcw,
  X,
} from 'lucide-react';

export function RightInspector() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const selectNode = useWorkbenchStore((state) => state.selectNode);
  const activeRightTab = useWorkbenchStore((state) => state.activeRightTab);
  const setActiveRightTab = useWorkbenchStore((state) => state.setActiveRightTab);
  const resetNodeDNA = useWorkbenchStore((state) => state.resetNodeDNA);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  const hasDnaOverrides = Boolean(
    selectedNode?.dnaOverrides && Object.keys(selectedNode.dnaOverrides).length > 0
  );

  const tabs: Array<{ id: RightTab; label: string; icon: React.ReactNode }> = [
    { id: 'intent', label: 'Intent', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'style', label: 'Style', icon: <Palette className="h-3.5 w-3.5" /> },
    { id: 'motion', label: 'Motion', icon: <Play className="h-3.5 w-3.5" /> },
    { id: 'content', label: 'Content', icon: <Edit3 className="h-3.5 w-3.5" /> },
    { id: 'constraints', label: 'Locks', icon: <Shield className="h-3.5 w-3.5" /> },
    { id: 'resource', label: 'Resource', icon: <Box className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside
      data-testid="right-inspector"
      className="w-[340px] shrink-0 border-l border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#0E1015] flex flex-col h-full select-none"
    >
      {/* Target Hierarchy Banner */}
      <div className="px-4 py-3 border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] flex items-center justify-between">
        <div className="overflow-hidden">
          <div className="text-[10px] uppercase font-mono tracking-wider text-[#8B8F97]">
            {selectedNode ? `Node: ${selectedNode.nodeType}` : 'Project Scope'}
          </div>
          <div className="font-bold text-xs text-[#111217] dark:text-[#F5F7FA] truncate">
            {selectedNode
              ? (selectedNode.props?.title as string) ||
                (selectedNode.props?.label as string) ||
                selectedNode.semanticRole
              : manifest.name}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {selectedNode && hasDnaOverrides && (
            <button
              onClick={() => resetNodeDNA(selectedNode.id)}
              title="Reset node DNA overrides"
              className="flex items-center gap-1 rounded bg-violet-100 dark:bg-violet-950/60 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:text-violet-300 hover:opacity-80"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Reset</span>
            </button>
          )}
          {selectedNode && (
            <button
              onClick={() => selectNode(null)}
              className="p-1 rounded text-[#8B8F97] hover:text-[#111217] dark:hover:text-[#F5F7FA]"
              title="Deselect Node"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contextual Tabs Switcher */}
      <div className="flex items-center border-b border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#111217] px-1 py-0.5 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeRightTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#FAF9F6] dark:bg-[#171B21] text-[#2547E8] dark:text-[#6782FF] shadow-xs'
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
        {activeRightTab === 'intent' && <IntentTab />}
        {activeRightTab === 'style' && <StyleTab />}
        {activeRightTab === 'motion' && <MotionTab />}
        {activeRightTab === 'content' && <ContentTab />}
        {activeRightTab === 'constraints' && <ConstraintsTab />}
        {activeRightTab === 'resource' && <ResourceTab />}
      </div>
    </aside>
  );
}
