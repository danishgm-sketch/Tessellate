import React from 'react';

export type BillingOverviewVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BillingOverviewProps {
  variant?: BillingOverviewVariant;
}

export function BillingOverview({ variant = 'quiet' }: BillingOverviewProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-4">Subscription & Billing</h3>
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex justify-between items-center mb-6 text-xs">
        <div>
          <span className="font-bold">Team Pro Subscription</span>
          <div className="text-[11px] opacity-60">Renews on Nov 1, 2026 • £18/month</div>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold font-mono">ACTIVE</span>
      </div>
      <button type="button" className="px-4 py-2 rounded-lg border text-xs font-semibold">
        Update Payment Method
      </button>
    </div>
  );
}
