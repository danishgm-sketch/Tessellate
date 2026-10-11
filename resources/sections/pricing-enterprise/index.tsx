import React from 'react';

export type PricingEnterpriseVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingEnterpriseProps {
  variant?: PricingEnterpriseVariant;
}

export function PricingEnterprise({ variant = 'quiet' }: PricingEnterpriseProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 sm:p-12 rounded-3xl border text-center flex flex-col items-center ${card}`}>
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">High-Touch Security</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise Custom Contracts</h2>
          <p className="text-xs sm:text-sm opacity-80 max-w-lg mb-8 leading-relaxed">
            Includes custom VPC deployment, isolated R2 registries, custom SOC2 attestations, and 24/7 dedicated engineering support.
          </p>
          <button type="button" className="px-6 py-3 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs tracking-wider uppercase">
            Schedule Enterprise Consultation
          </button>
        </div>
      </div>
    </section>
  );
}
