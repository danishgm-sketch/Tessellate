import React from 'react';

export type CustomerMetricsStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CustomerMetricsStripProps {
  variant?: CustomerMetricsStripVariant;
  stats?: Array<{ label: string; value: string; desc: string }>;
}

export function CustomerMetricsStrip({
  variant = 'quiet',
  stats = [
    { label: 'Verified Uptime', value: '99.99%', desc: 'Across global edge regions' },
    { label: 'Weekly Builds', value: '1.2B+', desc: 'Deterministic compilation runs' },
    { label: 'Sub-millisecond', value: '<0.8ms', desc: 'Average manifest parse time' },
    { label: 'Zero Vulnerabilities', value: '100%', desc: 'Audited dependency purity' },
  ],
}: CustomerMetricsStripProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'border-blue-100';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-16 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className={`flex flex-col items-start border-l-2 pl-6 ${card}`}>
            <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mb-1">{s.value}</span>
            <span className="text-sm font-semibold mb-1">{s.label}</span>
            <span className="text-xs opacity-70">{s.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
