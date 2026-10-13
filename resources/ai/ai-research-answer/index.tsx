import React from 'react';

export type AIResearchAnswerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIResearchAnswerProps {
  variant?: AIResearchAnswerVariant;
}

export function AIResearchAnswer({ variant = 'quiet' }: AIResearchAnswerProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const calloutBg =
    variant === 'nocturne'
      ? 'bg-cyan-950/40 border-cyan-800 text-cyan-200'
      : variant === 'expressive'
      ? 'bg-blue-50 border-blue-200 text-blue-900'
      : 'bg-neutral-50 border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Synthesis: Micro-frontend vs Monolith Export</h4>
          <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">Synthesized from 12 architectural repository documents</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
          Confidence: 98%
        </span>
      </div>

      <div className={`p-4 rounded-[var(--tess-radius-lg,8px)] border text-xs leading-relaxed ${calloutBg}`}>
        <span className="font-bold uppercase tracking-wider block mb-1 text-[10px]">Executive Summary</span>
        Tessellate adopts a zero-runtime standalone export model. Standalone projects compile cleanly to Vite + React without any Tessellate runtime SDK lock-in or micro-frontend container overhead.
      </div>

      <div className="space-y-2 text-xs text-[var(--tess-ink-secondary,#62666F)] dark:text-neutral-300 leading-relaxed">
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">1.</span>
          <span>Zero Lock-in: Component code exports as self-contained TypeScript and Tailwind files with no proprietary wrapper tags.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">2.</span>
          <span>Bundle Performance: Exported apps load in under 150ms with zero remote asset fetching.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-mono text-neutral-400 font-bold">3.</span>
          <span>Guest Independence: Full export and preview lifecycle works offline in IndexedDB.</span>
        </div>
      </div>
    </div>
  );
}
