import React, { useState } from 'react';

export type SlideClipRevealVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SlideClipRevealProps {
  variant?: SlideClipRevealVariant;
}

export function SlideClipReveal({ variant = 'quiet' }: SlideClipRevealProps) {
  const [sliderPos, setSliderPos] = useState(50);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Clip-Path Wipe Comparison</span>
        <span className="text-xs font-mono font-medium">{sliderPos}%</span>
      </div>

      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 select-none">
        {/* Under layer (Quiet) */}
        <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-6 text-center">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-neutral-500 mb-1">Quiet Mode</div>
            <div className="text-sm font-semibold">Calm Slate Minimalist Baseline</div>
          </div>
        </div>

        {/* Over layer (Nocturne / Expressive clipped) */}
        <div
          className="absolute inset-0 bg-neutral-950 text-white flex items-center justify-center p-6 text-center transition-all duration-75"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <div>
            <div className="text-xs font-mono font-bold uppercase text-cyan-400 mb-1">Nocturne Mode</div>
            <div className="text-sm font-semibold text-cyan-50">Obsidian Razor-Sharp Luminescence</div>
          </div>
        </div>

        {/* Divider bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        />
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
      />
    </div>
  );
}
