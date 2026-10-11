import React, { useState } from 'react';

export type StackedAreaChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StackedAreaChartProps {
  variant?: StackedAreaChartVariant;
}

export function StackedAreaChart({ variant = 'quiet' }: StackedAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const layerColors =
    variant === 'nocturne'
      ? ['#06B6D4', '#6366F1', '#A855F7']
      : variant === 'expressive'
      ? ['#2547E8', '#10B981', '#F59E0B']
      : ['#171717', '#737373', '#D4D4D4'];

  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const series = [
    { name: 'Compute', data: [40, 55, 70, 90] },
    { name: 'Storage', data: [30, 45, 50, 65] },
    { name: 'Bandwidth', data: [20, 25, 35, 45] },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = 220;

  // Compute stacked cumulative points
  const stackedTotals = labels.map((_, i) => {
    let sum = 0;
    return series.map((s) => {
      sum += s.data[i] ?? 0;
      return sum;
    });
  });

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Cumulative Resource Allocation</h4>
          <p className="text-xs text-neutral-500">Tier volume stacked by quarter</p>
        </div>
        <div className="flex items-center gap-3">
          {series.map((s, idx) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: layerColors[idx] ?? '#000' }} />
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal gridlines */}
          {[0, 50, 100, 150, 200].map((v) => {
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

          {/* Draw stacked areas from top to bottom */}
          {[2, 1, 0].map((layerIdx) => {
            const color = layerColors[layerIdx] ?? '#000';
            const pts = labels.map((_, i) => {
              const x = padding.left + (i / (labels.length - 1)) * chartW;
              const stackVal = stackedTotals[i]?.[layerIdx] ?? 0;
              const y = padding.top + chartH - (stackVal / maxVal) * chartH;
              return { x, y };
            });

            const topPath = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
            const areaD = pts.length > 0 ? `${topPath} L ${pts[pts.length - 1]?.x ?? 0} ${padding.top + chartH} L ${pts[0]?.x ?? 0} ${padding.top + chartH} Z` : '';

            return <path key={layerIdx} d={areaD} fill={color} fillOpacity={variant === 'nocturne' ? 0.75 : 0.65} />;
          })}

          {/* X axis labels and hover interactions */}
          {labels.map((lbl, idx) => {
            const x = padding.left + (idx / (labels.length - 1)) * chartW;
            return (
              <g key={lbl} onMouseEnter={() => setHoveredIdx(idx)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                <rect x={x - 20} y={padding.top} width="40" height={chartH} fill="transparent" />
                {hoveredIdx === idx && (
                  <line x1={x} y1={padding.top} x2={x} y2={padding.top + chartH} stroke="#fff" strokeDasharray="3 3" strokeWidth="1" />
                )}
                <text x={x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                  {lbl}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
