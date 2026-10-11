import React from 'react';

export type ThreeDOrbitalFieldVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ThreeDOrbitalFieldProps {
  variant?: ThreeDOrbitalFieldVariant;
  children?: React.ReactNode;
}

export function ThreeDOrbitalField({ variant = 'quiet', children }: ThreeDOrbitalFieldProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const ringColor =
    variant === 'nocturne'
      ? 'rgba(6, 182, 212, 0.2)'
      : variant === 'expressive'
      ? 'rgba(99, 102, 241, 0.2)'
      : 'rgba(0, 0, 0, 0.08)';

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      {/* 3D tilted orbital rings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 300">
        <ellipse cx="300" cy="150" rx="240" ry="80" fill="none" stroke={ringColor} strokeWidth="1" strokeDasharray="3 3" transform="rotate(-15 300 150)" />
        <ellipse cx="300" cy="150" rx="160" ry="50" fill="none" stroke={ringColor} strokeWidth="1.5" transform="rotate(25 300 150)" />
        <circle cx="430" cy="115" r="3.5" fill="currentColor" opacity="0.6" />
        <circle cx="210" cy="180" r="2.5" fill="currentColor" opacity="0.5" />
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Celestial Geometry</span>
        <h4 className="text-base font-bold tracking-tight">3D Orbital Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Elliptical perspective rings and satellite telemetry nodes simulating global orbital trajectories.
        </p>
        {children}
      </div>
    </div>
  );
}
