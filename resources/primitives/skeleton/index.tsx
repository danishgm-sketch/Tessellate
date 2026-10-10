import React from 'react';

export type SkeletonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

export function Skeleton({ variant = 'quiet', className = 'h-4 w-full' }: SkeletonProps) {
  let theme = 'bg-neutral-200';
  if (variant === 'expressive') theme = 'bg-neutral-200/80';
  if (variant === 'nocturne') theme = 'bg-neutral-800';

  return (
    <div className={`animate-pulse rounded-md ${theme} ${className}`} />
  );
}
