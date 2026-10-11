import React from 'react';

export type NumberInputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NumberInputProps {
  variant?: NumberInputVariant;
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export function NumberInput({
  variant = 'quiet',
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit,
  onChange,
}: NumberInputProps) {
  let theme = 'border-neutral-300 bg-white text-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white';
  }

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className={`inline-flex items-center rounded-lg border overflow-hidden text-sm ${theme}`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 border-r border-inherit"
        >
          −
        </button>
        <span className="px-4 py-1.5 font-mono text-center min-w-12">
          {value}{unit ? ` ${unit}` : ''}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 border-l border-inherit"
        >
          +
        </button>
      </div>
    </div>
  );
}
