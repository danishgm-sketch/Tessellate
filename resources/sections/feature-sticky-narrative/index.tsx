import React from 'react';

export type FeatureStickyNarrativeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureStickyNarrativeProps {
  variant?: FeatureStickyNarrativeVariant;
}

export function FeatureStickyNarrative({ variant = 'quiet' }: FeatureStickyNarrativeProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 block">Architecture</span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">A shared manifest carries the work forward</h2>
          <p className="text-sm opacity-80 leading-relaxed">
            Tessellate carries screens, resources, and design choices from composition into Workbench and export.
          </p>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {[
            { step: '01', title: 'Choose a product brief', description: 'Describe the product and the people it serves in Compose.' },
            { step: '02', title: 'Refine the selected project', description: 'Compare directions, then adjust structure and Design DNA in Workbench.' },
            { step: '03', title: 'Export a standalone project', description: 'Download a React/Vite project or a Tessellate manifest for your next steps.' },
          ].map((phase) => (
            <div key={phase.step} className={`p-8 rounded-2xl border ${card}`}>
              <span className="text-xs font-mono font-bold text-neutral-500 mb-2 block">STEP {phase.step}</span>
              <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{phase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
