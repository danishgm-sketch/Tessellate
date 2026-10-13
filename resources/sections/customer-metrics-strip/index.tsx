import React from 'react';

export type CustomerMetricsStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CustomerMetricsStripProps {
  variant?: CustomerMetricsStripVariant;
  stats?: Array<{ label: string; value: string; desc: string }>;
}

export function CustomerMetricsStrip({
  variant = 'quiet',
  stats = [
    { label: 'Example Projects', value: '128', desc: 'Illustrative metrics; replace with measured data' },
    { label: 'Example Teams', value: '12', desc: 'Illustrative team count' },
    { label: 'Example Tasks', value: '320', desc: 'Illustrative task count' },
    { label: 'Example Completion', value: '78%', desc: 'Illustrative progress' },
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
