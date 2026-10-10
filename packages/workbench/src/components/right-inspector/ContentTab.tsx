import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import { Edit3 } from 'lucide-react';

export function ContentTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const updateNodeProps = useWorkbenchStore((state) => state.updateNodeProps);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  if (!selectedNode) {
    return (
      <div data-testid="content-tab" className="p-6 text-center text-xs text-[#8B8F97] space-y-2">
        <Edit3 className="h-6 w-6 mx-auto opacity-40" />
        <p>Select a node on the canvas or layers tree to inspect and edit its content slots.</p>
      </div>
    );
  }

  const props = selectedNode.props ?? {};

  const handlePropChange = (key: string, value: unknown) => {
    updateNodeProps(selectedNode.id, { [key]: value });
  };

  return (
    <div data-testid="content-tab" className="p-4 space-y-4 text-xs overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-[#D9D6CF] dark:border-[#272C34]">
        <div className="font-bold text-[#111217] dark:text-[#F5F7FA]">
          Content Slots: {selectedNode.semanticRole}
        </div>
        <span className="font-mono text-[10px] text-[#8B8F97]">ID: {selectedNode.id}</span>
      </div>

      {/* Editable Fields based on available props */}
      <div className="space-y-3">
        {/* Title / Heading Slot */}
        {('title' in props || selectedNode.semanticRole.includes('header') || selectedNode.semanticRole.includes('kpi')) && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-[#8B8F97] font-semibold">
              Title / Header Slot
            </label>
            <input
              type="text"
              value={String(props.title ?? '')}
              onChange={(e) => handlePropChange('title', e.target.value)}
              className="w-full rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] px-3 py-2 text-xs focus:ring-1 focus:ring-[#2547E8]"
            />
          </div>
        )}

        {/* Label Slot */}
        {('label' in props || selectedNode.semanticRole.includes('button')) && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-[#8B8F97] font-semibold">
              Action Label
            </label>
            <input
              type="text"
              value={String(props.label ?? '')}
              onChange={(e) => handlePropChange('label', e.target.value)}
              className="w-full rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] px-3 py-2 text-xs focus:ring-1 focus:ring-[#2547E8]"
            />
          </div>
        )}

        {/* Value Slot */}
        {('value' in props || selectedNode.semanticRole.includes('kpi') || selectedNode.semanticRole.includes('metric')) && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-[#8B8F97] font-semibold">
              Metric Value Display
            </label>
            <input
              type="text"
              value={String(props.value ?? '')}
              onChange={(e) => handlePropChange('value', e.target.value)}
              className="w-full rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] px-3 py-2 text-xs font-mono font-bold focus:ring-1 focus:ring-[#2547E8]"
            />
          </div>
        )}

        {/* Trend / Change Slot */}
        {('change' in props || selectedNode.semanticRole.includes('metric')) && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-[#8B8F97] font-semibold">
              Trend / Telemetry Delta
            </label>
            <input
              type="text"
              value={String(props.change ?? '')}
              onChange={(e) => handlePropChange('change', e.target.value)}
              className="w-full rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] px-3 py-2 text-xs focus:ring-1 focus:ring-[#2547E8]"
            />
          </div>
        )}

        {/* Variant */}
        {('variant' in props || selectedNode.semanticRole.includes('button')) && (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono text-[#8B8F97] font-semibold">
              Semantic Variant
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['primary', 'secondary', 'outline'].map((v) => (
                <button
                  key={v}
                  onClick={() => handlePropChange('variant', v)}
                  className={`py-1.5 rounded-lg border text-xs capitalize font-medium ${
                    props.variant === v
                      ? 'border-[#2547E8] bg-[#E7EBFF] dark:bg-[#1C2752] text-[#2547E8] dark:text-[#6782FF]'
                      : 'border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] text-[#62666F]'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
