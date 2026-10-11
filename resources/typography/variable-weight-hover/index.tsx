import React, { useState } from 'react';

export type VariableWeightHoverVariant = 'quiet' | 'expressive' | 'nocturne';

export interface VariableWeightHoverProps {
  words?: string[];
  variant?: VariableWeightHoverVariant;
  children?: React.ReactNode;
}

export function VariableWeightHover({
  words = ['PRECISION', 'HARMONY', 'STRUCTURE', 'CADENCE'],
  variant = 'quiet',
  children,
}: VariableWeightHoverProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const hoverHighlight =
    variant === 'nocturne'
      ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-950';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-6 transition-colors ${containerBg}`}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Tactile Weight Shift</span>
      <div className="flex flex-wrap gap-4 md:gap-8">
        {words.map((w, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <span
              key={w}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`text-3xl md:text-5xl tracking-tight cursor-pointer select-none transition-all duration-200 ${
                isHovered ? `font-black scale-105 ${hoverHighlight}` : 'font-light opacity-75'
              }`}
            >
              {w}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500 font-mono">
        Hover individual keywords to modulate optical weight and character dilation.
      </p>
      {children}
    </div>
  );
}
