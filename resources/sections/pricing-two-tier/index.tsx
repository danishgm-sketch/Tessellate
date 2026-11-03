import React from 'react';

export type PricingTwoTierVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingTwoTierProps {
  variant?: PricingTwoTierVariant;
  onSelectPlan?: (plan: string) => void;
}

export function PricingTwoTier({ variant = 'quiet', onSelectPlan }: PricingTwoTierProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Example plan comparison</h2>
        <p className="mx-auto -mt-6 mb-8 max-w-2xl text-center text-sm opacity-75">Illustrative example only. Replace sample prices, tiers, and included features with your published terms.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-8 rounded-2xl border flex flex-col justify-between ${card}`}>
            <div>
              <span className="font-bold text-lg mb-2 block">Starter example</span>
              <div className="text-4xl font-mono font-bold mb-4">Free</div>
              <p className="text-xs sm:text-sm opacity-75 mb-6">Local development and individual exploration.</p>
            </div>
            <button type="button" onClick={() => onSelectPlan?.('Starter example')} disabled={!onSelectPlan} aria-describedby={!onSelectPlan ? "pricing-two-tier-starter-help" : undefined} className="w-full py-2.5 rounded-lg border text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60">{onSelectPlan ? 'Choose Starter' : 'Connect plan action'}</button>
            {!onSelectPlan && <p id="pricing-two-tier-starter-help" className="mt-3 text-center text-xs opacity-75">Connect a selection action to enable this example button.</p>}
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col justify-between ${card}`}>
            <div>
              <span className="font-bold text-lg mb-2 block">Team example</span>
              <div className="text-4xl font-mono font-bold mb-4">£29<span className="text-xs font-normal">/mo</span></div>
              <p className="text-xs sm:text-sm opacity-75 mb-6">Centralized token libraries, audit logs, and priority updates.</p>
            </div>
            <button type="button" onClick={() => onSelectPlan?.('Team example')} disabled={!onSelectPlan} aria-describedby={!onSelectPlan ? "pricing-two-tier-team-help" : undefined} className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60">{onSelectPlan ? 'Choose Team' : 'Connect plan action'}</button>
            {!onSelectPlan && <p id="pricing-two-tier-team-help" className="mt-3 text-center text-xs opacity-75">Connect a selection action to enable this example button.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
