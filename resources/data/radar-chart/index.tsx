import React, { useState } from 'react';

export type RadarChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RadarChartProps {
  variant?: RadarChartVariant;
}

export function RadarChart({ variant = 'quiet' }: RadarChartProps) {
  const [activeAxis, setActiveAxis] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const strokeColor =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const gridColor =
    variant === 'nocturne' ? '#1E232E' : '#E5E7EB';

  const metrics = [
    { label: 'Security', val: 92 },
    { label: 'Speed', val: 85 },
    { label: 'Reliability', val: 98 },
    { label: 'Usability', val: 78 },
    { label: 'Scalability', val: 90 },
    { label: 'Compliance', val: 88 },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 95;
  const numAxes = metrics.length;

  const getCoordinates = (axisIndex: number, valuePct: number) => {
    const angle = (Math.PI * 2 / numAxes) * axisIndex - Math.PI / 2;
    const r = radius * valuePct;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polyPoints = metrics.map((m, i) => {
    const coords = getCoordinates(i, m.val / 100);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col items-center transition-colors ${cardBg}`}>
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">System Maturity Profile</h4>
          <p className="text-xs text-neutral-500">6-axis architectural readiness</p>
        </div>
        <span className="text-xs font-mono font-medium text-neutral-400">Score: 88.5/100</span>
      </div>

      <div className="relative w-[280px] h-[280px] flex items-center justify-center select-none">
        <svg width={size} height={size} className="overflow-visible">
          {/* Concentric polygon rings */}
          {[0.25, 0.5, 0.75, 1.0].map((ring) => {
            const ringPts = Array.from({ length: numAxes })
              .map((_, i) => {
                const c = getCoordinates(i, ring);
                return `${c.x},${c.y}`;
              })
              .join(' ');
            return (
              <polygon
                key={ring}
                points={ringPts}
                fill="none"
                stroke={gridColor}
                strokeWidth="1"
              />
            );
          })}

          {/* Radial axis lines and labels */}
          {metrics.map((m, i) => {
            const endCoords = getCoordinates(i, 1.0);
            const labelCoords = getCoordinates(i, 1.25);
            const isHovered = activeAxis === i;

            return (
              <g key={m.label} onMouseEnter={() => setActiveAxis(i)} onMouseLeave={() => setActiveAxis(null)} className="cursor-pointer">
                <line x1={center} y1={center} x2={endCoords.x} y2={endCoords.y} stroke={gridColor} strokeWidth="1" />
                <text
                  x={labelCoords.x}
                  y={labelCoords.y + 4}
                  textAnchor="middle"
                  className={`text-[10px] font-mono transition-colors ${isHovered ? 'font-bold fill-current' : 'fill-neutral-400'}`}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Value polygon */}
          <polygon
            points={polyPoints}
            fill={strokeColor}
            fillOpacity={variant === 'nocturne' ? 0.35 : 0.2}
            stroke={strokeColor}
            strokeWidth="2.5"
          />

          {/* Point dots */}
          {metrics.map((m, i) => {
            const c = getCoordinates(i, m.val / 100);
            return (
              <circle
                key={m.label}
                cx={c.x}
                cy={c.y}
                r="4"
                fill={strokeColor}
                stroke={variant === 'nocturne' ? '#000' : '#fff'}
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
