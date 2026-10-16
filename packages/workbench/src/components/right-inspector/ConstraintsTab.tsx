import React from 'react';
import { useWorkbenchStore } from '../../store/workbench-store.js';
import { findNodeById } from '../../utils/tree-helpers.js';
import type { NodeLocks } from '@tessellate/schemas';
import { Lock, Unlock } from 'lucide-react';

export function ConstraintsTab() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const toggleNodeLock = useWorkbenchStore((state) => state.toggleNodeLock);
  const unlockAllNodeLocks = useWorkbenchStore((state) => state.unlockAllNodeLocks);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  const lockTypes: Array<{ key: keyof NodeLocks; label: string; desc: string }> = [
    { key: 'node', label: 'Lock Entire Node', desc: 'Prevents deletion, replacement, or moving.' },
    { key: 'structure', label: 'Lock Structure', desc: 'Preserves component layout hierarchy.' },
    { key: 'style', label: 'Lock Style', desc: 'Freezes local colors, radiuses, and typography.' },
    { key: 'content', label: 'Lock Content', desc: 'Locks text and data fixture content.' },
    { key: 'motion', label: 'Lock Motion', desc: 'Locks transition and animation settings.' },
    { key: 'dna', label: 'Lock Design DNA', desc: 'Protects DNA overrides during global re-composition.' },
  ];

  return (
    <div data-testid="constraints-tab" className="p-4 space-y-6 text-xs overflow-y-auto">
      {/* Node Level Locks */}
      {selectedNode ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#111217] dark:text-[#F5F7FA]">
              Node Locks: {selectedNode.semanticRole}
            </span>
            <button
              onClick={() => unlockAllNodeLocks(selectedNode.id)}
              className="text-[10px] text-[#2547E8] dark:text-[#879DFF] hover:underline"
            >
              Unlock All
            </button>
          </div>

          <div className="space-y-2">
            {lockTypes.map(({ key, label, desc }) => {
              const isLocked = Boolean(selectedNode.locks?.[key]);
              return (
                <button type="button" aria-pressed={isLocked} aria-label={label}
                  key={key}
                  onClick={() => toggleNodeLock(selectedNode.id, key)}
                  className={`w-full text-left flex items-start justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isLocked
                      ? 'border-amber-400 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-950/30'
                      : 'border-[#D9D6CF] bg-white dark:border-[#272C34] dark:bg-[#171B21] hover:border-neutral-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#111217] dark:text-[#F5F7FA] flex items-center gap-1.5">
                      {isLocked ? (
                        <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Unlock className="h-3 w-3 text-[var(--text-muted)]" />
                      )}
                      <span>{label}</span>
                    </div>
                    <div className="text-[10px] text-[#62666F] dark:text-[#A8AFBA]">{desc}</div>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      isLocked
                        ? 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-[#FAF9F6] text-[var(--text-muted)] dark:bg-[#0B0D10]'
                    }`}
                  >
                    {isLocked ? 'LOCKED' : 'FREE'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-[#D9D6CF] dark:border-[#272C34] text-center text-[var(--text-muted)]">
          Select a node to inspect and toggle local locks.
        </div>
      )}

      <div className="h-px bg-[#D9D6CF] dark:bg-[#272C34]" />

      {/* Global Project Constraints */}
      <div className="space-y-3">
        <span className="font-bold text-[#111217] dark:text-[#F5F7FA]">
          Project Quality Floors
        </span>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2.5">
            <span className="text-[#62666F] dark:text-[#A8AFBA]">Accessibility Floor</span>
            <span className="font-bold font-mono text-[#2547E8] dark:text-[#879DFF]">
              WCAG {manifest.constraints.accessibilityFloor}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2.5">
            <span className="text-[#62666F] dark:text-[#A8AFBA]">Performance Ceiling</span>
            <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 capitalize">
              {manifest.constraints.performanceCeiling}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#171B21] p-2.5">
            <span className="text-[#62666F] dark:text-[#A8AFBA]">Target Devices</span>
            <span className="font-bold font-mono text-[#111217] dark:text-[#F5F7FA]">
              {manifest.constraints.targetDevices.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
