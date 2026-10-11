import React from 'react';

export type FeatureGrid3x2Variant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureGrid3x2Props {
  variant?: FeatureGrid3x2Variant;
  headline?: string;
  subheadline?: string;
  features?: Array<{ title: string; desc: string }>;
}

export function FeatureGrid3x2({
  variant = 'quiet',
  headline = 'Engineered for durability across every layer of the interface.',
  subheadline = 'Six architectural pillars powering the Tessellate composition runtime.',
  features = [
    { title: 'Zero Runtime Lock-In', desc: 'Exports directly to clean React and Tailwind CSS without hidden proprietary libraries.' },
    { title: 'Deterministic DNA', desc: 'Enforces mathematical harmony across spacing, curvature, typography, and contrast.' },
    { title: 'Sub-Millisecond Parsing', desc: 'Validates entire component trees in microseconds using local Zod schemas.' },
    { title: 'Accessible by Default', desc: 'Meets WCAG 2.2 AA standards with full keyboard traversal and contrast tokens.' },
    { title: 'Agent-Ready Registry', desc: 'Equipped with OpenAPI, llms.txt, and MCP servers for autonomous coding tools.' },
    { title: 'Guest-First Storage', desc: 'Operates completely client-side with optional GitHub OAuth for cloud sync.' },
  ],
}: FeatureGrid3x2Props) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-2xs hover:border-neutral-400';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm hover:border-[#2547E8] hover:shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] hover:border-cyan-400';
  }

  return (
    <section className={`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{headline}</h2>
          <p className="text-base sm:text-lg opacity-75">{subheadline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={f.title} className={`p-6 rounded-xl border transition-all ${card}`}>
              <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-mono text-xs font-bold mb-4">
                0{i + 1}
              </div>
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
