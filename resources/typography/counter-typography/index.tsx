import React from 'react';

export type CounterTypographyVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CounterTypographyProps {
  value?: string;
  unit?: string;
  label?: string;
  deltaText?: string;
  variant?: CounterTypographyVariant;
  children?: React.ReactNode;
}

export function CounterTypography({
  value = '99.98',
  unit = '%',
  label = 'Deterministic system compliance across 972 canonical launch configurations',
  deltaText = '+14.2% YoY',
  variant = 'quiet',
  children,
}: CounterTypographyProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const deltaColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
      : 'text-neutral-700 bg-neutral-100 border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors ${containerBg}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums leading-none">
          {value}
        </span>
        <span className="text-3xl md:text-5xl font-bold text-neutral-400">
          {unit}
        </span>
        <span className={`ml-4 text-xs font-mono font-bold px-2 py-0.5 rounded border ${deltaColor}`}>
          {deltaText}
        </span>
      </div>

      <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed">
        {label}
      </p>
      {children}
    </div>
  );
}
