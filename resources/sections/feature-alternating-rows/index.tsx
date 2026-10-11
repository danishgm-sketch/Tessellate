import React from 'react';

export type FeatureAlternatingRowsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureAlternatingRowsProps {
  variant?: FeatureAlternatingRowsVariant;
  rows?: Array<{ title: string; desc: string; tag: string }>;
}

export function FeatureAlternatingRows({
  variant = 'quiet',
  rows = [
    { title: 'Deterministic Manifest Grammar', desc: 'Every resource is declared with machine-readable schemas specifying slots, variants, and visual DNA bounds.', tag: 'SCHEMAS' },
    { title: 'The Three-Pane Composition Studio', desc: 'Direct drag-and-drop hierarchy tree paired with instant live iframe canvas and token inspector.', tag: 'WORKBENCH' },
    { title: 'Autonomous CLI & MCP Integration', desc: 'Coding agents query and assemble verified components without needing human UI intervention.', tag: 'AGENTS' },
  ],
}: FeatureAlternatingRowsProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let frame = 'bg-white border-neutral-200 shadow-sm';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    frame = 'bg-blue-50/40 border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    frame = 'bg-[#151921] border-[#2E3440] shadow-xl';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto space-y-20">
        {rows.map((r, i) => {
          const isReverse = i % 2 === 1;
          return (
            <div key={r.title} className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isReverse ? 'md:flex-row-reverse' : ''}`}>
              <div className={`${isReverse ? 'md:order-2' : ''}`}>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-3 block">{r.tag}</span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">{r.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed mb-6">{r.desc}</p>
                <button type="button" className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75">
                  Learn more →
                </button>
              </div>
              <div className={`p-8 rounded-2xl border min-h-[220px] flex items-center justify-center text-center ${frame} ${isReverse ? 'md:order-1' : ''}`}>
                <span className="font-mono text-xs opacity-60">Interactive Preview: {r.tag}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
