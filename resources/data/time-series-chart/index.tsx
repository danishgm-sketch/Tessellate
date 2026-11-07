import React, { useState } from 'react';

export type TimeSeriesChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataPoint {
  time: string;
  value: number;
}

export interface TimeSeriesChartProps {
  variant?: TimeSeriesChartVariant;
  data?: DataPoint[];
  title?: string;
}

const DEFAULT_DATA: DataPoint[] = [
  { time: '00:00', value: 42 },
  { time: '04:00', value: 38 },
  { time: '08:00', value: 65 },
  { time: '12:00', value: 89 },
  { time: '16:00', value: 74 },
  { time: '20:00', value: 92 },
  { time: '24:00', value: 81 },
];

export function TimeSeriesChart({
  variant = 'quiet',
  data = DEFAULT_DATA,
  title = 'Sample API throughput (req/s)',
}: TimeSeriesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const hasData = data.length > 0;

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm dark:bg-[#0B0D10] dark:border-[#2E3440] dark:text-white'
      : 'bg-white border-neutral-200 text-neutral-900 dark:bg-[#0B0D10] dark:border-[#2E3440] dark:text-white';

  const lineColor =
    variant === 'nocturne'
      ? '#06B6D4'
      : variant === 'expressive'
      ? '#2547E8'
      : '#171717';

  const gridColor =
    variant === 'nocturne' ? '#1E232E' : variant === 'expressive' ? '#F1EFEA' : '#F3F4F6';

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };

  const maxValue = Math.max(...data.map((d) => d.value), 100);
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (d.value / maxValue) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartH} L ${points[0]?.x ?? 0} ${padding.top + chartH} Z` : '';

  const activePoint = hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < points.length ? points[hoveredIdx] : null;

  return (
    <div
      style={{
        ...(variant === 'nocturne' ? { '--tess-ink-muted': '#A8AFBA', '--tess-ink-secondary': '#D1D5DB' } : {}),
      } as React.CSSProperties}
      className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border flex flex-col transition-colors ${cardBg}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
          {hasData && <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">Illustrative sample data — not live measurements.</p>}
        </div>
        {hasData && (
          <div className="text-right">
            <span className="text-lg font-mono font-semibold">
              {activePoint ? activePoint.value : points[points.length - 1]?.value}
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 ml-1">req/s</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        {hasData ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id={`ts-grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={variant === 'nocturne' ? 0.35 : 0.2} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + chartH * (1 - pct);
            return (
              <g key={idx}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke={gridColor} strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {Math.round(maxValue * pct)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaD && <path d={areaD} fill={`url(#ts-grad-${variant})`} />}

          {/* Line path */}
          {pathD && <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data points & hover zones */}
          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <rect x={p.x - 15} y={padding.top} width="30" height={chartH} fill="transparent" />
              {hoveredIdx === idx && (
                <>
                  <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + chartH} stroke={lineColor} strokeDasharray="3 3" strokeWidth="1" />
                  <circle cx={p.x} cy={p.y} r="5" fill={lineColor} stroke={variant === 'nocturne' ? '#000' : '#fff'} strokeWidth="2" />
                </>
              )}
              <text x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                {p.time}
              </text>
            </g>
          ))}
        </svg>
        ) : (
          <p role="status" aria-live="polite" className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm opacity-75 dark:border-neutral-700">
            <span className="block font-semibold">No data yet</span>
            <span className="mt-1 block">No time-series data available for this period.</span>
          </p>
        )}
      </div>
    </div>
  );
}
