import React from 'react';

export type RangeSliderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RangeSliderProps {
  variant?: RangeSliderVariant;
  label?: string;
  min?: number;
  max?: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
}

export function RangeSlider({
  variant = 'quiet',
  label,
  min = 0,
  max = 100,
  value,
  onChange,
}: RangeSliderProps) {
  const [low, high] = value;
  let accent = 'accent-neutral-900';
  if (variant === 'expressive') accent = 'accent-[#2547E8]';
  if (variant === 'nocturne') accent = 'accent-white';

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        {label && <span className="font-semibold text-neutral-700 dark:text-neutral-300">{label}</span>}
        <span className="font-mono text-neutral-500">{low} – {high}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="range"
          min={min}
          max={high}
          value={low}
          onChange={(e) => onChange([Number(e.target.value), high])}
          className={`w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer ${accent}`}
        />
        <input
          type="range"
          min={low}
          max={max}
          value={high}
          onChange={(e) => onChange([low, Number(e.target.value)])}
          className={`w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer ${accent}`}
        />
      </div>
    </div>
  );
}
