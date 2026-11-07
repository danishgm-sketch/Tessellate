import React from 'react';

export type DataTerminalHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataTerminalHeaderProps {
  variant?: DataTerminalHeaderVariant;
}

export function DataTerminalHeader({ variant = 'quiet' }: DataTerminalHeaderProps) {
  const theme = {
    quiet: 'bg-neutral-900 text-white font-mono border-b border-neutral-800',
    expressive: 'bg-blue-700 text-white font-mono border-b-2 border-blue-300 shadow-sm',
    nocturne: 'bg-[#0B0D10] text-neutral-100 font-mono border-b border-[#2E3440]',
  }[variant];
  const secondaryText = variant === 'expressive' ? 'text-blue-50' : 'text-neutral-300';
  const statusText = variant === 'expressive' ? 'text-emerald-100' : 'text-emerald-400';
  const sampleLabel = variant === 'expressive' ? 'text-amber-100' : 'text-amber-300';

  return (
    <header
      className={`w-full min-h-11 px-4 py-2 flex flex-col items-start gap-2 text-xs sm:h-11 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 ${theme}`}
    >
      <div className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 sm:w-auto sm:flex-nowrap sm:gap-4">
        <span className={`whitespace-nowrap font-bold ${sampleLabel}`}>SAMPLE DATA</span>
        <span className={`whitespace-nowrap ${secondaryText}`}>BTC/USD $42,000.00</span>
        <span className={`whitespace-nowrap ${statusText}`}>+2.4% example</span>
      </div>
      <div
        className={`flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:w-auto sm:flex-nowrap sm:gap-4 ${secondaryText}`}
        title="These values are static examples; no feed or probe is connected."
      >
        <span className="whitespace-nowrap">Example RTT: 12ms</span>
        <span className="whitespace-nowrap">No live feed</span>
      </div>
    </header>
  );
}
