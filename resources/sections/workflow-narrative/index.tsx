import React from 'react';

export type WorkflowNarrativeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkflowNarrativeProps {
  variant?: WorkflowNarrativeVariant;
}

export function WorkflowNarrative({ variant = 'quiet' }: WorkflowNarrativeProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">Developer Ergonomics</span>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Built for engineers who care about source code ownership.</h2>
        <div className="space-y-4 text-sm opacity-80 leading-relaxed">
          <p>
            When autonomous coding agents write code, they often produce fragmented CSS and arbitrary dependencies. Tessellate grounds agents in a verified resource vocabulary.
          </p>
          <p>
            The resulting code contains zero proprietary imports. It reads like the cleanest code written by your senior staff front-end architect.
          </p>
        </div>
      </div>
    </section>
  );
}
