import React from 'react';

export type BadgeVariant = 'quiet' | 'expressive' | 'nocturne';
export type BadgeIntent = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  variant?: BadgeVariant;
  intent?: BadgeIntent;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'quiet',
  intent = 'neutral',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  let theme = 'bg-neutral-100 text-neutral-800 border-neutral-200';
  if (intent === 'primary') theme = 'bg-neutral-900 text-white border-neutral-900';
  if (intent === 'success') theme = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (intent === 'danger') theme = 'bg-rose-50 text-rose-700 border-rose-200';

  if (variant === 'expressive') {
    if (intent === 'primary') theme = 'bg-[#E7EBFF] text-[#2547E8] border-[#2547E8]/30 font-semibold';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#171A21] text-neutral-300 border-[#2E3440]';
    if (intent === 'primary') theme = 'bg-white text-neutral-950 border-white font-semibold';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none ${theme} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
