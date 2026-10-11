import React, { useState } from 'react';

export type MultiSeriesLineChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MultiSeriesLineChartProps {
  variant?: MultiSeriesLineChartVariant;
}

export function MultiSeriesLineChart({ variant = 'quiet' }: MultiSeriesLineChartProps) {
  const [activeSeries, setActiveSeries] = useState<Record<string, boolean>>({
    Production: true,
    Staging: true,
    Canary: true,
  });

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const seriesColors =
    variant === 'nocturne'
      ? { Production: '#06B6D4', Staging: '#F43F5E', Canary: '#10B981' }
      : variant === 'expressive'
      ? { Production: '#2547E8', Staging: '#10B981', Canary: '#F59E0B' }
      : { Production: '#171717', Staging: '#737373', Canary: '#A3A3A3' };

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const seriesData = [
    { name: 'Production', values: [32, 45, 54, 65, 59, 80, 88] },
    { name: 'Staging', values: [20, 25, 38, 42, 48, 55, 62] },
    { name: 'Canary', values: [10, 15, 18, 22, 29, 31, 35] },
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxValue = 100;

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Traffic Comparison</h4>
          <p className="text-xs text-neutral-500">Monthly throughput across deploy tiers</p>
        </div>
        <div className="flex items-center gap-3">
          {seriesData.map((s) => {
            const isVisible = activeSeries[s.name] ?? true;
            const color = seriesColors[s.name as keyof typeof seriesColors] ?? '#171717';
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setActiveSeries((prev) => ({ ...prev, [s.name]: !isVisible }))}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-opacity ${
                  isVisible ? 'opacity-100' : 'opacity-40 line-through'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Horizontal gridlines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + chartH * (1 - val / maxValue);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={variant === 'nocturne' ? '#1E232E' : '#F3F4F6'}
                  strokeWidth="1"
                />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-neutral-400 font-mono">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Render series lines */}
          {seriesData.map((s) => {
            if (!(activeSeries[s.name] ?? true)) return null;
            const color = seriesColors[s.name as keyof typeof seriesColors] ?? '#171717';

            const pts = s.values.map((v, i) => {
              const x = padding.left + (i / (s.values.length - 1)) * chartW;
              const y = padding.top + chartH - (v / maxValue) * chartH;
              return { x, y, v };
            });

            const pathD = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

            return (
              <g key={s.name}>
                <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="3.5" fill={color} stroke={variant === 'nocturne' ? '#000' : '#fff'} strokeWidth="1.5" />
                ))}
              </g>
            );
          })}

          {/* X axis labels */}
          {labels.map((lbl, idx) => {
            const x = padding.left + (idx / (labels.length - 1)) * chartW;
            return (
              <text key={lbl} x={x} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400 font-mono">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
