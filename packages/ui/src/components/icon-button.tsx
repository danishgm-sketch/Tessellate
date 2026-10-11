import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
  children: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'tertiary', size = 'md', className, children, 'aria-label': ariaLabel, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer select-none ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:ring-offset-2 ' +
      'disabled:pointer-events-none disabled:opacity-50';

    const sizeStyles = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-9 h-9 text-sm',
      lg: 'w-[42px] h-[42px] text-base',
    }[size];

    const variantStyles = {
      primary: 'bg-[#2547E8] text-white hover:bg-[#1E3CCD]',
      secondary:
        'bg-[#FAF9F6] text-[#111217] border border-[#D9D6CF] hover:bg-[#ECE9E2] dark:bg-[#171B21] dark:text-[#F5F7FA] dark:border-[#272C34] dark:hover:bg-[#1C2128]',
      tertiary:
        'bg-transparent text-[#62666F] hover:text-[#111217] hover:bg-black/5 dark:text-[#A8AFBA] dark:hover:text-[#F5F7FA] dark:hover:bg-white/5',
    }[variant];

    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className={twMerge(clsx(baseStyles, sizeStyles, variantStyles, className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
