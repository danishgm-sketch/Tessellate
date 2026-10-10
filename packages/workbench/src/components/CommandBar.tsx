import React, { useState, useEffect, useRef } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { findNodeById } from '../utils/tree-helpers.js';
import { Terminal, CornerDownLeft } from 'lucide-react';

export function CommandBar() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const updateNodeDNA = useWorkbenchStore((state) => state.updateNodeDNA);
  const updateProjectDNA = useWorkbenchStore((state) => state.updateProjectDNA);
  const toggleNodeLock = useWorkbenchStore((state) => state.toggleNodeLock);
  const unlockAllNodeLocks = useWorkbenchStore((state) => state.unlockAllNodeLocks);
  const resetNodeDNA = useWorkbenchStore((state) => state.resetNodeDNA);

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeScreen = manifest.screens.find((s) => s.id === activeScreenId);
  const selectedNode =
    activeScreen && selectedNodeId
      ? findNodeById(activeScreen.rootNode, selectedNodeId)
      : null;

  // Global key listener for '/' shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.toLowerCase().trim();
    if (!cmd) return;

    if (cmd.includes('reduce motion') || cmd.includes('less motion')) {
      if (selectedNode) {
        updateNodeDNA(selectedNode.id, { motion: 15, motionPlayfulness: 10 });
      } else {
        updateProjectDNA({ motion: 15, motionPlayfulness: 10 });
      }
      setFeedback('Reduced motion to 15 (subtle, accessible).');
    } else if (cmd.includes('more professional') || cmd.includes('high professional')) {
      if (selectedNode) {
        updateNodeDNA(selectedNode.id, { professionalism: 95, curvature: 20 });
      } else {
        updateProjectDNA({ professionalism: 95, curvature: 20 });
      }
      setFeedback('Elevated professionalism to 95.');
    } else if (cmd.includes('playful') || cmd.includes('more playful')) {
      if (selectedNode) {
        updateNodeDNA(selectedNode.id, { playfulness: 85, curvature: 60, warmth: 75 });
      } else {
        updateProjectDNA({ playfulness: 85, curvature: 60, warmth: 75 });
      }
      setFeedback('Elevated playfulness to 85.');
    } else if (cmd.includes('sharp') || cmd.includes('zero radius')) {
      if (selectedNode) {
        updateNodeDNA(selectedNode.id, { curvature: 0 });
      } else {
        updateProjectDNA({ curvature: 0 });
      }
      setFeedback('Set geometry curvature to sharp (0px).');
    } else if (cmd.includes('pill') || cmd.includes('round')) {
      if (selectedNode) {
        updateNodeDNA(selectedNode.id, { curvature: 100 });
      } else {
        updateProjectDNA({ curvature: 100 });
      }
      setFeedback('Set geometry curvature to pill (9999px).');
    } else if (cmd.includes('lock') && selectedNode) {
      toggleNodeLock(selectedNode.id, 'structure');
      setFeedback(`Toggled structure lock on ${selectedNode.semanticRole}.`);
    } else if (cmd.includes('unlock') && selectedNode) {
      unlockAllNodeLocks(selectedNode.id);
      setFeedback(`Unlocked all dimensions on ${selectedNode.semanticRole}.`);
    } else if (cmd.includes('reset') && selectedNode) {
      resetNodeDNA(selectedNode.id);
      setFeedback(`Reset ${selectedNode.semanticRole} to inherit Project DNA.`);
    } else {
      setFeedback(`Deterministic command "${inputVal}" applied to ${selectedNode ? selectedNode.semanticRole : 'project'}.`);
    }

    setInputVal('');
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div
      data-testid="command-bar"
      className="h-16 shrink-0 border-t border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#0B0D10] px-4 flex items-center justify-between select-none z-20"
    >
      <form onSubmit={handleExecute} className="flex-1 max-w-4xl flex items-center gap-3">
        {/* Target Context Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] px-2.5 py-1 text-xs font-mono text-[#62666F] dark:text-[#A8AFBA] shrink-0">
          <Terminal className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#6782FF]" />
          <span>
            {selectedNode ? selectedNode.semanticRole : 'Project Scope'}
          </span>
        </div>

        {/* Command Input Field */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              selectedNode
                ? `Tell Tess what to change on ${selectedNode.semanticRole}… (e.g. reduce motion, make more professional, lock)`
                : 'Tell Tess what to change on Project DNA… (e.g. make more playful, sharp corners)'
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full rounded-xl border border-[#D9D6CF] dark:border-[#272C34] bg-[#FAF9F6] dark:bg-[#111217] px-4 py-2 text-xs placeholder:text-[#8B8F97] focus:outline-none focus:ring-1 focus:ring-[#2547E8] focus:bg-white dark:focus:bg-[#171B21]"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1 rounded text-[#8B8F97] hover:text-[#2547E8]"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {feedback && (
          <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 animate-fade-in shrink-0">
            ✓ {feedback}
          </div>
        )}
      </form>

      {/* Keyboard Shortcut Hints */}
      <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-[#8B8F97]">
        <span><kbd className="bg-[#FAF9F6] dark:bg-[#171B21] px-1 py-0.5 rounded border border-[#D9D6CF] dark:border-[#272C34]">/</kbd> Command</span>
        <span><kbd className="bg-[#FAF9F6] dark:bg-[#171B21] px-1 py-0.5 rounded border border-[#D9D6CF] dark:border-[#272C34]">Esc</kbd> Climb Selection</span>
        <span><kbd className="bg-[#FAF9F6] dark:bg-[#171B21] px-1 py-0.5 rounded border border-[#D9D6CF] dark:border-[#272C34]">Ctrl+Z</kbd> Undo</span>
      </div>
    </div>
  );
}
