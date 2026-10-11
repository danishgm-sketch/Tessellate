import React from 'react';

export type EditorialGrainVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialGrainProps {
  variant?: EditorialGrainVariant;
}

export function EditorialGrain({ variant = 'quiet' }: EditorialGrainProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-[#FBF9F5] text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* SVG feTurbulence grain */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 mix-blend-overlay">
        <filter id="grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Analog Tactility</span>
        <h4 className="text-base font-bold tracking-tight">Editorial Film Grain</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Procedural SVG fractal noise filter evoking physical print paper and film grain tactility.
        </p>
      </div>
    </div>
  );
}
