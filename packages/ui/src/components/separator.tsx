import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({ orientation = 'horizontal', className }: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={twMerge(
        clsx(
          'bg-[#D9D6CF] dark:bg-[#272C34] shrink-0',
          orientation === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full',
          className
        )
      )}
    />
  );
}
