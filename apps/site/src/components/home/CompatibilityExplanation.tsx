import React from 'react';
import { Network, ShieldCheck, Scale } from 'lucide-react';

export function CompatibilityExplanation() {
  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
          Interface Mathematics
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
          Compatibility scoring & normalisation.
        </h2>
        <p className="text-lg text-[#62666F] font-normal leading-relaxed">
          How does Tessellate prevent components from clashing? Every combination is scored along multi-dimensional Design DNA vectors before rendering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-7 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-[#D9D6CF] flex items-center justify-center text-[#2547E8] shadow-sm">
            <Network className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#111217]">
            DNA Distance Vector
          </h3>
          <p className="text-sm text-[#62666F] leading-relaxed">
            Measures Euclidean distance between a component’s inherent aesthetic priors and your project’s target DNA. Discrepancies are flagged or automatically resolved.
          </p>
        </div>

        <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-7 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-[#D9D6CF] flex items-center justify-center text-[#12603F] shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#111217]">
            Hard Constraint Gates
          </h3>
          <p className="text-sm text-[#62666F] leading-relaxed">
            Non-negotiable rules: WCAG contrast floors cannot drop below AA (or AAA when requested), bundle budgets must stay under performance caps, and prohibited dependencies are rejected.
          </p>
        </div>

        <div className="rounded-2xl border border-[#D9D6CF] bg-[#FAF9F6] p-7 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-white border border-[#D9D6CF] flex items-center justify-center text-[#111217] shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#111217]">
            Responsive Substitution
          </h3>
          <p className="text-sm text-[#62666F] leading-relaxed">
            When a wide desktop data table is viewed on mobile, the engine automatically substitutes a touch-friendly stacked record card without breaking your screen schema.
          </p>
        </div>
      </div>
    </section>
  );
}
