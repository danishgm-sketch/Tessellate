import React from 'react';

export type DotMatrixFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DotMatrixFieldProps {
  variant?: DotMatrixFieldVariant;
  children?: React.ReactNode;
}

export function DotMatrixField({ variant = 'quiet', children }: DotMatrixFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotFill =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.25)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.18)'
      : 'rgba(0, 0, 0, 0.12)';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id={`dots-${variant}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={dotFill} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${variant})`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Technical Pattern</span>
        <h4 className="text-base font-bold tracking-tight">Dot Matrix Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Geometric 24px-spaced point matrix lending tactile engineering presence to interface surfaces.
        </p>
        {children}
      </div>
    </div>
  );
}
