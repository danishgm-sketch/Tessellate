import React, { useState, useEffect, useRef } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { findNodeById } from '../utils/tree-helpers.js';
import { executeQueuedCommand } from '../ai/queue-client.js';
import { Terminal, CornerDownLeft, Cpu } from 'lucide-react';

export function CommandBar() {
  const lastActionMessage = useWorkbenchStore((state) => state.lastActionMessage);
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const openReplaceDrawer = useWorkbenchStore((state) => state.openReplaceDrawer);
  const openCompare = useWorkbenchStore((state) => state.openCompare);
  const openBlend = useWorkbenchStore((state) => state.openBlend);
  const executeMutation = useWorkbenchStore((state) => state.executeMutation);

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queueStatus, setQueueStatus] = useState<{
    status: string;
    tokenNumber?: number;
    position?: number;
    message?: string;
  } | null>(null);
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

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd || isProcessing) return;

    setIsProcessing(true);
    try {
      const lower = cmd.toLowerCase();
      // Fast path for immediate modal UI actions
      if (lower.includes('replace') && selectedNode) {
        openReplaceDrawer();
        setFeedback(`Opened replacement candidates drawer for ${selectedNode.semanticRole}.`);
        setInputVal('');
        return;
      }
      if (lower === 'compare' || lower.includes('open compare')) {
        openCompare();
        setFeedback(`Opened Compare mode.`);
        setInputVal('');
        return;
      }
      if (lower === 'blend' || lower.includes('open blend')) {
        openBlend();
        setFeedback(`Opened Blend mode.`);
        setInputVal('');
        return;
      }

      // Execute via Bespoke Host Queue or Deterministic Fallback
      const result = await executeQueuedCommand(
        manifest,
        activeScreenId,
        cmd,
        (progress) => {
          setQueueStatus(progress);
        }
      );

      if (result.success) {
        for (const mut of result.mutations) {
          executeMutation(mut);
        }
        setFeedback(result.explanation);
        setInputVal('');
      } else {
        setFeedback(result.error || 'Command execution failed.');
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Command execution failed.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setFeedback(null);
        setQueueStatus(null);
      }, 5000);
    }
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

        {/* Live Queue Token Badge */}
        {queueStatus?.tokenNumber && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-mono shrink-0 animate-pulse">
            <Cpu className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-semibold">Token #{queueStatus.tokenNumber}</span>
            {typeof queueStatus.position === 'number' && queueStatus.position > 0 && (
              <span className="text-[10px] text-indigo-500">(Pos: {queueStatus.position})</span>
            )}
          </div>
        )}

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
        {queueStatus?.message && !feedback ? (
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
            {queueStatus.message}
          </span>
        ) : feedback || lastActionMessage ? (
          <span className="text-[#2547E8] dark:text-[#6782FF] font-semibold animate-fade-in">
            {feedback ?? lastActionMessage}
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
