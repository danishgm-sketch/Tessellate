import React from 'react';

export type PricingThreeTierVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingThreeTierProps {
  variant?: PricingThreeTierVariant;
  onSelectPlan?: (plan: string) => void;
}

export function PricingThreeTier({ variant = 'quiet', onSelectPlan }: PricingThreeTierProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';
  let featuredCard = 'bg-white border-neutral-900 shadow-lg ring-1 ring-neutral-900';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-neutral-50/50 border-neutral-200';
    featuredCard = 'bg-white border-[#2547E8] shadow-xl ring-2 ring-[#2547E8]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
    featuredCard = 'bg-[#151921] border-cyan-400 shadow-2xl ring-1 ring-cyan-400';
  }

  const tiers = [
    { name: 'Starter example', price: '£0', desc: 'Example of a free tier. Replace this description with your offer.', featured: false },
    { name: 'Team example', price: '£18', desc: 'Example team tier. Replace the price and features with your offer.', featured: true },
    { name: 'Scale example', price: 'Custom', desc: 'Example custom tier. Replace the scope, price, and terms with your offer.', featured: false },
  ];

  return (
    <section className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl @sm:text-5xl font-bold tracking-tight text-center mb-16">Example plans</h2>
        <p className="mx-auto -mt-10 mb-10 max-w-2xl text-center text-sm opacity-75">Illustrative example only. Replace sample prices, tiers, and included features with your published terms.</p>

        <div className="grid grid-cols-1 @md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((t) => (
            <div key={t.name} className={`p-8 rounded-[var(--tess-radius-xl,8px)] border flex flex-col justify-between transition-all ${t.featured ? featuredCard : card}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg">{t.name}</span>
                  {t.featured && <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${variant === 'nocturne' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-500/10 text-emerald-800'}`}>Recommended</span>}
                </div>
                <div className="text-4xl font-mono font-bold mb-4">{t.price}</div>
                <p className="text-xs @sm:text-sm opacity-75 mb-6">{t.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectPlan?.(t.name)}
                disabled={!onSelectPlan}
                aria-describedby={!onSelectPlan ? `pricing-${t.name.toLowerCase().replaceAll(' ', '-')}-action-help` : undefined}
                className={`w-full py-3 rounded-[var(--tess-radius-lg,8px)] text-xs font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  t.featured ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'border hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                Get Started
              </button>
              {!onSelectPlan && <span id={`pricing-${t.name.toLowerCase().replaceAll(' ', '-')}-action-help`} className="mt-3 block text-center text-xs opacity-75">Connect a plan selection action to enable this example button.</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
