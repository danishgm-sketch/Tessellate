import React from 'react';

export type SubtleGridFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SubtleGridFieldProps {
  variant?: SubtleGridFieldVariant;
  children?: React.ReactNode;
}

export function SubtleGridField({ variant = 'quiet', children }: SubtleGridFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const gridStroke =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.12)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.08)'
      : 'rgba(0, 0, 0, 0.05)';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* Grid pattern SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern id={`grid-${variant}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke={gridStroke} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${variant})`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Architectural Surface</span>
        <h4 className="text-base font-bold tracking-tight">Subtle Grid Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Vector coordinate grid providing structural rhythm with zero client bundle overhead.
        </p>
        {children}
      </div>
    </div>
  );
}
