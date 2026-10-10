import React from 'react';

export type SliderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SliderProps {
  variant?: SliderVariant;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}

export function Slider({
  variant = 'quiet',
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: SliderProps) {
  let accent = 'accent-neutral-900';
  if (variant === 'expressive') accent = 'accent-[#2547E8]';
  if (variant === 'nocturne') accent = 'accent-white';

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        {label && <span className="font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>}
        <span className="font-mono text-neutral-500">{value}</span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer ${accent}`}
        />
      </div>
    </div>
  );
}
