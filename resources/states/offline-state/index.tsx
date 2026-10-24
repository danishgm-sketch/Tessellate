import React from 'react';

export type OfflineStateVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OfflineStateProps {
  variant?: OfflineStateVariant;
  children?: React.ReactNode;
}

export function OfflineState({ variant = 'quiet', children }: OfflineStateProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-amber-50/60 text-amber-950 border-amber-200'
      : 'bg-neutral-50 text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-amber-400 bg-amber-950/40 border-amber-800'
      : variant === 'expressive'
      ? 'text-amber-800 bg-amber-100 border-amber-300'
      : 'text-neutral-700 bg-neutral-200 border-neutral-300';

  return (
    <div
      role="alert"
      className={`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto flex items-start gap-4 transition-colors ${containerBg}`}
    >
      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-lg ${badgeColor}`}>
        📡
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold tracking-tight">
          You're offline
        </h4>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-lg">
          Local changes are available only if the host app has saved them. This example does not configure remote synchronization.
        </p>
      </div>

      {children}
    </div>
  );
}
