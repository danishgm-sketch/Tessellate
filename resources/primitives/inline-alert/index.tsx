import React from 'react';

export type InlineAlertVariant = 'quiet' | 'expressive' | 'nocturne';
export type InlineAlertIntent = 'info' | 'success' | 'warning' | 'danger';

export interface InlineAlertProps {
  variant?: InlineAlertVariant;
  intent?: InlineAlertIntent;
  title: string;
  description?: string;
  className?: string;
}

export function InlineAlert({
  variant = 'quiet',
  intent = 'info',
  title,
  description,
  className = '',
}: InlineAlertProps) {
  let theme = 'bg-neutral-50 border-neutral-200 text-neutral-800';
  if (intent === 'success') theme = 'bg-emerald-50 border-emerald-200 text-emerald-900';
  if (intent === 'warning') theme = 'bg-amber-50 border-amber-200 text-amber-900';
  if (intent === 'danger') theme = 'bg-rose-50 border-rose-200 text-rose-900';

  if (variant === 'nocturne') {
    theme = 'bg-[#171A21] border-[#2E3440] text-neutral-200';
    if (intent === 'danger') theme = 'bg-rose-950/40 border-rose-800 text-rose-200';
  }

  return (
    <div className={`w-full rounded-lg border p-3.5 text-xs space-y-1 ${theme} ${className}`}>
      <p className="font-semibold">{title}</p>
      {description && <p className="opacity-80 leading-relaxed">{description}</p>}
    </div>
  );
}
