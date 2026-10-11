import React from 'react';

export type FeatureBentoVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureBentoProps {
  variant?: FeatureBentoVariant;
}

export function FeatureBento({ variant = 'quiet' }: FeatureBentoProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-xl';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-16">The Bento System</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`md:col-span-2 p-8 rounded-2xl border flex flex-col justify-between min-h-[260px] ${card}`}>
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-2 block">Flagship Feature</span>
              <h3 className="text-2xl font-bold mb-3">Live Token Synchronization</h3>
              <p className="text-sm opacity-80 max-w-lg leading-relaxed">
                When you tweak curvature or contrast in Design DNA, all 324 components update in real time with zero layout thrashing.
              </p>
            </div>
            <div className="h-10 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 flex items-center px-4 font-mono text-xs opacity-70">
              --tess-density: 85; --tess-radius: 6px;
            </div>
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col justify-between min-h-[260px] ${card}`}>
            <div>
              <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-2 block">Performance</span>
              <h3 className="text-xl font-bold mb-2">0.4ms Latency</h3>
              <p className="text-xs opacity-75 leading-relaxed">Sub-millisecond verification pipeline powered by local in-memory indices.</p>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400">100/100</div>
          </div>

          <div className={`p-8 rounded-2xl border flex flex-col justify-between min-h-[240px] ${card}`}>
            <div>
              <h3 className="text-lg font-bold mb-2">MCP Agent Ready</h3>
              <p className="text-xs opacity-75">Connect Cursor, Claude Code, or Antigravity directly to local tooling.</p>
            </div>
            <span className="text-xs font-mono opacity-60">stdio / sse</span>
          </div>

          <div className={`md:col-span-2 p-8 rounded-2xl border flex flex-col justify-between min-h-[240px] ${card}`}>
            <div>
              <h3 className="text-lg font-bold mb-2">Verified Ecosystem Integrity</h3>
              <p className="text-xs opacity-75 max-w-md">972 curated combinations across Quiet, Expressive, and Nocturne with 0 lint warnings.</p>
            </div>
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="h-3 w-3 rounded-full bg-purple-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
