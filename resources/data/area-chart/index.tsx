import React, { useState } from 'react';

export type AreaChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AreaChartProps {
  variant?: AreaChartVariant;
}

export function AreaChart({ variant = 'quiet' }: AreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const strokeColor =
    variant === 'nocturne' ? '#38BDF8' : variant === 'expressive' ? '#2547E8' : '#262626';

  const data = [
    { label: 'Week 1', value: 120 },
    { label: 'Week 2', value: 180 },
    { label: 'Week 3', value: 150 },
    { label: 'Week 4', value: 240 },
    { label: 'Week 5', value: 290 },
    { label: 'Week 6', value: 310 },
    { label: 'Week 7', value: 420 },
  ];

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = 500;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - (d.value / maxVal) * chartH;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = points.length > 0 ? `${pathD} L ${points[points.length - 1]?.x ?? 0} ${padding.top + chartH} L ${points[0]?.x ?? 0} ${padding.top + chartH} Z` : '';

  return (
    <div className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Active Ingestion Volume</h4>
          <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">Cumulative GB ingested across cluster</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">
          Peak: 420 GB
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id={`area-grad-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={variant === 'nocturne' ? 0.4 : 0.25} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {[0, 100, 250, 500].map((v) => {
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

          {areaD && <path d={areaD} fill={`url(#area-grad-${variant})`} />}
          {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {points.map((p, idx) => (
            <g key={idx} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
              <rect x={p.x - 15} y={padding.top} width="30" height={chartH} fill="transparent" />
              {hoveredIdx === idx && (
                <>
                  <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + chartH} stroke={strokeColor} strokeDasharray="3 3" strokeWidth="1" />
                  <circle cx={p.x} cy={p.y} r="5" fill={strokeColor} stroke={variant === 'nocturne' ? '#000' : '#fff'} strokeWidth="2" />
                </>
              )}
              <text x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
