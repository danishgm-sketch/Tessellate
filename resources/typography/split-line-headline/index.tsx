import React from 'react';

export type SplitLineHeadlineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitLineHeadlineProps {
  line1?: string;
  line2?: string;
  line3?: string;
  variant?: SplitLineHeadlineVariant;
  children?: React.ReactNode;
}

export function SplitLineHeadline({
  line1 = 'Composing systems',
  line2 = 'not isolated fragments',
  line3 = 'for humans and agents.',
  variant = 'quiet',
  children,
}: SplitLineHeadlineProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const line2Class =
    variant === 'nocturne'
      ? 'text-cyan-400 pl-8 md:pl-16'
      : variant === 'expressive'
      ? 'text-indigo-600 pl-8 md:pl-16 font-serif italic'
      : 'text-neutral-500 pl-8 md:pl-16 font-serif italic';

  const line3Class = 'pl-16 md:pl-32';

  return (
    <div className={`p-8 md:p-14 rounded-xl border max-w-4xl mx-auto space-y-3 transition-colors ${containerBg}`}>
      <div className="text-3xl md:text-5xl font-black tracking-tight">{line1}</div>
      <div className={`text-3xl md:text-5xl font-black tracking-tight ${line2Class}`}>{line2}</div>
      <div className={`text-3xl md:text-5xl font-black tracking-tight ${line3Class}`}>{line3}</div>
      {children}
    </div>
  );
}
