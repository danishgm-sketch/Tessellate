import React from 'react';

export type ProgressBarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProgressBarProps {
  variant?: ProgressBarVariant;
  value: number;
  max?: number;
  showLabel?: boolean;
}

export function ProgressBar({ variant = 'quiet', value, max = 100, showLabel = false }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let fill = 'bg-neutral-900';
  if (variant === 'expressive') fill = 'bg-[#2547E8]';
  if (variant === 'nocturne') fill = 'bg-white';

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span>Progress</span>
          <span className="font-mono">{percent}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-full transition-all duration-300 ease-out ${fill}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
