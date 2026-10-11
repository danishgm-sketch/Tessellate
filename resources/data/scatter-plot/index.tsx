import React, { useState } from 'react';

export type ScatterPlotVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScatterPlotProps {
  variant?: ScatterPlotVariant;
}

export function ScatterPlot({ variant = 'quiet' }: ScatterPlotProps) {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const pointColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const data = [
    { x: 12, y: 35, label: 'Job A' },
    { x: 28, y: 55, label: 'Job B' },
    { x: 45, y: 48, label: 'Job C' },
    { x: 62, y: 78, label: 'Job D' },
    { x: 75, y: 82, label: 'Job E' },
    { x: 88, y: 92, label: 'Job F' },
    { x: 34, y: 22, label: 'Job G' },
    { x: 50, y: 65, label: 'Job H' },
    { x: 80, y: 40, label: 'Job I' },
    { x: 95, y: 88, label: 'Job J' },
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
          <h4 className="text-sm font-semibold tracking-tight">Latency vs Payload Size</h4>
          <p className="text-xs text-neutral-500">Bivariate correlation analysis</p>
        </div>
        {activePoint !== null && (
          <span className="text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
            {data[activePoint]?.label}: ({data[activePoint]?.x}KB, {data[activePoint]?.y}ms)
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Quadrant crosshairs */}
          <line
            x1={padding.left + chartW / 2}
            y1={padding.top}
            x2={padding.left + chartW / 2}
            y2={padding.top + chartH}
            stroke={variant === 'nocturne' ? '#1E232E' : '#E5E7EB'}
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH / 2}
            x2={width - padding.right}
            y2={padding.top + chartH / 2}
            stroke={variant === 'nocturne' ? '#1E232E' : '#E5E7EB'}
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Scatter points */}
          {data.map((d, idx) => {
            const cx = padding.left + (d.x / 100) * chartW;
            const cy = padding.top + chartH - (d.y / 100) * chartH;
            const isHovered = activePoint === idx;

            return (
              <g key={d.label} onMouseEnter={() => setActivePoint(idx)} onMouseLeave={() => setActivePoint(null)} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 4.5}
                  fill={pointColor}
                  fillOpacity={isHovered ? 1 : 0.75}
                  stroke={variant === 'nocturne' ? '#000' : '#fff'}
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* Axis labels */}
          <text x={padding.left + chartW / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
            Payload Size (KB) →
          </text>
        </svg>
      </div>
    </div>
  );
}
