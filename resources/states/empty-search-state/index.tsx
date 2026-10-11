import React from 'react';

export type EmptySearchStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptySearchStateProps {
  query?: string;
  onClear?: () => void;
  variant?: EmptySearchStateVariant;
  children?: React.ReactNode;
}

export function EmptySearchState({
  query = 'hyper-kinetic-3d-portal',
  onClear,
  variant = 'quiet',
  children,
}: EmptySearchStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const iconColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-500 bg-neutral-100 border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors ${containerBg}`}>
      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl ${iconColor}`}>
        🔍
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight">
          No matches found for &ldquo;{query}&rdquo;
        </h3>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
          Check for typographical errors, broaden your keywords, or clear active category filters.
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onClear}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
        >
          Clear Search Query
        </button>
      </div>

      {children}
    </div>
  );
}
