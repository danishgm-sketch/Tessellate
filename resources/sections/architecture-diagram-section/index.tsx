import React from 'react';

export type ArchitectureDiagramSectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ArchitectureDiagramSectionProps {
  variant?: ArchitectureDiagramSectionVariant;
}

export function ArchitectureDiagramSection({ variant = 'quiet' }: ArchitectureDiagramSectionProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let box = 'bg-neutral-100 border-neutral-300 font-mono text-xs';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-sm font-mono text-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] font-mono text-xs';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Infrastructure Topology</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className={`p-6 rounded-2xl border ${box}`}>
            <span className="text-[10px] font-bold opacity-60 uppercase mb-2 block">Client Layer</span>
            <div className="font-bold text-sm mb-1">React + Zustand</div>
            <p className="text-[11px] opacity-75">In-memory graph & DNA mutations</p>
          </div>
          <div className={`p-6 rounded-2xl border ${box}`}>
            <span className="text-[10px] font-bold opacity-60 uppercase mb-2 block">Edge Layer</span>
            <div className="font-bold text-sm mb-1">Cloudflare Workers</div>
            <p className="text-[11px] opacity-75">Hono API & sub-millisecond routing</p>
          </div>
          <div className={`p-6 rounded-2xl border ${box}`}>
            <span className="text-[10px] font-bold opacity-60 uppercase mb-2 block">Storage Layer</span>
            <div className="font-bold text-sm mb-1">D1 + R2 Registry</div>
            <p className="text-[11px] opacity-75">Encrypted checkpoints & static bundles</p>
          </div>
        </div>
      </div>
    </section>
  );
}
