import React from 'react';

export type TopographicLinesVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TopographicLinesProps {
  variant?: TopographicLinesVariant;
}

export function TopographicLines({ variant = 'quiet' }: TopographicLinesProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const strokeColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.2)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.12)'
      : 'rgba(0, 0, 0, 0.08)';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 600 300">
        <path d="M 0 60 Q 150 120 300 40 T 600 80" fill="none" stroke={strokeColor} strokeWidth="1" />
        <path d="M 0 110 Q 180 180 340 90 T 600 130" fill="none" stroke={strokeColor} strokeWidth="1" />
        <path d="M 0 160 Q 210 240 380 140 T 600 180" fill="none" stroke={strokeColor} strokeWidth="1" />
        <path d="M 0 210 Q 240 300 420 190 T 600 230" fill="none" stroke={strokeColor} strokeWidth="1" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Cartographic Contours</span>
        <h4 className="text-base font-bold tracking-tight">Topographic Isolines</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Vector elevation lines undulating across the canvas evoking cartographic maps and terrain contours.
        </p>
      </div>
    </div>
  );
}
