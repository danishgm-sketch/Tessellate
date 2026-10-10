import React from 'react';

export type SeparatorVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SeparatorProps {
  variant?: SeparatorVariant;
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function Separator({
  variant = 'quiet',
  orientation = 'horizontal',
  label,
  className = '',
}: SeparatorProps) {
  let line = 'bg-neutral-200';
  if (variant === 'expressive') line = 'bg-[#D9D6CF]';
  if (variant === 'nocturne') line = 'bg-[#2E3440]';

  if (orientation === 'vertical') {
    return <div className={`inline-block h-full w-px ${line} ${className}`} />;
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 w-full ${className}`}>
        <div className={`h-px flex-1 ${line}`} />
        <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{label}</span>
        <div className={`h-px flex-1 ${line}`} />
      </div>
    );
  }

  return <div className={`h-px w-full ${line} ${className}`} />;
}
