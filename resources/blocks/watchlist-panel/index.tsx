import React from 'react';

export type WatchlistPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WatchlistPanelProps {
  variant?: WatchlistPanelVariant;
}

export function WatchlistPanel({ variant = 'quiet' }: WatchlistPanelProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const list = [
    { symbol: 'TSLA.US', price: '$248.50', delta: '+3.2%' },
    { symbol: 'NVDA.US', price: '$128.90', delta: '+1.8%' },
    { symbol: 'AAPL.US', price: '$224.10', delta: '-0.4%' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Entity Watchlist</h3>
      <div className="space-y-3 font-mono text-xs">
        {list.map((item) => (
          <div key={item.symbol} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="font-bold">{item.symbol}</span>
            <div className="flex items-center gap-4">
              <span>{item.price}</span>
              <span className={item.delta.startsWith('+') ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {item.delta}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
