import React, { useState } from 'react';

export type SplitProductHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitProductHeroProps {
  variant?: SplitProductHeroVariant;
  badge?: string;
  headline?: string;
  description?: string;
  primaryCta?: {label:string;href:string};
  secondaryCta?: {label:string;href:string};
  panelTitle?:string;
  panels?:Array<{id:string;label:string;text:string}>;
}

export function SplitProductHero({
  variant = 'quiet',
  badge = 'Validated Composability',
  headline = 'Mutate layout architecture with zero bundle penalty.',
  description = 'Every component conforms to deterministic DNA schemas, guaranteeing visual harmony without manual CSS overrides.',
  primaryCta={label:'Open Compose',href:'/compose'},
  secondaryCta={label:'Documentation',href:'/docs'},
  panelTitle='Example interface system',
  panels=[{id:'tokens',label:'Tokens',text:'Semantic colour, typography, spacing and motion.'},{id:'manifest',label:'Manifest',text:'Validated resource references and editable content.'},{id:'output',label:'Output',text:'Portable React + TypeScript + Tailwind source.'}],
}: SplitProductHeroProps) {
  const [activeTab, setActiveTab] = useState(panels[0]?.id ?? '');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-sm';
  let tabActive = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-br from-white via-blue-50/30 to-amber-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-lg';
    tabActive = 'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-xl';
    tabActive = 'bg-[var(--tess-accent-primary,#06B6D4)] text-[var(--tess-accent-ink,#111217)] font-semibold';
  }

  return (
    <section className={`relative w-full py-20 @sm:py-28 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 @lg:grid-cols-2 gap-12 @lg:gap-16 items-center">
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-widest font-semibold text-[var(--tess-ink-muted,#62666F)] mb-4">{badge}</span>
          <h1 className="text-4xl @sm:text-5xl font-bold tracking-tight leading-tight mb-6">{headline}</h1>
          <p className="text-base @sm:text-lg text-[var(--tess-ink-secondary,#62666F)] dark:text-neutral-400 mb-8 leading-relaxed">{description}</p>
          <div className="flex items-center gap-4">
            <a href={primaryCta.href} className="px-5 py-2.5 rounded-[var(--tess-radius-lg,8px)] text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity">
              {primaryCta.label}
            </a>
            <a href={secondaryCta.href} className="px-5 py-2.5 rounded-[var(--tess-radius-lg,8px)] text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              {secondaryCta.label}
            </a>
          </div>
        </div>

        <div className={`p-6 rounded-[var(--tess-radius-xl,8px)] border transition-all ${card}`}>
          <div className="flex items-center justify-between border-b pb-4 mb-6 text-xs">
            <span className="font-mono font-semibold">{panelTitle}</span>
            <div className="flex gap-1.5">
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setActiveTab(panel.id)} aria-pressed={activeTab===panel.id}
                  className={`px-3 py-1 rounded capitalize text-xs transition-colors ${
                    activeTab === panel.id ? tabActive : 'bg-neutral-100 dark:bg-neutral-800 text-[var(--tess-ink-secondary,#62666F)] dark:text-neutral-400'
                  }`}
                >
                  {panel.label}
                </button>
              ))}
            </div>
          </div>
          <div className="font-mono text-xs p-4 rounded-[var(--tess-radius-lg,8px)] bg-neutral-100 dark:bg-neutral-900/80 leading-relaxed overflow-x-auto min-h-[160px]">
            <p className="whitespace-pre-wrap">{panels.find(panel=>panel.id===activeTab)?.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
