import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  density?: 'compact' | 'standard';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ density = 'standard', options, children, className, ...props }, ref) => {
    const baseStyles =
      'w-full appearance-none rounded-lg border border-[#D9D6CF] bg-[#FFFFFF] text-[#111217] transition-colors ' +
      'focus:border-[#2547E8] focus:outline-none focus:ring-2 focus:ring-[#2547E8]/20 ' +
      'disabled:cursor-not-allowed disabled:bg-[#ECE9E2] disabled:opacity-60 ' +
      'dark:border-[#272C34] dark:bg-[#111419] dark:text-[#F5F7FA] dark:focus:border-[#6782FF] dark:focus:ring-[#6782FF]/20';

    const densityStyles = {
      compact: 'h-8 px-2.5 pr-8 text-xs',
      standard: 'h-[38px] px-3.5 pr-10 text-sm',
    }[density];

    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          className={twMerge(clsx(baseStyles, densityStyles, className))}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#8B8F97] dark:text-[#707986]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
