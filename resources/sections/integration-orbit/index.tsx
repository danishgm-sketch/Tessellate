import React from 'react';

export type IntegrationOrbitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IntegrationOrbitProps {
  variant?: IntegrationOrbitVariant;
}

export function IntegrationOrbit({ variant = 'quiet' }: IntegrationOrbitProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let centerNode = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    centerNode = 'bg-[#2547E8] text-white shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    centerNode = 'bg-cyan-500 text-black font-semibold shadow-2xl';
  }

  const nodes = ['React', 'Tailwind', 'Zod', 'Orama', 'Better Auth', 'Cloudflare'];

  return (
    <section className={`relative w-full py-24 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-16">The Orchestration Center</h2>

        <div className="relative w-72 h-72 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center font-bold text-xs font-mono ${centerNode}`}>
            TESSELLATE
          </div>
          {nodes.map((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            const x = Math.round(110 * Math.cos(angle));
            const y = Math.round(110 * Math.sin(angle));
            return (
              <div
                key={node}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className="absolute px-3 py-1 rounded-full border bg-white dark:bg-[#151921] text-[10px] font-mono font-semibold shadow-xs"
              >
                {node}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
