import React, { useState } from 'react';

export type SplitProductHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitProductHeroProps {
  variant?: SplitProductHeroVariant;
  badge?: string;
  headline?: string;
  description?: string;
}

export function SplitProductHero({
  variant = 'quiet',
  badge = 'Validated Composability',
  headline = 'Mutate layout architecture with zero bundle penalty.',
  description = 'Every component conforms to deterministic DNA schemas, guaranteeing visual harmony without manual CSS overrides.',
}: SplitProductHeroProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'manifest' | 'output'>('tokens');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-sm';
  let tabActive = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-br from-white via-blue-50/30 to-amber-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-lg';
    tabActive = 'bg-[#2547E8] text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-xl';
    tabActive = 'bg-cyan-500 text-black font-semibold';
  }

  return (
    <section className={`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500 mb-4">{badge}</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">{headline}</h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">{description}</p>
          <div className="flex items-center gap-4">
            <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity">
              Launch Sandbox
            </button>
            <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              Documentation
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border transition-all ${card}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-6 text-xs">
            <span className="font-mono font-semibold">Tessellate Engine</span>
            <div className="flex gap-1.5">
              {(['tokens', 'manifest', 'output'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded capitalize text-xs transition-colors ${
                    activeTab === tab ? tabActive : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="font-mono text-xs p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900/80 leading-relaxed overflow-x-auto min-h-[160px]">
            {activeTab === 'tokens' && (
              <pre className="text-emerald-600 dark:text-emerald-400">
                {`{
  "theme": "nocturne",
  "density": 85,
  "curvature": "sharp",
  "tokens": 42
}`}
              </pre>
            )}
            {activeTab === 'manifest' && (
              <pre className="text-blue-600 dark:text-blue-400">
                {`{
  "resourceType": "section",
  "status": "verified",
  "quality": 96
}`}
              </pre>
            )}
            {activeTab === 'output' && (
              <pre className="text-purple-600 dark:text-purple-400">
                {`// Direct React + Tailwind export
export function RenderedSection() {
  return <div className="p-4" />
}`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
