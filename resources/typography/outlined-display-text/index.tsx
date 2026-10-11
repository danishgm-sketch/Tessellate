import React from 'react';

export type OutlinedDisplayTextVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OutlinedDisplayTextProps {
  watermarkText?: string;
  foregroundText?: string;
  variant?: OutlinedDisplayTextVariant;
  children?: React.ReactNode;
}

export function OutlinedDisplayText({
  watermarkText = 'SYSTEMS',
  foregroundText = 'Engineered for Open Composition',
  variant = 'quiet',
  children,
}: OutlinedDisplayTextProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const strokeColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.3)'
      : variant === 'expressive'
      ? 'rgba(79, 70, 229, 0.25)'
      : 'rgba(0, 0, 0, 0.15)';

  return (
    <div className={`relative p-8 md:p-14 rounded-xl border max-w-4xl mx-auto overflow-hidden transition-colors ${containerBg}`}>
      {/* Huge outlined watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none text-7xl md:text-9xl font-black uppercase tracking-widest"
        style={{
          WebkitTextStroke: `1.5px ${strokeColor}`,
          color: 'transparent',
        }}
      >
        {watermarkText}
      </div>

      <div className="relative z-10 max-w-lg space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Typographic Monument</span>
        <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight">
          {foregroundText}
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Transparent stroke typography creates deep spatial layering without heavy ink coverage.
        </p>
        {children}
      </div>
    </div>
  );
}
