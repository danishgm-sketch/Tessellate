import React from 'react';

export type ProgressRingVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProgressRingProps {
  variant?: ProgressRingVariant;
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  variant = 'quiet',
  value,
  size = 64,
  strokeWidth = 6,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

  let stroke = '#171717';
  if (variant === 'expressive') stroke = '#2547E8';
  if (variant === 'nocturne') stroke = '#FFFFFF';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-neutral-200 dark:text-neutral-800"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute font-mono text-xs font-semibold">{value}%</span>
    </div>
  );
}
