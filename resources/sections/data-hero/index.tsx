import React from 'react';

export type DataHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DataHeroProps {
  variant?: DataHeroVariant;
  headline?: string;
  metrics?: Array<{ label: string; value: string; change: string }>;
}

export function DataHero({
  variant = 'quiet',
  headline = 'Real-time telemetry and programmatic precision.',
  metrics = [
    { label: 'Ingestion Rate', value: '4.2M req/s', change: '+12.4%' },
    { label: 'P99 Latency', value: '1.4 ms', change: '-8.1%' },
    { label: 'Memory Footprint', value: '18.2 MB', change: '-45.0%' },
  ],
}: DataHeroProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/40 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-lg';
  }

  return (
    <section className={`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 max-w-2xl">{headline}</h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-xl">
          Engineered for mission-critical dashboards where microsecond delays are unacceptable.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div key={m.label} className={`p-6 rounded-xl border flex flex-col items-start ${card}`}>
            <span className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-mono">{m.label}</span>
            <span className="text-3xl font-bold font-mono tracking-tight mb-2">{m.value}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{m.change} vs baseline</span>
          </div>
        ))}
      </div>
    </section>
  );
}
