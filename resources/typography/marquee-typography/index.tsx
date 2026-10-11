import React from 'react';

export type MarqueeTypographyVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MarqueeTypographyProps {
  items?: string[];
  speedSec?: number;
  variant?: MarqueeTypographyVariant;
  children?: React.ReactNode;
}

export function MarqueeTypography({
  items = ['ZERO LOCK-IN', 'MIT LICENSED', 'DETERMINISTIC COMPOSITION', '972 CONFIGURATIONS', 'WCAG AA VERIFIED'],
  variant = 'quiet',
  children,
}: MarqueeTypographyProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const dotColor =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-400';

  return (
    <div className={`p-6 rounded-xl border max-w-4xl mx-auto overflow-hidden transition-colors ${containerBg}`}>
      <div className="flex gap-8 whitespace-nowrap overflow-x-auto py-2 scrollbar-none font-mono text-xs md:text-sm tracking-wider font-semibold uppercase">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 shrink-0">
            <span>{item}</span>
            <span className={dotColor}>✦</span>
          </div>
        ))}
        {items.map((item, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-4 shrink-0 opacity-70">
            <span>{item}</span>
            <span className={dotColor}>✦</span>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
