import React from 'react';

export type SoftMeshGradientVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SoftMeshGradientProps {
  variant?: SoftMeshGradientVariant;
}

export function SoftMeshGradient({ variant = 'quiet' }: SoftMeshGradientProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-white text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const meshOrbs =
    variant === 'nocturne'
      ? 'bg-gradient-to-tr from-cyan-950/40 via-indigo-950/40 to-transparent'
      : variant === 'expressive'
      ? 'bg-gradient-to-tr from-blue-100/60 via-purple-100/50 to-amber-50/40'
      : 'bg-gradient-to-tr from-neutral-100/80 via-neutral-50 to-transparent';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <div className={`absolute inset-0 ${meshOrbs} filter blur-3xl pointer-events-none`} />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Atmospheric Depth</span>
        <h4 className="text-base font-bold tracking-tight">Soft Mesh Gradient</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Multi-stop blurred gradient blending atmospheric chroma into clean editorial canvases.
        </p>
      </div>
    </div>
  );
}
