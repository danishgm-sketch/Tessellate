import React from 'react';

export type FeatureMetricsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureMetricsProps {
  variant?: FeatureMetricsVariant;
}

export function FeatureMetrics({ variant = 'quiet' }: FeatureMetricsProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/40 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Audited Performance Metrics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`p-6 rounded-2xl border text-center ${card}`}>
            <div className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">&lt; 150 KB</div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Gzip Bundle Ceiling</div>
            <p className="text-xs opacity-70">Strict budget enforced on public pages.</p>
          </div>
          <div className={`p-6 rounded-2xl border text-center ${card}`}>
            <div className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">0.0 ms</div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Third-Party Tracking</div>
            <p className="text-xs opacity-70">Zero analytics cookies or ad beacons.</p>
          </div>
          <div className={`p-6 rounded-2xl border text-center ${card}`}>
            <div className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-2">100/100</div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1">Lighthouse Performance</div>
            <p className="text-xs opacity-70">Desktop and mobile verified clean.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
