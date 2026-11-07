import React from 'react';

export type AIEmptyStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIEmptyStateProps {
  variant?: AIEmptyStateVariant;
  onSelectPrompt?: (p: string) => void;
}

export function AIEmptyState({ variant = 'quiet', onSelectPrompt }: AIEmptyStateProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const starters = [
    { title: 'Compose B2B SaaS Dashboard', prompt: 'Create an analytics dashboard with KPI delta card, time series line chart, and audit log block.' },
    { title: 'Review color contrast', prompt: 'Compare these selected color pairs against common contrast thresholds and explain what was checked.' },
    { title: 'Export Standalone Vite App', prompt: 'Export workspace to a pure Vite + React + Tailwind 4 source tree.' },
  ];

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col items-center text-center gap-6 transition-colors ${cardBg}`}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-neutral-100 dark:bg-neutral-800">
        ✦
      </div>

      <div className="max-w-md space-y-1.5">
        <h4 className="text-base font-semibold tracking-tight">How can Tessellate assist your build?</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Select a starter prompt to continue. The host application decides how selected text is handled.
        </p>
      </div>

      {!onSelectPrompt && (
        <p className="text-xs text-neutral-500">Connect a prompt handler to enable these starters.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl text-left">
        {starters.map((s) => (
          <button
            key={s.title}
            type="button"
            disabled={!onSelectPrompt}
            onClick={() => onSelectPrompt?.(s.prompt)}
            className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current transition-colors flex flex-col justify-between text-left"
          >
            <div className="text-xs font-semibold mb-1 text-neutral-800 dark:text-neutral-200">{s.title}</div>
            <div className="text-[11px] text-neutral-500 leading-snug">{s.prompt}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
