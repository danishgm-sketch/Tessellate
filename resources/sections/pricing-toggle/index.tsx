import React, { useState } from 'react';

export type PricingToggleVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingToggleProps {
  variant?: PricingToggleVariant;
}

export function PricingToggle({ variant = 'quiet' }: PricingToggleProps) {
  const [annual, setAnnual] = useState(false);

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const price = annual ? '£14' : '£18';

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-8">Flexible Billing</h2>

        <div className="flex items-center gap-3 mb-12 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${!annual ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'opacity-60'}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${annual ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'opacity-60'}`}
          >
            Annual <span className="text-[10px] text-emerald-500 font-mono">(Save 20%)</span>
          </button>
        </div>

        <div className={`w-full max-w-sm p-8 rounded-2xl border text-center transition-all ${card}`}>
          <span className="font-bold text-sm block mb-2">Team Pro Plan</span>
          <div className="text-4xl font-mono font-bold mb-4">{price}<span className="text-xs font-normal">/mo</span></div>
          <p className="text-xs opacity-75 mb-6">Billed {annual ? 'annually (£168/yr)' : 'monthly'}. Cancel anytime.</p>
          <button type="button" className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
            Choose Plan
          </button>
        </div>
      </div>
    </section>
  );
}
