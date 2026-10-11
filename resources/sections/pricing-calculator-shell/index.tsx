import React, { useState } from 'react';

export type PricingCalculatorShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PricingCalculatorShellProps {
  variant?: PricingCalculatorShellVariant;
}

export function PricingCalculatorShell({ variant = 'quiet' }: PricingCalculatorShellProps) {
  const [teamSize, setTeamSize] = useState(5);

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const total = teamSize * 15;

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Team Cost Calculator</h2>

        <div className={`w-full max-w-lg p-8 rounded-2xl border transition-all ${card}`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold">Active Developers:</span>
            <span className="font-mono font-bold text-lg">{teamSize} seats</span>
          </div>

          <input
            type="range"
            min={1}
            max={50}
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            className="w-full mb-8 cursor-pointer"
          />

          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 flex items-center justify-between">
            <span className="text-xs opacity-75">Estimated Invoice:</span>
            <span className="text-3xl font-mono font-bold">£{total}/mo</span>
          </div>
        </div>
      </div>
    </section>
  );
}
