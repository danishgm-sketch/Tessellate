import React from 'react';

export type AnimatedGradientLineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnimatedGradientLineProps {
  variant?: AnimatedGradientLineVariant;
}

export function AnimatedGradientLine({ variant = 'quiet' }: AnimatedGradientLineProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const gradientClass =
    variant === 'nocturne'
      ? 'from-transparent via-cyan-400 to-transparent'
      : variant === 'expressive'
      ? 'from-transparent via-blue-600 to-transparent'
      : 'from-transparent via-neutral-900 dark:via-white to-transparent';

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col gap-6 transition-colors ${cardBg}`}>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight">Luminescent Divider Beam</h4>
        <p className="text-xs text-neutral-500">Horizontal gradient beam sweeping continuously across boundary</p>
      </div>

      <div className="relative w-full h-px bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className={`absolute top-0 bottom-0 w-48 bg-gradient-to-r ${gradientClass} animate-[move-horizontal_3s_ease-in-out_infinite]`}
          style={{ animation: 'moveBeam 3s ease-in-out infinite' }}
        />
        <style>{`
          @keyframes moveBeam {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(500%); }
          }
        `}</style>
      </div>
    </div>
  );
}
