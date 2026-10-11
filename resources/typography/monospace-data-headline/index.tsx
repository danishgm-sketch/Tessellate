import React from 'react';

export type MonospaceDataHeadlineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MonospaceDataHeadlineProps {
  systemTag?: string;
  commandText?: string;
  statusBadge?: string;
  variant?: MonospaceDataHeadlineVariant;
  children?: React.ReactNode;
}

export function MonospaceDataHeadline({
  systemTag = '[SYS.CORE :: 0x88F2]',
  commandText = 'tess compose --archetype=saas --strict',
  statusBadge = '200 OK • VERIFIED',
  variant = 'quiet',
  children,
}: MonospaceDataHeadlineProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const promptSymbol =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-400';

  const badgeClass =
    variant === 'nocturne'
      ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800'
      : variant === 'expressive'
      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
      : 'bg-neutral-100 text-neutral-700 border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 font-mono transition-colors ${containerBg}`}>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{systemTag}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
          {statusBadge}
        </span>
      </div>

      <div className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
        <span className={promptSymbol}>$</span>
        <span>{commandText}</span>
        <span className={`w-2.5 h-6 animate-pulse ${variant === 'nocturne' ? 'bg-cyan-400' : 'bg-neutral-800 dark:bg-neutral-200'}`} />
      </div>

      <p className="text-xs text-neutral-500 font-sans leading-relaxed">
        Terminal-grade display typography grounded in monospaced coordinate syntax.
      </p>
      {children}
    </div>
  );
}
