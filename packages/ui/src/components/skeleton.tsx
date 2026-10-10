import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangle' | 'circle' | 'text';
}

export function Skeleton({ variant = 'rectangle', className, ...props }: SkeletonProps) {
  const variantStyles = {
    rectangle: 'rounded-xl',
    circle: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={twMerge(
        clsx(
          'animate-pulse bg-[#ECE9E2] dark:bg-[#1C2128]',
          variantStyles,
          className
        )
      )}
      {...props}
    />
  );
}
