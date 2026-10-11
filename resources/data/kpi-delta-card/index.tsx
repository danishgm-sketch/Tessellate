import React from 'react';

export type KpiDeltaCardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KpiDeltaCardProps {
  variant?: KpiDeltaCardVariant;
  title?: string;
  value?: string;
  delta?: string;
  isPositive?: boolean;
}

export function KpiDeltaCard({
  variant = 'quiet',
  title = 'Monthly Recurring Revenue',
  value = '$128,450',
  delta = '+18.4% vs last month',
  isPositive = true,
}: KpiDeltaCardProps) {
  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const badgeBg =
    isPositive
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800';

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col justify-between transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</span>
        <span className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded-full border ${badgeBg}`}>
          {delta}
        </span>
      </div>

      <div className="flex items-baseline justify-between mt-1">
        <span className="text-3xl font-bold font-mono tracking-tight">{value}</span>
        <svg width="60" height="24" className="overflow-visible select-none">
          <polyline
            points="0,20 12,16 24,18 36,10 48,14 60,4"
            fill="none"
            stroke={isPositive ? '#10B981' : '#F43F5E'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
