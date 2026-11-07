import React from 'react';

export type CapabilityTier = 'Core' | 'Beta' | 'Lab';

const TIER_STYLES: Record<CapabilityTier, string> = {
  Core: 'border-[#C8D3FF] bg-[#E7EBFF] text-[#2547E8] dark:border-[#354A9A] dark:bg-[#1C2752] dark:text-[#B6C4FF]',
  Beta: 'border-[#E9D3A7] bg-[#F8F0DF] text-[#6D4A12] dark:border-[#735A2B] dark:bg-[#352A17] dark:text-[#F1D59B]',
  Lab: 'border-[#C7D9A2] bg-[#EDF4DC] text-[#3E5B16] dark:border-[#526B2B] dark:bg-[#263416] dark:text-[#D2E7A5]',
};

const TIER_DESCRIPTIONS: Record<CapabilityTier, string> = {
  Core: 'Core product capability.',
  Beta: 'Beta capability. Useful, with known limitations while it is being hardened.',
  Lab: 'Experimental Lab capability. Isolated from Core project state unless explicitly enabled.',
};

export function CapabilityBadge({
  tier,
  className = '',
}: {
  tier: CapabilityTier;
  className?: string;
}) {
  return (
    <span
      aria-label={`Capability tier: ${tier}. ${TIER_DESCRIPTIONS[tier]}`}
      data-capability-tier={tier.toLowerCase()}
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${TIER_STYLES[tier]} ${className}`}
    >
      {tier}
    </span>
  );
}
