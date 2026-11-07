import React from 'react';

export type ConnectionLostStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ConnectionLostStateProps {
  onRetry?: () => void;
  variant?: ConnectionLostStateVariant;
  children?: React.ReactNode;
}

export function ConnectionLostState({
  onRetry,
  variant = 'quiet',
  children,
}: ConnectionLostStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-red-50/50 text-red-950 border-red-200'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-red-400 bg-red-950/40 border-red-800'
      : variant === 'expressive'
      ? 'text-red-700 bg-red-100 border-red-300'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div
      role="alert"
      className={`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto flex items-start gap-4 transition-colors ${containerBg}`}
    >
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-lg ${badgeColor}`}>
        ⚡
      </div>

      <div className="space-y-2 grow">
        <h4 className="text-base font-bold tracking-tight">
          Telemetry Connection Dropped
        </h4>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-md">
          {onRetry
            ? 'The connection was interrupted. Use the retry action to ask your host application to reconnect.'
            : 'This preview cannot reconnect on its own. Connection recovery is controlled by the host application.'}
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onRetry}
            disabled={!onRetry}
            aria-describedby={!onRetry ? 'connection-retry-help' : undefined}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {onRetry ? 'Reconnect Now' : 'Reconnect unavailable'}
          </button>
        </div>
        {!onRetry && (
          <p id="connection-retry-help" role="note" className="text-xs text-neutral-500">
            Automatic recovery is controlled by the host application.
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
