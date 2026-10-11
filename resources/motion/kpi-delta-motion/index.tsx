import React, { useState } from 'react';

export type KpiDeltaMotionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KpiDeltaMotionProps {
  variant?: KpiDeltaMotionVariant;
}

export function KpiDeltaMotion({ variant = 'quiet' }: KpiDeltaMotionProps) {
  const [val, setVal] = useState(4250);
  const [delta, setDelta] = useState<'+' | '-'>('+');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const bump = (direction: '+' | '-') => {
    setDelta(direction);
    setVal((prev) => (direction === '+' ? prev + 125 : prev - 125));
  };

  return (
    <div className={`w-full p-8 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Directional Metric Ticker</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => bump('+')}
            className="text-xs px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 hover:text-emerald-500"
          >
            + Tick
          </button>
          <button
            onClick={() => bump('-')}
            className="text-xs px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 hover:text-rose-500"
          >
            - Tick
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <span className="text-4xl font-mono font-bold tracking-tight">$${val.toLocaleString()}</span>
        <span
          className={`text-xs font-mono font-semibold px-2 py-0.5 rounded transition-transform duration-200 ${
            delta === '+' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
          }`}
        >
          {delta === '+' ? '▲ +2.9%' : '▼ -2.9%'}
        </span>
      </div>
    </div>
  );
}
