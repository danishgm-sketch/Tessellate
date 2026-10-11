import React, { useState } from 'react';

export type HorizontalBarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface HorizontalBarChartProps {
  variant?: HorizontalBarChartVariant;
}

export function HorizontalBarChart({ variant = 'quiet' }: HorizontalBarChartProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const barBg =
    variant === 'nocturne' ? 'bg-[#1E232E]' : 'bg-neutral-100 dark:bg-neutral-800';

  const barFill =
    variant === 'nocturne'
      ? 'bg-cyan-500'
      : variant === 'expressive'
      ? 'bg-[#2547E8]'
      : 'bg-neutral-900 dark:bg-white';

  const items = [
    { label: '/api/v1/projects', value: 840, pct: 95 },
    { label: '/api/v1/auth/session', value: 620, pct: 70 },
    { label: '/api/v1/search', value: 510, pct: 58 },
    { label: '/api/v1/catalog/items', value: 390, pct: 44 },
    { label: '/api/v1/webhooks', value: 180, pct: 20 },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Top Requested Endpoints</h4>
          <p className="text-xs text-neutral-500">Request volume over past 24 hours</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">Total: 2,540 req</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.label}
            onMouseEnter={() => setActiveItem(item.label)}
            onMouseLeave={() => setActiveItem(null)}
            className="group cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-current">
                {item.label}
              </span>
              <span className="font-mono text-neutral-500">{item.value} req</span>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden ${barBg}`}>
              <div
                className={`h-full rounded-full transition-all duration-300 ${barFill} ${
                  activeItem === item.label ? 'opacity-100' : 'opacity-85'
                }`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
