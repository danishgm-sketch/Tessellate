import React, { useState } from 'react';

export type CodeHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CodeHeroProps {
  variant?: CodeHeroVariant;
  headline?: string;
  installCommand?: string;
}

export function CodeHero({
  variant = 'quiet',
  headline = 'Install cleanly. Zero lock-in. Full TypeScript source.',
  installCommand = 'npx @tessellate/cli add editorial-hero',
}: CodeHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let term = 'bg-[#18181B] text-neutral-100 border-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/40 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    term = 'bg-[#0E1528] text-blue-100 border-blue-900/40 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    term = 'bg-[#12161F] text-cyan-50 border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8 max-w-2xl">{headline}</h1>

        <div className={`w-full max-w-2xl rounded-xl border p-4 font-mono text-xs sm:text-sm text-left shadow-lg ${term}`}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 text-xs opacity-70">
            <span>Terminal</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">$</span>
            <span>{installCommand}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
