import React from 'react';

export type AuroraFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AuroraFieldProps {
  variant?: AuroraFieldVariant;
}

export function AuroraField({ variant = 'quiet' }: AuroraFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-900 text-white border-neutral-800'
      : 'bg-white text-neutral-900 border-neutral-200';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* Animated aurora waves */}
      <div className="absolute inset-0 opacity-40 pointer-events-none filter blur-2xl flex">
        <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 transform -rotate-12 scale-125" />
        <div className="w-1/2 h-full bg-gradient-to-r from-cyan-500/30 to-purple-500/30 transform rotate-12 scale-125" />
      </div>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Cyber Luminescence</span>
        <h4 className="text-base font-bold tracking-tight">Aurora Wave Field</h4>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Dual chromatic ribbon fields crossing with soft blur to simulate undulating northern lights.
        </p>
      </div>
    </div>
  );
}
