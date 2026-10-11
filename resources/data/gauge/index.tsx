import React from 'react';

export type GaugeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GaugeProps {
  variant?: GaugeVariant;
  value?: number;
  max?: number;
}

export function Gauge({ variant = 'quiet', value = 76, max = 100 }: GaugeProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const fillStroke =
    variant === 'nocturne' ? '#06B6D4' : variant === 'expressive' ? '#2547E8' : '#171717';

  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col items-center transition-colors ${cardBg}`}>
      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">CPU Cluster Load</h4>
          <p className="text-xs text-neutral-500">Real-time utilization meter</p>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
          Optimal Zone
        </span>
      </div>

      <div className="relative w-[180px] h-[100px] flex justify-center overflow-hidden select-none">
        <svg width="180" height="90" viewBox="0 0 180 90">
          {/* Background track */}
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={variant === 'nocturne' ? '#1E232E' : '#E5E7EB'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active fill */}
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            stroke={fillStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>

        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
          <span className="text-3xl font-mono font-bold">{value}%</span>
          <span className="text-[10px] text-neutral-400 font-mono">Limit: {max}%</span>
        </div>
      </div>
    </div>
  );
}
