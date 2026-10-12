import React from 'react';

export type SelectVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: SelectVariant;
  label?: string;
  options: SelectOption[];
}

export function Select({ variant = 'quiet', label, options = [], className = '', id, ...rest }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  let theme = 'border-neutral-300 bg-white text-neutral-900 focus:border-neutral-900 focus:ring-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] bg-white text-neutral-900 focus:border-[#2547E8] focus:ring-[#2547E8] shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] bg-[#11141B] text-white focus:border-white focus:ring-white';
  }

  return (
    <div className="w-full space-y-1.5">
      {label && <label htmlFor={selectId} className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">{label}</label>}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-[var(--tess-radius-lg,8px)] border px-3 py-2 pr-8 text-sm outline-none transition-all focus:ring-1 ${theme} ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50">
          ▼
        </span>
      </div>
    </div>
  );
}
