import React from 'react';

export type RadioGroupVariant = 'quiet' | 'expressive' | 'nocturne';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  variant?: RadioGroupVariant;
  name?: string;
  options: RadioOption[];
  value: string;
  onChange: (val: string) => void;
}

export function RadioGroup({
  variant = 'quiet',
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <div className="space-y-2">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        let indicator = 'border-neutral-300';
        if (isSelected) {
          indicator = 'border-neutral-900 bg-neutral-900';
          if (variant === 'expressive') indicator = 'border-[#2547E8] bg-[#2547E8]';
          if (variant === 'nocturne') indicator = 'border-white bg-white';
        }

        return (
          <label
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
          >
            <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${indicator}`}>
              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white dark:bg-neutral-950" />}
            </div>
            <div className="text-xs">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{opt.label}</span>
              {opt.description && <p className="text-neutral-500 mt-0.5">{opt.description}</p>}
            </div>
          </label>
        );
      })}
    </div>
  );
}
