import React, { useState } from 'react';

export type BarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BarChartProps {
  variant?: BarChartVariant;
}

export function BarChart({ variant = 'quiet' }: BarChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const barColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const data = [
    { label: 'Mon', value: 48 },
    { label: 'Tue', value: 64 },
    { label: 'Wed', value: 85 },
    { label: 'Thu', value: 92 },
    { label: 'Fri', value: 78 },
    { label: 'Sat', value: 34 },
    { label: 'Sun', value: 29 },
  ];

  const maxVal = 100;
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = 32;
  const step = chartW / data.length;

  return (
    <div className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Sample daily sign-ups</h4>
          <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">Illustrative sample data — not live measurements.</p>
        </div>
        <div className="text-xs font-mono font-medium">
          Sample total: <span className="text-base font-semibold">{data.reduce((a, b) => a + b.value, 0)}</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {[0, 25, 50, 75, 100].map((v) => {
            const y = padding.top + chartH * (1 - v / maxVal);
            return (
              <g key={v}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {v}
                </text>
              </g>
            );
          })}

          {data.map((d, idx) => {
            const x = padding.left + idx * step + (step - barWidth) / 2;
            const bHeight = (d.value / maxVal) * chartH;
            const y = padding.top + chartH - bHeight;
            const isHovered = activeIdx === idx;

            return (
              <g key={d.label} onMouseEnter={() => setActiveIdx(idx)} onMouseLeave={() => setActiveIdx(null)} className="cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={bHeight}
                  rx="4"
                  fill={barColor}
                  className={`transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-85'}`}
                />
                {isHovered && (
                  <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="text-[10px] font-mono font-semibold fill-current">
                    {d.value}
                  </text>
                )}
                <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
