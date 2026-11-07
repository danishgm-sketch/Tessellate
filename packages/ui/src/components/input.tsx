import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  density?: 'compact' | 'standard';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ density = 'standard', className, type = 'text', ...props }, ref) => {
    const baseStyles =
      'w-full rounded-lg border border-[#D9D6CF] bg-[#FFFFFF] text-[#111217] transition-colors ' +
      'placeholder:text-[var(--text-muted)] ' +
      'focus:border-[#2547E8] focus:outline-none focus:ring-2 focus:ring-[#2547E8]/20 ' +
      'disabled:cursor-not-allowed disabled:bg-[#ECE9E2] disabled:opacity-60 ' +
      'dark:border-[#272C34] dark:bg-[#111419] dark:text-[#F5F7FA] dark:placeholder:text-[var(--text-muted)] ' +
      'dark:focus:border-[#6782FF] dark:focus:ring-[#6782FF]/20';

    const densityStyles = {
      compact: 'h-8 px-2.5 text-xs',
      standard: 'h-[38px] px-3.5 text-sm',
    }[density];

    return (
      <input
        ref={ref}
        type={type}
        className={twMerge(clsx(baseStyles, densityStyles, className))}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
