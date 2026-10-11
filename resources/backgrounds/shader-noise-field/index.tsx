import React from 'react';

export type ShaderNoiseFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ShaderNoiseFieldProps {
  variant?: ShaderNoiseFieldVariant;
  children?: React.ReactNode;
}

export function ShaderNoiseField({ variant = 'quiet', children }: ShaderNoiseFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
        <filter id={`perlin-noise-${variant}`}>
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="turbulence" />
          <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="20" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" filter={`url(#perlin-noise-${variant})`} />
        <circle cx="50%" cy="50%" r="25%" fill="none" stroke="currentColor" strokeWidth="1" filter={`url(#perlin-noise-${variant})`} />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Procedural Terrain</span>
        <h4 className="text-base font-bold tracking-tight">Shader Noise Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Multi-octave procedural turbulence contours generating unique topographic elevation gradients.
        </p>
        {children}
      </div>
    </div>
  );
}
