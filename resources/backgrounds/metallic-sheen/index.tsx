import React from 'react';

export type MetallicSheenVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MetallicSheenProps {
  variant?: MetallicSheenVariant;
  children?: React.ReactNode;
}

export function MetallicSheen({ variant = 'quiet', children }: MetallicSheenProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-gradient-to-tr from-[#0F1115] via-[#1E232E] to-[#0A0C0E] text-white border-[#384152]'
      : variant === 'expressive'
      ? 'bg-gradient-to-tr from-[#E2E8F0] via-[#F8FAFC] to-[#CBD5E1] text-neutral-900 border-[#94A3B8]'
      : 'bg-gradient-to-tr from-[#EDEDED] via-[#FAFAFA] to-[#E5E5E5] text-neutral-900 border-[#D4D4D4]';

  return (
    <div className={`relative w-full p-8 rounded-xl border shadow-sm overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* Specular light streak */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 52%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Machined Finish</span>
        <h4 className="text-base font-bold tracking-tight">Metallic Sheen</h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Anodized metal specular luster engineered for titanium cards and aerospace hardware control panels.
        </p>
        {children}
      </div>
    </div>
  );
}
