import React from 'react';

export type RadialSpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RadialSpotlightProps {
  variant?: RadialSpotlightVariant;
}

export function RadialSpotlight({ variant = 'quiet' }: RadialSpotlightProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-white text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const coneColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.2)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.12)'
      : 'rgba(0, 0, 0, 0.05)';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col items-center justify-center text-center transition-colors ${cardBg}`}>
      {/* Top cone spotlight */}
      <div
        className="absolute top-0 inset-x-0 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 80% at 50% 0%, ${coneColor}, transparent 75%)`,
        }}
      />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Focal Hierarchy</span>
        <h4 className="text-base font-bold tracking-tight">Radial Top Spotlight</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Centered elliptical gradient cone casting focus downwards across critical headline copy.
        </p>
      </div>
    </div>
  );
}
