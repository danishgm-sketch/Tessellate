import React, { useState, useEffect, useRef } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { findNodeById } from '../utils/tree-helpers.js';
import { executeQueuedCommand, type QueueProgress } from '../ai/queue-client.js';
import { Terminal, CornerDownLeft, Cpu } from 'lucide-react';

export function CommandBar() {
  const manifest = useWorkbenchStore((state) => state.manifest);
  const activeScreenId = useWorkbenchStore((state) => state.activeScreenId);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const openReplaceDrawer = useWorkbenchStore((state) => state.openReplaceDrawer);
  const openCompare = useWorkbenchStore((state) => state.openCompare);
  const openBlend = useWorkbenchStore((state) => state.openBlend);
  const executeMutation = useWorkbenchStore((state) => state.executeMutation);

  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueProgress | null>(null);
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
    setFeedback(null);
    try {
      const lower = cmd.toLowerCase();
      // Exact UI commands open panels directly; everything else goes to the host daemon (D-033).
      if (lower === 'replace' && selectedNode) {
        openReplaceDrawer();
        setFeedback({ tone: 'success', text: `Opened replacement candidates for ${selectedNode.semanticRole}.` });
        setInputVal('');
        return;
      }
      if (lower === 'compare') {
        openCompare();
        setFeedback({ tone: 'success', text: 'Opened Compare mode.' });
        setInputVal('');
        return;
      }
      if (lower === 'blend') {
        openBlend();
        setFeedback({ tone: 'success', text: 'Opened Blend mode.' });
        setInputVal('');
        return;
      }

      const result = await executeQueuedCommand(manifest, activeScreenId, cmd, setQueueStatus);

      if (result.success) {
        for (const mut of result.mutations) {
          executeMutation(mut);
        }
        setFeedback({ tone: 'success', text: result.explanation });
        setInputVal('');
      } else {
        // Keep the prompt so the user can rephrase; nothing was applied.
        setFeedback({ tone: 'error', text: result.error || 'The command could not be completed. Nothing was changed.' });
      }
    } catch (err) {
      setFeedback({ tone: 'error', text: err instanceof Error ? err.message : 'The command could not be completed.' });
    } finally {
      setIsProcessing(false);
      setQueueStatus(null);
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
                ? `Tell Tessellate what to change on ${selectedNode.semanticRole}… (e.g. lock this, make it calmer, replace)`
                : 'Tell Tessellate what to change… (e.g. make it calmer, surprise me, compare, blend)'
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

      {/* Status / feedback: visible at every width and announced to assistive technology */}
      <div
        data-testid="command-feedback"
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 text-[11px] text-[#62666F] dark:text-[#A8AFBA] max-w-[45%] ml-3"
      >
        {queueStatus ? (
          <span className={queueStatus.status === 'offline' ? 'text-[#A66A15] font-medium' : 'text-[#2547E8] dark:text-[#6782FF] font-medium'}>
            {queueStatus.message}
            {queueStatus.estimatedWaitSeconds ? ` · about ${queueStatus.estimatedWaitSeconds}s` : ''}
          </span>
        ) : feedback ? (
          <span
            data-tone={feedback.tone}
            className={feedback.tone === 'error' ? 'text-[#C83D48] dark:text-[#FF8A93] font-semibold' : 'text-[#177B55] dark:text-[#5BD6A4] font-semibold'}
          >
            {feedback.text}
          </span>
        ) : (
          <div className="hidden md:flex items-center gap-2 font-mono">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[10px]">Esc</kbd> to select the parent</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] text-[10px]">/</kbd> command</span>
          </div>
        )}
      </div>
    </div>
  );
}
