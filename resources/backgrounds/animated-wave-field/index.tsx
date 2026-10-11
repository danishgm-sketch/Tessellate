import React from 'react';

export type AnimatedWaveFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AnimatedWaveFieldProps {
  variant?: AnimatedWaveFieldVariant;
}

export function AnimatedWaveField({ variant = 'quiet' }: AnimatedWaveFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const waveColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.15)'
      : variant === 'expressive'
      ? 'rgba(37, 71, 232, 0.1)'
      : 'rgba(0, 0, 0, 0.05)';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <svg className="absolute bottom-0 inset-x-0 w-full h-32 pointer-events-none" viewBox="0 0 600 120" preserveAspectRatio="none">
        <path
          d="M 0 60 C 150 100, 300 20, 450 60 C 525 80, 580 40, 600 50 L 600 120 L 0 120 Z"
          fill={waveColor}
        />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Harmonic Motion</span>
        <h4 className="text-base font-bold tracking-tight">Animated Wave Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Smooth harmonic sine curve baseline providing organic fluid movement under section copy.
        </p>
      </div>
    </div>
  );
}
