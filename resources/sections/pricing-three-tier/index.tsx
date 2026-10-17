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
    { name: 'Free Core', price: '£0', desc: 'Complete access to all 324 open source resources.', featured: false },
    { name: 'Team Sync', price: '£18', desc: 'Cloud project sharing, checkpoint history, and team roles.', featured: true },
    { name: 'Enterprise', price: 'Custom', desc: 'SSO, dedicated SLA, custom DNA tokens, and private registry.', featured: false },
  ];

  return (
    <section className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl @sm:text-5xl font-bold tracking-tight text-center mb-16">Simple, Honest Pricing</h2>

        <div className="grid grid-cols-1 @md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((t) => (
            <div key={t.name} className={`p-8 rounded-[var(--tess-radius-xl,8px)] border flex flex-col justify-between transition-all ${t.featured ? featuredCard : card}`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg">{t.name}</span>
                  {t.featured && <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">Recommended</span>}
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
              {!onSelectPlan && <span id={`pricing-${t.name.toLowerCase().replaceAll(' ', '-')}-action-help`} className="sr-only">Connect a plan selection action before enabling checkout.</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
