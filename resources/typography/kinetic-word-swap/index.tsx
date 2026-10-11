import React, { useState, useEffect } from 'react';

export type KineticWordSwapVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KineticWordSwapProps {
  prefix?: string;
  words?: string[];
  suffix?: string;
  intervalMs?: number;
  variant?: KineticWordSwapVariant;
  children?: React.ReactNode;
}

export function KineticWordSwap({
  prefix = 'Design systems composed for',
  words = ['precision', 'speed', 'resilience', 'agents'],
  suffix = 'at production scale',
  intervalMs = 2400,
  variant = 'quiet',
  children,
}: KineticWordSwapProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);

  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const badgeColor =
    variant === 'nocturne'
      ? 'text-cyan-400 bg-cyan-950/60 border border-cyan-800'
      : variant === 'expressive'
      ? 'text-indigo-600 bg-indigo-50 border border-indigo-200'
      : 'text-neutral-900 bg-neutral-100 border border-neutral-200';

  return (
    <div className={`p-8 md:p-12 rounded-xl border max-w-4xl mx-auto space-y-4 transition-colors ${containerBg}`}>
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight leading-normal">
        {prefix}{' '}
        <span
          key={index}
          className={`inline-block px-3 py-1 rounded-md font-mono transition-all duration-300 animate-fadeIn ${badgeColor}`}
          aria-live="polite"
        >
          {words[index]}
        </span>{' '}
        {suffix}.
      </h2>
      <p className="text-xs text-neutral-500 font-mono">
        Active cycle: word {index + 1} of {words.length}
      </p>
      {children}
    </div>
  );
}
