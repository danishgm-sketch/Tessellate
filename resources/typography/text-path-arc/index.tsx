import React from 'react';

export type TextPathArcVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TextPathArcProps {
  text?: string;
  centerText?: string;
  variant?: TextPathArcVariant;
  children?: React.ReactNode;
}

export function TextPathArc({
  text = 'OPEN RESOURCE VOCABULARY â€¢ ZERO RUNTIME LOCK-IN â€¢ ',
  centerText = 'MIT',
  variant = 'quiet',
  children,
}: TextPathArcProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const strokeColor =
    variant === 'nocturne'
      ? '#06b6d4'
      : variant === 'expressive'
      ? '#4f46e5'
      : '#737373';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 transition-colors ${containerBg}`}>
      {/* SVG Circular text badge */}
      <div className="shrink-0 relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-[spin_20s_linear_infinite]">
          <path
            id={`circle-path-${variant}`}
            d="M 100, 100 m -65, 0 a 65,65 0 1,1 130,0 a 65,65 0 1,1 -130,0"
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.75"
            strokeDasharray="2 2"
          />
          <text fill="currentColor" className="text-[10px] font-mono uppercase tracking-widest font-bold">
            <textPath href={`#circle-path-${variant}`} startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black font-mono tracking-tight">{centerText}</span>
          <span className="text-[8px] font-mono uppercase text-neutral-400">License</span>
        </div>
      </div>

      <div className="space-y-2 text-center md:text-left max-w-md">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Vector Curvature</span>
        <h4 className="text-xl font-bold tracking-tight">Curved Text Path Arc</h4>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Circular vector textPath generating continuous orbital badges and licence labels with zero image assets.
        </p>
        {children}
      </div>
    </div>
  );
}
