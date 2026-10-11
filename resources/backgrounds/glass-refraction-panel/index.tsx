import React from 'react';

export type GlassRefractionPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GlassRefractionPanelProps {
  variant?: GlassRefractionPanelVariant;
  children?: React.ReactNode;
}

export function GlassRefractionPanel({ variant = 'quiet', children }: GlassRefractionPanelProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10]/70 backdrop-blur-md text-white border-white/10 shadow-xl'
      : variant === 'expressive'
      ? 'bg-white/60 backdrop-blur-md text-neutral-900 border-indigo-200/50 shadow-lg'
      : 'bg-white/70 backdrop-blur-md text-neutral-900 border-neutral-200/60 shadow-sm';

  return (
    <div className="relative w-full p-8 min-h-[260px] flex items-center justify-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-xl overflow-hidden">
      <div className={`relative w-full max-w-md p-6 rounded-xl border transition-all ${cardBg}`}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Optical Substrate</span>
        <h4 className="text-base font-bold tracking-tight mt-1">Glass Refraction Panel</h4>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
          Frosted acrylic panel with hairline specular borders and depth blur for spatial interface layering.
        </p>
        {children}
      </div>
    </div>
  );
}
