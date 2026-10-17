import React from 'react';

export type ErrorStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ErrorStateProps {
  title?: string;
  errorMessage?: string;
  codeSnippet?: string;
  onRetry?: () => void;
  variant?: ErrorStateVariant;
  children?: React.ReactNode;
}

export function ErrorState({
  title = 'Manifest Compilation Fault',
  errorMessage = 'Resource dependency schema validation failed: missing required property "layoutDNA.density".',
  codeSnippet = 'Error: [ZodError] layoutDNA: density is required',
  onRetry,
  variant = 'quiet',
  children,
}: ErrorStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-red-900/60'
      : variant === 'expressive'
      ? 'bg-red-50/50 text-neutral-900 border-red-200'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-red-400 bg-red-950/40 border-red-800'
      : variant === 'expressive'
      ? 'text-red-700 bg-red-100 border-red-300'
      : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div
      role="alert"
      className={`p-6 @md:p-8 rounded-[var(--tess-radius-xl,8px)] border max-w-4xl mx-auto space-y-4 transition-colors ${containerBg}`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-[var(--tess-radius-xl,8px)] flex items-center justify-center border font-bold text-lg ${badgeColor}`}>
          ⚠️
        </span>
        <div>
          <h3 className="text-base font-bold tracking-tight text-red-700 dark:text-red-400">
            {title}
          </h3>
          <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">{errorMessage}</p>
        </div>
      </div>

      {codeSnippet && (
        <pre className="p-3 rounded-[var(--tess-radius-lg,8px)] bg-neutral-950 text-neutral-300 text-xs font-mono overflow-x-auto">
          {codeSnippet}
        </pre>
      )}

      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          disabled={!onRetry}
          aria-describedby={!onRetry ? 'error-state-retry-help' : undefined}
          className="px-4 py-2 text-xs font-semibold rounded-[var(--tess-radius-lg,8px)] bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Retry Operation
        </button>
        {!onRetry && <span id="error-state-retry-help" className="sr-only">Retry is unavailable until the operation is connected.</span>}
      </div>

      {children}
    </div>
  );
}
