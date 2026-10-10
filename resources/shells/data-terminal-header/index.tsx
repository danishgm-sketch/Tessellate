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
        <span className="font-bold text-emerald-400">● LIVE</span>
        <span className="opacity-70">BTC/USD $94,320.50</span>
        <span className="opacity-70 text-emerald-400">+2.4%</span>
      </div>
      <div className="flex items-center gap-4 opacity-60 text-[11px]">
        <span>RTT: 12ms</span>
        <span>UTC 14:02:49</span>
      </div>
    </header>
  );
}
