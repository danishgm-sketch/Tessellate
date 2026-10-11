import React from 'react';

export type BeamGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BeamGridProps {
  variant?: BeamGridVariant;
  children?: React.ReactNode;
}

export function BeamGrid({ variant = 'quiet', children }: BeamGridProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const beamGradient =
    variant === 'nocturne'
      ? 'from-transparent via-cyan-400 to-transparent'
      : variant === 'expressive'
      ? 'from-transparent via-indigo-500 to-transparent'
      : 'from-transparent via-neutral-400 to-transparent';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* Grid base */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Traveling beam lines */}
      <div className="absolute inset-x-0 top-1/4 h-[1px] pointer-events-none overflow-hidden">
        <div className={`w-48 h-full bg-gradient-to-r ${beamGradient} animate-pulse blur-[1px]`} style={{ transform: 'translateX(30%)' }} />
      </div>
      <div className="absolute inset-y-0 left-1/3 w-[1px] pointer-events-none overflow-hidden">
        <div className={`w-full h-48 bg-gradient-to-b ${beamGradient} animate-pulse blur-[1px]`} style={{ transform: 'translateY(20%)' }} />
      </div>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Optical Infrastructure</span>
        <h4 className="text-base font-bold tracking-tight">Beam Grid</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Orthogonal coordinate network featuring directional traveling light energy along telemetry lines.
        </p>
        {children}
      </div>
    </div>
  );
}
