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
  const recomposeScreenAroundLocks = useWorkbenchStore((state) => state.recomposeScreenAroundLocks);
  const surpriseMe = useWorkbenchStore((state) => state.surpriseMe);
  const openReplaceDrawer = useWorkbenchStore((state) => state.openReplaceDrawer);
  const openCompare = useWorkbenchStore((state) => state.openCompare);
  const openBlend = useWorkbenchStore((state) => state.openBlend);

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

    if (cmd.includes('recompose') || cmd.includes('rethink structure') || cmd.includes('rethink')) {
      recomposeScreenAroundLocks(activeScreenId);
      setFeedback(`Recomposed screen around locked nodes.`);
    } else if (cmd.includes('surprise') || cmd.includes('surprise me')) {
      surpriseMe();
      setFeedback(`Executed Surprise Me: controlled divergence applied.`);
    } else if (cmd.includes('replace') && selectedNode) {
      openReplaceDrawer();
      setFeedback(`Opened replacement candidates drawer for ${selectedNode.semanticRole}.`);
    } else if (cmd.includes('compare')) {
      openCompare();
      setFeedback(`Opened Compare mode.`);
    } else if (cmd.includes('blend')) {
      openBlend();
      setFeedback(`Opened Blend mode.`);
    } else if (cmd.includes('reduce motion') || cmd.includes('less motion')) {
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
                ? `Tell Tess what to change on ${selectedNode.semanticRole}… (e.g. recompose, replace, lock, reduce motion)`
                : 'Tell Tess what to change… (e.g. recompose, surprise me, compare, blend, reduce motion)'
            }
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] rounded-xl px-3.5 py-2 text-xs text-[#111217] dark:text-[#F5F7FA] placeholder-[#8B8F97] focus:outline-none focus:border-[#2547E8] dark:focus:border-[#6782FF] transition-colors pr-10 font-sans"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B8F97] hover:text-[#111217] dark:hover:text-[#F5F7FA] transition-colors"
            title="Execute command (Enter)"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Feedback or Keyboard Shortcuts Hint */}
      <div className="hidden md:flex items-center gap-3 text-[11px] text-[#62666F] dark:text-[#A8AFBA] font-mono">
        {feedback ? (
          <span className="text-[#2547E8] dark:text-[#6782FF] font-semibold animate-fade-in">
            {feedback}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[10px]">Esc</kbd> climb parent</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[10px]">/</kbd> command</span>
          </div>
        )}
      </div>
    </div>
  );
}
