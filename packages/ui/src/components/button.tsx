import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none ' +
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2547E8] focus-visible:ring-offset-2 ' +
      'disabled:pointer-events-none disabled:opacity-50';

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-sm rounded-lg gap-2',
      lg: 'h-[42px] px-5 text-sm rounded-lg gap-2.5',
    }[size];

    const variantStyles = {
      primary:
        'bg-[#2547E8] text-white hover:bg-[#1E3CCD] active:bg-[#1A34B2] shadow-sm',
      secondary:
        'bg-[#FAF9F6] text-[#111217] border border-[#D9D6CF] hover:bg-[#ECE9E2] active:bg-[#E3DFD5] dark:bg-[#171B21] dark:text-[#F5F7FA] dark:border-[#272C34] dark:hover:bg-[#1C2128]',
      tertiary:
        'bg-transparent text-[#111217] hover:bg-black/5 active:bg-black/10 dark:text-[#F5F7FA] dark:hover:bg-white/5',
      destructive:
        'bg-[#C83D48] text-white hover:bg-[#B33540] active:bg-[#9E2E38] shadow-sm',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(baseStyles, sizeStyles, variantStyles, className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
