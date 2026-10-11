import React from 'react';

export type IntegrationGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IntegrationGridProps {
  variant?: IntegrationGridVariant;
}

export function IntegrationGrid({ variant = 'quiet' }: IntegrationGridProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const tools = ['Next.js', 'Vite', 'Astro', 'Remix', 'Tailwind 4', 'TypeScript', 'Cursor', 'Claude Code', 'Antigravity'];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Universal Ecosystem Compatibility</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
          {tools.map((t) => (
            <div key={t} className={`p-6 rounded-xl border text-center font-mono text-xs font-bold ${card}`}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
