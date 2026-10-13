import React, { useState, useEffect, useRef } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { findNodeById } from '../utils/tree-helpers.js';
import { executeNaturalLanguageCommand } from '../ai/ai-service.js';
import { Terminal, CornerDownLeft } from 'lucide-react';

export function CommandBar() {
  const lastActionMessage=useWorkbenchStore(state=>state.lastActionMessage);
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

      // Execute via AI / deterministic planner
      const result = await executeNaturalLanguageCommand(manifest, activeScreenId, cmd);

      if (result.success) {
        for (const mut of result.mutations) {
          executeMutation(mut);
        }
        setFeedback(result.explanation || `Executed: ${result.command.summary}`);
        setInputVal('');
      } else {
        setFeedback(result.error);
        // Preserves inputVal on error so the user doesn't lose their prompt
      }
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Command execution failed.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div
      data-testid="command-bar"
      className="dark min-h-16 py-2 gap-2 flex-wrap shrink-0 border-t border-[#D9D6CF] dark:border-[#272C34] bg-white dark:bg-[#0B0D10] px-4 flex items-center justify-between select-none z-20"
    >
      <form onSubmit={handleExecute} className="flex-1 max-w-4xl flex items-center gap-3">
        {/* Target Context Pill */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#FAF9F6] dark:bg-[#171B21] border border-[#D9D6CF] dark:border-[#272C34] px-2.5 py-1 text-xs font-mono text-[#62666F] dark:text-[#A8AFBA] shrink-0">
          <Terminal className="h-3.5 w-3.5 text-[#2547E8] dark:text-[#879DFF]" />
          <span>
            {selectedNode ? selectedNode.semanticRole : 'Project Scope'}
          </span>
        </div>

        {/* Command Input Field */}
        <div className="relative flex-1">
          <input
            aria-label="Project command" ref={inputRef}
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
            aria-label="Run command" type="submit"
            className="min-h-6 min-w-6 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[#111217] dark:hover:text-[#F5F7FA] transition-colors"
            title="Execute command (Enter)"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Feedback or Keyboard Shortcuts Hint */}
      <div className="flex flex-wrap items-center gap-3 max-w-full text-[11px] text-[#62666F] dark:text-[#A8AFBA] font-mono">
        {feedback || lastActionMessage ? (
          <span role="status" className="text-[#2547E8] dark:text-[#879DFF] font-semibold animate-fade-in">
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
