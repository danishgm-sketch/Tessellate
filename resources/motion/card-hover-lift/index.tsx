import React from 'react';

export type CardHoverLiftVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CardHoverLiftProps {
  variant?: CardHoverLiftVariant;
}

export function CardHoverLift({ variant = 'quiet' }: CardHoverLiftProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white hover:border-cyan-500/50 hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)]'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 hover:border-blue-400 hover:shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 hover:border-neutral-300 hover:shadow-md';

  return (
    <div className="p-8 flex items-center justify-center">
      <div
        className={`w-80 p-6 rounded-xl border transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 motion-reduce:transform-none ${cardBg}`}
      >
        <div className="text-[10px] font-mono text-neutral-400 mb-2">Elevation Affordance</div>
        <h4 className="text-sm font-semibold mb-1">Hover Lift Elevation</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Subtle vertical translation paired with expanded shadow bloom signals clickability.
        </p>
      </div>
    </div>
  );
}
