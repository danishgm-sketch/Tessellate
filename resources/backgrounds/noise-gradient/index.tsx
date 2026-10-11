import React from 'react';

export type NoiseGradientVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NoiseGradientProps {
  variant?: NoiseGradientVariant;
}

export function NoiseGradient({ variant = 'quiet' }: NoiseGradientProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-gradient-to-b from-blue-50/70 to-white text-neutral-900 border-[#D9D6CF]'
      : 'bg-gradient-to-b from-neutral-50 to-white text-neutral-900 border-neutral-200';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Dithered Texture</span>
        <h4 className="text-base font-bold tracking-tight">Noise-Diffused Gradient</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Smooth continuous tone graduation without digital quantization artifacts or color banding.
        </p>
      </div>
    </div>
  );
}
