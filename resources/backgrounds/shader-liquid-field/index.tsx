import React from 'react';

export type ShaderLiquidFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ShaderLiquidFieldProps {
  variant?: ShaderLiquidFieldVariant;
  children?: React.ReactNode;
}

export function ShaderLiquidField({ variant = 'quiet', children }: ShaderLiquidFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const waveGrad1 =
    variant === 'nocturne' ? '#06b6d4' : variant === 'expressive' ? '#6366f1' : '#a3a3a3';
  const waveGrad2 =
    variant === 'nocturne' ? '#3b82f6' : variant === 'expressive' ? '#ec4899' : '#d4d4d4';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* Liquid fluid curves SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox="0 0 600 300">
        <defs>
          <linearGradient id={`liquid-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={waveGrad1} stopOpacity="0.4" />
            <stop offset="100%" stopColor={waveGrad2} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M0,100 C150,180 350,20 600,120 L600,300 L0,300 Z" fill={`url(#liquid-grad-${variant})`} />
        <path d="M0,150 C200,80 400,220 600,160 L600,300 L0,300 Z" fill={`url(#liquid-grad-${variant})`} opacity="0.6" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Viscous Dynamic</span>
        <h4 className="text-base font-bold tracking-tight">Shader Liquid Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Lightweight SVG liquid wave contours creating organic fluid motion without GPU shader battery drain.
        </p>
        {children}
      </div>
    </div>
  );
}
