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
      <h3 className="text-base font-bold mb-1">Example subscription</h3>
      <p className="mb-4 text-xs opacity-70">Sample account details and pricing. Replace with live billing data before use.</p>
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 flex justify-between items-center mb-6 text-xs">
        <div>
          <span className="font-bold">Example team plan</span>
          <div className="text-[11px] opacity-60">£18/month · illustrative price</div>
        </div>
        <span className="px-2 py-0.5 rounded bg-neutral-500/10 text-neutral-600 font-bold font-mono">EXAMPLE</span>
      </div>
      <button type="button" disabled aria-describedby="billing-payment-action-help" className="px-4 py-2 rounded-lg border text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60">
        Connect payment action
      </button>
      <p id="billing-payment-action-help" className="mt-2 text-xs opacity-70">Payment updates are not connected in this example.</p>
    </div>
  );
}
