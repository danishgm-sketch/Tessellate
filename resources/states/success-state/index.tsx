import React from 'react';

export type SuccessStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SuccessStateProps {
  title?: string;
  message?: string;
  onViewArtifact?: () => void;
  variant?: SuccessStateVariant;
  children?: React.ReactNode;
}

export function SuccessState({
  title = 'System Export Completed Successfully',
  message = '11 production-ready Vite + React TypeScript files generated with zero external lock-in.',
  onViewArtifact,
  variant = 'quiet',
  children,
}: SuccessStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-emerald-900/50'
      : variant === 'expressive'
      ? 'bg-emerald-50/50 text-neutral-900 border-emerald-200'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800'
      : variant === 'expressive'
      ? 'text-emerald-700 bg-emerald-100 border-emerald-300'
      : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors ${containerBg}`}>
      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl ${badgeColor}`}>
        ✓
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={onViewArtifact}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          View Exported Files
        </button>
      </div>

      {children}
    </div>
  );
}
