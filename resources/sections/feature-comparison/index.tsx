import React from 'react';

export type FeatureComparisonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureComparisonProps {
  variant?: FeatureComparisonVariant;
}

export function FeatureComparison({ variant = 'quiet' }: FeatureComparisonProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">The Paradigm Shift</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10">
            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 mb-2 block uppercase">The Fragile Way</span>
            <h3 className="text-xl font-bold mb-4">Ad-hoc Component Gluing</h3>
            <ul className="space-y-3 text-xs sm:text-sm opacity-80">
              <li>✕ Copying inconsistent snippets across disparate repos</li>
              <li>✕ Conflicting Tailwind color tokens and spacing overrides</li>
              <li>✕ Unchecked dependency bloat and vendor lock-in</li>
              <li>✕ Inaccessible contrast and broken focus rings</li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2 block uppercase">The Tessellate Way</span>
            <h3 className="text-xl font-bold mb-4">Deterministic Composition</h3>
            <ul className="space-y-3 text-xs sm:text-sm opacity-80">
              <li>✓ Validated JSON manifests with Zod schemas</li>
              <li>✓ Mathematical Design DNA consistency guarantees</li>
              <li>✓ 100% clean TypeScript source code export</li>
              <li>✓ Certified WCAG 2.2 AA accessibility out of the box</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
