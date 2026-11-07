import React, { useState } from 'react';

export type InteractiveDemoHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InteractiveDemoHeroProps {
  variant?: InteractiveDemoHeroVariant;
  headline?: string;
  subheadline?: string;
}

export function InteractiveDemoHero({
  variant = 'quiet',
  headline = 'Interactive composition at your fingertips.',
  subheadline = 'Change this sample card’s spacing and color theme with the controls below.',
}: InteractiveDemoHeroProps) {
  const [scale, setScale] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let demoCard = 'bg-white border-neutral-200 shadow-md';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/30 text-neutral-950 border-[#D9D6CF]';
    demoCard = 'bg-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    demoCard = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{headline}</h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">{subheadline}</p>
      </div>

      <div className={`max-w-3xl mx-auto rounded-2xl border p-6 sm:p-8 transition-all ${demoCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span>Density:</span>
            {(['compact', 'normal', 'relaxed'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  scale === s ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span>Mode:</span>
            <button
              type="button"
              onClick={() => setActiveTheme(activeTheme === 'light' ? 'dark' : 'light')}
              className="px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-800 capitalize"
            >
              {activeTheme}
            </button>
          </div>
        </div>

        <div className={`rounded-xl border p-6 transition-all ${
          activeTheme === 'dark' ? 'bg-[#0B0D10] text-white border-neutral-800' : 'bg-neutral-50 text-neutral-900 border-neutral-200'
        } ${scale === 'compact' ? 'space-y-2' : scale === 'relaxed' ? 'space-y-6' : 'space-y-4'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-sm">Preview Workspace</span>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono">PREVIEW</span>
          </div>
          <p className="text-xs opacity-75">
            Sample view: {scale} spacing in {activeTheme} theme. These controls affect this card only.
          </p>
        </div>
      </div>
    </section>
  );
}
