import React from 'react';

export type LoadingOrbitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LoadingOrbitProps {
  variant?: LoadingOrbitVariant;
}

export function LoadingOrbit({ variant = 'quiet' }: LoadingOrbitProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const dotColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col items-center justify-center gap-4 transition-colors ${cardBg}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-12 h-12 animate-spin motion-reduce:animate-none" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke={dotColor}
            strokeWidth="2.5"
            strokeDasharray="25 80"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="text-center">
        <span className="text-xs font-mono font-medium text-neutral-400">Synthesizing System...</span>
      </div>
    </div>
  );
}
