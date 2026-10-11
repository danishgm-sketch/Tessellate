import React from 'react';

export type ParticleConstellationVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ParticleConstellationProps {
  variant?: ParticleConstellationVariant;
}

export function ParticleConstellation({ variant = 'quiet' }: ParticleConstellationProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-900 text-white border-neutral-800'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotFill =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#3B82F6' : '#171717';

  const points = [
    { x: 50, y: 40 },
    { x: 120, y: 90 },
    { x: 220, y: 50 },
    { x: 340, y: 110 },
    { x: 420, y: 60 },
    { x: 510, y: 120 },
  ];

  return (
    <div className={`relative w-full p-8 rounded-xl border overflow-hidden min-h-[260px] flex flex-col justify-center transition-colors ${cardBg}`}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 200">
        {/* Constellation links */}
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={dotFill}
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="4 4"
        />
        {/* Constellation nodes */}
        {points.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3" fill={dotFill} />
        ))}
      </svg>

      <div className="relative z-10 max-w-md space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Cosmic Topology</span>
        <h4 className="text-base font-bold tracking-tight">Particle Constellation Field</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Interconnected vector star nodes forming celestial geometry across hero viewports.
        </p>
      </div>
    </div>
  );
}
