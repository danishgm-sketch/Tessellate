import React, { useState } from 'react';

export type BubblePlotVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BubblePlotProps {
  variant?: BubblePlotVariant;
}

export function BubblePlot({ variant = 'quiet' }: BubblePlotProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const bubbleColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const bubbles = [
    { name: 'Core Engine', x: 25, y: 70, r: 18, val: '$120K' },
    { name: 'Auth Gateway', x: 45, y: 40, r: 12, val: '$65K' },
    { name: 'Search Service', x: 65, y: 85, r: 24, val: '$240K' },
    { name: 'Export Worker', x: 80, y: 30, r: 14, val: '$80K' },
    { name: 'Notification Hub', x: 85, y: 60, r: 10, val: '$45K' },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Service Value Matrix</h4>
          <p className="text-xs text-neutral-500">X: Complexity | Y: Impact | Radius: Cost</p>
        </div>
        {activeIdx !== null && (
          <span className="text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
            {bubbles[activeIdx]?.name}: {bubbles[activeIdx]?.val}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartH}
            stroke={variant === 'nocturne' ? '#2E3440' : '#E5E7EB'}
            strokeWidth="1"
          />

          {bubbles.map((b, idx) => {
            const cx = padding.left + (b.x / 100) * chartW;
            const cy = padding.top + chartH - (b.y / 100) * chartH;
            const isHovered = activeIdx === idx;

            return (
              <g key={b.name} onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? b.r * 1.2 : b.r}
                  fill={bubbleColor}
                  fillOpacity={isHovered ? 0.75 : 0.4}
                  stroke={bubbleColor}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                <text x={cx} y={cy + 3} textAnchor="middle" className="text-[9px] font-mono font-semibold fill-current select-none pointer-events-none">
                  {b.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
