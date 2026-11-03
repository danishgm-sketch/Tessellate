import React from 'react';

export type DataTerminalHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataTerminalHeaderProps {
  variant?: DataTerminalHeaderVariant;
}

export function DataTerminalHeader({ variant = 'quiet' }: DataTerminalHeaderProps) {
  let theme = 'bg-neutral-900 text-white font-mono border-b border-neutral-800';
  if (variant === 'nocturne') theme = 'bg-[#0B0D10] text-neutral-100 font-mono border-b border-[#2E3440]';

  return (
    <header className={`w-full px-4 h-11 flex items-center justify-between text-xs ${theme}`}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-amber-300">SAMPLE DATA</span>
        <span className="opacity-70">BTC/USD $42,000.00</span>
        <span className="opacity-70 text-emerald-400">+2.4% example</span>
      </div>
      <div className="flex items-center gap-4 opacity-60 text-[11px]" title="These values are static examples; no feed or probe is connected.">
        <span>Example RTT: 12ms</span>
        <span>No live feed</span>
      </div>
    </header>
  );
}
