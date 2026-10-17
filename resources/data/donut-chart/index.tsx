import React, { useState } from 'react';

export type DonutChartVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DonutChartProps {
  variant?: DonutChartVariant;
}

export function DonutChart({ variant = 'quiet' }: DonutChartProps) {
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const colors =
    variant === 'nocturne'
      ? ['#06B6D4', '#6366F1', '#A855F7', '#F43F5E']
      : variant === 'expressive'
      ? ['#2547E8', '#10B981', '#F59E0B', '#EF4444']
      : ['#171717', '#525252', '#8C8C8C', '#D4D4D4'];

  const segments = [
    { label: 'Enterprise', value: 45 },
    { label: 'Pro', value: 30 },
    { label: 'Starter', value: 15 },
    { label: 'Free', value: 10 },
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border flex flex-col transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Sample subscription mix</h4>
          <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">Illustrative sample data — not live measurements.</p>
        </div>
      </div>

      <div className="flex flex-col @sm:flex-row items-center justify-center gap-8 py-4">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center select-none">
          <svg width={size} height={size} className="transform -rotate-90">
            {segments.map((seg, idx) => {
              const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (seg.value / total) * circumference;
              const color = colors[idx] ?? '#000';
              const isHovered = activeSegment === idx;

              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setActiveSegment(idx)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold font-mono">
              {activeSegment !== null ? segments[activeSegment]?.value ?? total : `${total}%`}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">
              {activeSegment !== null ? segments[activeSegment]?.label : 'Total'}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {segments.map((seg, idx) => {
            const color = colors[idx] ?? '#000';
            const isHovered = activeSegment === idx;
            return (
              <div
                key={seg.label}
                onMouseEnter={() => setActiveSegment(idx)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center gap-3 text-xs p-1.5 rounded cursor-pointer transition-opacity ${
                  isHovered ? 'opacity-100 font-semibold' : 'opacity-80'
                }`}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="w-24">{seg.label}</span>
                <span className="font-mono font-medium">{seg.value}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
