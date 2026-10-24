import React, { useId, useState } from 'react';

export type AIPromptComposerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIPromptComposerProps {
  variant?: AIPromptComposerVariant;
  onExecute?: (prompt: string, attachedFiles: string[]) => void;
}

export function AIPromptComposer({ variant = 'quiet', onExecute }: AIPromptComposerProps) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState(['tokens.css', 'workbench.ts']);
  const executeHelpId = useId();

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const removeFile = (f: string) => {
    setAttachedFiles(attachedFiles.filter((item) => item !== f));
  };

  const estimatedTokens = Math.round(text.length / 4) + attachedFiles.length * 120;

  return (
    <div
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`w-full p-5 rounded-[var(--tess-radius-xl,8px)] border flex flex-col gap-3 transition-colors ${cardBg}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800 text-xs">
        <span className="font-semibold">Prompt Studio</span>
        <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
          <span>Context: {attachedFiles.length} files</span>
          <span>~{estimatedTokens} tokens</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 py-1">
        {attachedFiles.map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--tess-radius-md,8px)] text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            <span>📄 {f}</span>
            <button onClick={() => removeFile(f)} className="hover:text-rose-500">×</button>
          </span>
        ))}
        <button
          onClick={() => setAttachedFiles([...attachedFiles, 'spec.md'])}
          className="text-xs px-2 py-1 rounded border border-dashed border-neutral-300 dark:border-neutral-700 text-[var(--tess-ink-muted,#62666F)] hover:border-neutral-400"
        >
          + Add Context
        </button>
      </div>

      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Compose task instructions... E.g. 'Refactor the TimeSeriesChart to support Nocturne glowing fills while preserving AA contrast.'"
        className="w-full text-xs p-3 rounded-[var(--tess-radius-lg,8px)] border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 leading-relaxed resize-none"
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-neutral-400">Shift + Enter for newline</span>
        <button
          type="button"
          onClick={() => onExecute?.(text, attachedFiles)}
          disabled={!onExecute}
          aria-describedby={!onExecute ? executeHelpId : undefined}
          className="px-4 py-2 text-xs font-medium rounded-[var(--tess-radius-lg,8px)] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Execute Prompt
        </button>
      </div>
      {!onExecute && <span id={executeHelpId} className="sr-only">Connect a provider action before executing this prompt.</span>}
    </div>
  );
}
