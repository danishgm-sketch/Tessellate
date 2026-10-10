import React from 'react';

export type SegmentedControlVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  variant?: SegmentedControlVariant;
  options: SegmentedControlOption[];
  value: string;
  onChange: (val: string) => void;
}

export function SegmentedControl({
  variant = 'quiet',
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  let container = 'bg-neutral-100 p-1 border border-neutral-200';
  let activePill = 'bg-white text-neutral-900 shadow-xs';
  if (variant === 'expressive') {
    container = 'bg-[#F2EFE9] p-1 border border-[#D9D6CF]';
    activePill = 'bg-white text-[#2547E8] font-semibold shadow-xs';
  } else if (variant === 'nocturne') {
    container = 'bg-[#11141B] p-1 border border-[#2E3440]';
    activePill = 'bg-[#1E232E] text-white border border-neutral-700 shadow-xs';
  }

  return (
    <div className={`inline-flex rounded-lg ${container}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all duration-150 ${
              isSelected ? activePill : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
