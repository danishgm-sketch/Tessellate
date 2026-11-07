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
  title = 'Completed',
  message = 'Your action finished. Review its output before using it.',
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
  const titleColor = variant === 'nocturne' ? 'text-emerald-300' : 'text-[#12603F]';
  const actionColor = variant === 'nocturne'
    ? 'bg-emerald-700 hover:bg-emerald-800'
    : 'bg-[#12603F] hover:bg-[#0F5138]';
  const disabledActionColor = variant === 'nocturne'
    ? 'disabled:bg-neutral-700 disabled:text-neutral-200'
    : 'disabled:bg-neutral-200 disabled:text-neutral-600';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto text-center space-y-4 transition-colors ${containerBg}`}>
      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center border text-xl ${badgeColor}`}>
        ✓
      </div>

      <div className="space-y-1" role="status" aria-live="polite">
        <h3 className={`text-lg font-bold tracking-tight ${titleColor}`}>
          {title}
        </h3>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={onViewArtifact}
          disabled={!onViewArtifact}
          aria-describedby={!onViewArtifact ? 'success-state-action-note' : undefined}
          className={`px-4 py-2 text-xs font-semibold rounded-lg text-white ${actionColor} ${disabledActionColor} disabled:cursor-not-allowed`}
        >
          View Exported Files
        </button>
        {!onViewArtifact && (
          <p id="success-state-action-note" className="text-xs text-neutral-600 dark:text-neutral-300">
            Connect an artifact viewer to enable this action.
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
