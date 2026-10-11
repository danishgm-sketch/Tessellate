import React from 'react';

export type EditorialDisplayStackVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialDisplayStackProps {
  kicker?: string;
  headline?: string;
  accentClause?: string;
  subdeck?: string;
  variant?: EditorialDisplayStackVariant;
  children?: React.ReactNode;
}

export function EditorialDisplayStack({
  kicker = 'SYSTEM ARCHITECTURE • V2.4',
  headline = 'Interface composition without the',
  accentClause = 'cognitive tax of chaos',
  subdeck = 'A validated resource grammar that translates product intent into coherent, production-ready interface systems.',
  variant = 'quiet',
  children,
}: EditorialDisplayStackProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const kickerColor =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-500';

  const accentColor =
    variant === 'nocturne'
      ? 'text-cyan-300 italic'
      : variant === 'expressive'
      ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 italic'
      : 'text-neutral-700 italic font-serif';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors ${containerBg}`}>
      <div className={`text-xs font-mono font-medium tracking-wider uppercase ${kickerColor}`}>
        {kicker}
      </div>

      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
        {headline} <span className={accentColor}>{accentClause}</span>.
      </h1>

      <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
        {subdeck}
      </p>

      {children}
    </div>
  );
}
