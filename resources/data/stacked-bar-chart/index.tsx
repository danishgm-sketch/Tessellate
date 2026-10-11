import React, { useState } from 'react';

export type StackedBarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StackedBarChartProps {
  variant?: StackedBarChartVariant;
}

export function StackedBarChart({ variant = 'quiet' }: StackedBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const segmentColors =
    variant === 'nocturne'
      ? ['#06B6D4', '#6366F1', '#A855F7']
      : variant === 'expressive'
      ? ['#2547E8', '#10B981', '#F59E0B']
      : ['#171717', '#737373', '#D4D4D4'];

  const categories = ['Desktop', 'Mobile', 'Tablet'];
  const months = [
    { month: 'Jan', segments: [45, 30, 15] },
    { month: 'Feb', segments: [50, 35, 18] },
    { month: 'Mar', segments: [60, 40, 20] },
    { month: 'Apr', segments: [55, 45, 22] },
    { month: 'May', segments: [70, 50, 25] },
  ];

  const maxVal = 160;
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barWidth = 36;
  const step = chartW / months.length;

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Traffic by Platform</h4>
          <p className="text-xs text-neutral-500">Segmented breakdown by device type</p>
        </div>
        <div className="flex items-center gap-3">
          {categories.map((c, idx) => (
            <div key={c} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: segmentColors[idx] ?? '#000' }} />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {[0, 40, 80, 120, 160].map((v) => {
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

          {months.map((m, mIdx) => {
            const x = padding.left + mIdx * step + (step - barWidth) / 2;
            let currentY = padding.top + chartH;

            return (
              <g key={m.month} onMouseEnter={() => setHoveredIdx(mIdx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                {m.segments.map((val, sIdx) => {
                  const sHeight = (val / maxVal) * chartH;
                  currentY -= sHeight;
                  const color = segmentColors[sIdx] ?? '#000';
                  return (
                    <rect
                      key={sIdx}
                      x={x}
                      y={currentY}
                      width={barWidth}
                      height={sHeight}
                      fill={color}
                      className={`transition-opacity duration-150 ${
                        hoveredIdx === null || hoveredIdx === mIdx ? 'opacity-100' : 'opacity-50'
                      }`}
                    />
                  );
                })}
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${
                    hoveredIdx === mIdx ? 'font-bold fill-current' : 'fill-neutral-400'
                  }`}
                >
                  {m.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
