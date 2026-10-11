import React, { useState } from 'react';

export type ScrollProgressVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScrollProgressProps {
  variant?: ScrollProgressVariant;
}

export function ScrollProgress({ variant = 'quiet' }: ScrollProgressProps) {
  const [progress, setProgress] = useState(65);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const fillBg =
    variant === 'nocturne'
      ? 'bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8]'
      : 'bg-neutral-900 dark:bg-white';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Article Reading Progress</h4>
          <p className="text-xs text-neutral-500">Fixed top hairline telemetry</p>
        </div>
        <span className="text-xs font-mono font-medium">{progress}% Completed</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-150 ${fillBg}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <span className="text-xs text-neutral-400 font-mono">Simulate Scroll:</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="flex-1 accent-neutral-900 dark:accent-white cursor-pointer"
        />
      </div>
    </div>
  );
}
