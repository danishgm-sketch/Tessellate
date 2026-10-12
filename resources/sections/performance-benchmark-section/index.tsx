import React from 'react';

export type PerformanceBenchmarkSectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PerformanceBenchmarkSectionProps {
  variant?: PerformanceBenchmarkSectionVariant;
}

export function PerformanceBenchmarkSection({ variant = 'quiet' }: PerformanceBenchmarkSectionProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const benchmarks = [
    { name: 'Example measurement A', val: '0.4 ms', width: '12%', color: 'bg-emerald-500' },
    { name: 'Example measurement B', val: '4.8 ms', width: '60%', color: 'bg-neutral-400' },
    { name: 'Example measurement C', val: '12.4 ms', width: '95%', color: 'bg-neutral-400' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Illustrative Benchmark Layout</h2>

        <div className="space-y-6">
          {benchmarks.map((b) => (
            <div key={b.name} className="space-y-2">
              <div className="flex justify-between text-xs font-semibold font-mono">
                <span>{b.name}</span>
                <span>{b.val}</span>
              </div>
              <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div style={{ width: b.width }} className={`h-full rounded-full transition-all ${b.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
