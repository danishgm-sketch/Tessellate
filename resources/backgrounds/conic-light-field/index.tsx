import React from 'react';

export type ConicLightFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ConicLightFieldProps {
  variant?: ConicLightFieldVariant;
  children?: React.ReactNode;
}

export function ConicLightField({ variant = 'quiet', children }: ConicLightFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const conicStyle: React.CSSProperties = {
    background:
      variant === 'nocturne'
        ? 'conic-gradient(from 180deg at 50% 50%, rgba(6, 182, 212, 0) 0deg, rgba(6, 182, 212, 0.15) 120deg, rgba(59, 130, 246, 0.25) 180deg, rgba(6, 182, 212, 0) 240deg)'
        : variant === 'expressive'
        ? 'conic-gradient(from 180deg at 50% 50%, rgba(99, 102, 241, 0) 0deg, rgba(168, 85, 247, 0.15) 120deg, rgba(236, 72, 153, 0.2) 180deg, rgba(99, 102, 241, 0) 240deg)'
        : 'conic-gradient(from 180deg at 50% 50%, rgba(0, 0, 0, 0) 0deg, rgba(0, 0, 0, 0.05) 120deg, rgba(0, 0, 0, 0.1) 180deg, rgba(0, 0, 0, 0) 240deg)',
  };

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <div className="absolute inset-0 pointer-events-none opacity-80 blur-2xl transform scale-125" style={conicStyle} />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Angular Radiance</span>
        <h4 className="text-base font-bold tracking-tight">Conic Light Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Swept 360-degree conic gradient providing sophisticated specular reflections with zero canvas overhead.
        </p>
        {children}
      </div>
    </div>
  );
}
