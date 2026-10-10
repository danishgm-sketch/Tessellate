import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, position = 'top', children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={twMerge(
            clsx(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-[#111217] px-2.5 py-1 text-xs font-medium text-white shadow-md transition-opacity',
              positionStyles,
              className
            )
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
