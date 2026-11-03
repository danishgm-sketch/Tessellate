import React from 'react';

export type PlanFeatureMatrixVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PlanFeatureMatrixProps {
  variant?: PlanFeatureMatrixVariant;
}

export function PlanFeatureMatrix({ variant = 'quiet' }: PlanFeatureMatrixProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let tableBorder = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    tableBorder = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tableBorder = 'border-[#2E3440]';
  }

  const items = [
    { group: 'Core features', feature: 'Feature group one', free: 'Yes', pro: 'Yes' },
    { group: 'Core features', feature: 'Feature group two', free: 'Yes', pro: 'Yes' },
    { group: 'Optional features', feature: 'Feature group three', free: 'No', pro: 'Yes' },
    { group: 'Optional features', feature: 'Feature group four', free: 'No', pro: 'Yes' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Example feature matrix</h2>
        <p className="mx-auto -mt-6 mb-8 max-w-2xl text-center text-sm opacity-75">Illustrative example only. Replace sample prices, tiers, and included features with your published terms.</p>

        <div className={`overflow-x-auto rounded-xl border ${tableBorder}`}>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b bg-neutral-100/60 dark:bg-neutral-900/60 font-mono text-xs uppercase">
              <tr>
                <th className="p-4">Group</th>
                <th className="p-4">Feature</th>
                <th className="p-4">Plan A (example)</th>
                <th className="p-4">Plan B (example)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {items.map((it) => (
                <tr key={it.feature} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                  <td className="p-4 font-mono text-[11px] opacity-60 uppercase">{it.group}</td>
                  <td className="p-4 font-semibold">{it.feature}</td>
                  <td className="p-4 font-mono">{it.free}</td>
                  <td className="p-4 font-mono text-emerald-600 dark:text-emerald-400">{it.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
