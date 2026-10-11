import React from 'react';

export type PaperTextureVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PaperTextureProps {
  variant?: PaperTextureVariant;
  children?: React.ReactNode;
}

export function PaperTexture({ variant = 'quiet', children }: PaperTextureProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#12141a] text-white border-[#2A2E39]'
      : variant === 'expressive'
      ? 'bg-[#F9F7F2] text-neutral-900 border-[#E5DFD3]'
      : 'bg-[#FCFBF9] text-neutral-900 border-[#EDE8E1]';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* SVG fibrous noise overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-multiply">
        <filter id={`paper-noise-${variant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#paper-noise-${variant})`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Tactile Substrate</span>
        <h4 className="text-base font-bold tracking-tight">Paper Texture</h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Cellulose paper stock simulation engineered for editorial typography and physical publication warmth.
        </p>
        {children}
      </div>
    </div>
  );
}
