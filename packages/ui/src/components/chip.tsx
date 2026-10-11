import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'subtle';
  selected?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

export function Chip({
  variant = 'default',
  selected = false,
  onRemove,
  className,
  children,
  ...props
}: ChipProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors select-none';

  const variantStyles = {
    default: selected
      ? 'bg-[#2547E8] text-white'
      : 'bg-[#ECE9E2] text-[#111217] hover:bg-[#E3DFD5] dark:bg-[#1C2128] dark:text-[#F5F7FA] dark:hover:bg-[#272C34]',
    accent:
      'bg-[#E7EBFF] text-[#2547E8] border border-[#2547E8]/20 dark:bg-[#1C2752] dark:text-[#6782FF] dark:border-[#6782FF]/30',
    subtle:
      'bg-transparent text-[#62666F] border border-[#D9D6CF] dark:border-[#272C34] dark:text-[#A8AFBA]',
  }[variant];

  return (
    <span className={twMerge(clsx(baseStyles, variantStyles, className))} {...props}>
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-current opacity-60 hover:opacity-100 cursor-pointer focus:outline-none"
          aria-label="Remove"
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor">
            <path d="M3 3l6 6M9 3l-6 6" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
