import React from 'react';

export type MiniSparklineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MiniSparklineProps {
  variant?: MiniSparklineVariant;
  values?: number[];
  positive?: boolean;
}

export function MiniSparkline({
  variant = 'quiet',
  values = [28, 32, 29, 36, 42, 39, 48, 54],
  positive = true,
}: MiniSparklineProps) {
  const strokeColor =
    variant === 'nocturne'
      ? positive ? '#10B981' : '#F43F5E'
      : variant === 'expressive'
      ? positive ? '#10B981' : '#EF4444'
      : '#171717';

  const w = 90;
  const h = 28;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const lastVal = values[values.length - 1] ?? 0;

  return (
    <div className="inline-flex items-center gap-3">
      <svg width={w} height={h} className="overflow-visible select-none">
        <polyline points={pts} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle
          cx={w - pad}
          cy={h - pad - ((lastVal - min) / range) * (h - pad * 2)}
          r="2.5"
          fill={strokeColor}
        />
      </svg>
      <span className={`text-xs font-mono font-semibold ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {positive ? '+14.2%' : '-4.8%'}
      </span>
    </div>
  );
}
