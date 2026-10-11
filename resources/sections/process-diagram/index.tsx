import React from 'react';

export type ProcessDiagramVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProcessDiagramProps {
  variant?: ProcessDiagramVariant;
}

export function ProcessDiagram({ variant = 'quiet' }: ProcessDiagramProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let node = 'bg-neutral-100 border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    node = 'bg-white border-blue-200 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    node = 'bg-[#151921] border-[#2E3440]';
  }

  const nodes = ['Resource Manifest', 'DNA Constraint Solver', 'Virtual Component Tree', 'Clean TSX File'];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">The Pipeline Architecture</h2>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {nodes.map((n, i) => (
            <React.Fragment key={n}>
              <div className={`p-4 rounded-xl border text-center font-mono text-xs font-semibold w-full md:w-auto ${node}`}>
                {n}
              </div>
              {i < nodes.length - 1 && (
                <div className="text-neutral-400 font-bold rotate-90 md:rotate-0">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
