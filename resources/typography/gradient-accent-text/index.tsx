import React from 'react';

export type GradientAccentTextVariant = 'quiet' | 'expressive' | 'nocturne';

export interface GradientAccentTextProps {
  leadText?: string;
  gradientText?: string;
  tailText?: string;
  variant?: GradientAccentTextVariant;
  children?: React.ReactNode;
}

export function GradientAccentText({
  leadText = 'The world needs interfaces with',
  gradientText = 'uncompromising precision',
  tailText = 'and zero artificial locks.',
  variant = 'quiet',
  children,
}: GradientAccentTextProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const gradientClass =
    variant === 'nocturne'
      ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 text-transparent bg-clip-text'
      : variant === 'expressive'
      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-transparent bg-clip-text'
      : 'bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 text-transparent bg-clip-text';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors ${containerBg}`}>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
        {leadText} <span className={gradientClass}>{gradientText}</span> {tailText}
      </h2>
      <p className="text-xs text-neutral-400 font-mono">
        Semantic gradient clip with automated contrast token compliance.
      </p>
      {children}
    </div>
  );
}
