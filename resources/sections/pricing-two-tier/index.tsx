import React from 'react';

export type PricingTwoTierVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingTwoTierProps {
  variant?: PricingTwoTierVariant;
}

export function PricingTwoTier({ variant = 'quiet' }: PricingTwoTierProps) {
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
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Choose Your Plan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-8 rounded-2xl border flex flex-col justify-between ${card}`}>
            <div>
              <span className="font-bold text-lg mb-2 block">Starter Edition</span>
              <div className="text-4xl font-mono font-bold mb-4">Free</div>
              <p className="text-xs sm:text-sm opacity-75 mb-6">Local development and individual exploration.</p>
            </div>
            <button type="button" className="w-full py-2.5 rounded-lg border text-xs font-semibold">Start Free</button>
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col justify-between ${card}`}>
            <div>
              <span className="font-bold text-lg mb-2 block">Organization Pro</span>
              <div className="text-4xl font-mono font-bold mb-4">£29<span className="text-xs font-normal">/mo</span></div>
              <p className="text-xs sm:text-sm opacity-75 mb-6">Centralized token libraries, audit logs, and priority updates.</p>
            </div>
            <button type="button" className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">Upgrade Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}
