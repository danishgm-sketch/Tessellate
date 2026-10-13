import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  className,
  disabled = false,
}: SliderProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={twMerge('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#111217] dark:text-[#F5F7FA]">{label}</span>
          <span className="text-[#8B8F97] dark:text-[#707986] font-mono">{value}</span>
        </div>
      )}
      <div className="relative flex items-center h-4 w-full">
        {/* Track */}
        <div className="h-1 w-full rounded-full bg-[#D9D6CF] dark:bg-[#272C34] overflow-hidden">
          <div
            className="h-full bg-[#2547E8] dark:bg-[#6782FF]"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Native range input for complete keyboard/a11y support */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          aria-label={label || 'Slider'}
          className={clsx(
            'absolute inset-0 w-full opacity-0 cursor-pointer h-4',
            disabled && 'cursor-not-allowed'
          )}
        />
        {/* Custom Thumb */}
        <div
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full border border-black/10 bg-[#FFFFFF] shadow-xs dark:bg-[#F5F7FA]"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
