import React, { useState } from 'react';
import { ArrowRight, Sliders, Layers } from 'lucide-react';

interface DirectionCardData {
  index: string;
  name: string;
  tagline: string;
  category: string;
  bgGradient: string;
  accentColor: string;
  dnaTags: string[];
  routeParam: string;
}

const DIRECTIONS: DirectionCardData[] = [
  {
    index: '01',
    category: 'INSTITUTIONAL',
    name: 'Intelligence Terminal',
    tagline: 'Dense, authoritative, analytical.',
    bgGradient: 'from-[#0C101A] to-[#243B84]',
    accentColor: '#C9FF57',
    dnaTags: ['Contrast 92', 'Sharp 0px', 'Calm Motion', 'High Density'],
    routeParam: 'institutional',
  },
  {
    index: '02',
    category: 'EDITORIAL',
    name: 'Research Publication',
    tagline: 'Narrative, trusted, beautifully paced.',
    bgGradient: 'from-[#FFF7ED] to-[#F1D9C7]',
    accentColor: '#111217',
    dnaTags: ['Serif Pacing', 'Generous Space', 'Soft Ease', 'Balanced'],
    routeParam: 'editorial',
  },
  {
    index: '03',
    category: 'FUTURE COMMAND',
    name: 'Adaptive Workspace',
    tagline: 'Spatial, agent-native, controlled novelty.',
    bgGradient: 'from-[#121317] to-[#29202F]',
    accentColor: '#8B68FF',
    dnaTags: ['Spatial Canvas', 'Kinetic Pulse', 'Pill Radius', 'High Ambition'],
    routeParam: 'future',
  },
];

export function ThreeDirectionsDemo() {
  const [activeBlend, setActiveBlend] = useState<null | { from: string; to: string }>(null);
  const [blendRatio, setBlendRatio] = useState<number>(50);

  return (
    <section id="three-directions-demo" className="py-20 px-6 max-w-[1440px] mx-auto select-none">
      {/* Section Header */}
      <div className="mb-12 space-y-3">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
          Three Directions, One Product
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
          Choose a direction. Or blend them.
        </h2>
        <p className="text-base sm:text-lg text-[#62666F] max-w-2xl font-normal">
          Tessellate never traps you into a single monolithic style. Every brief generates three distinct architectural interpretations with full compatibility.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {DIRECTIONS.map((d, i) => (
          <div
            key={d.index}
            className={`flex flex-col justify-between rounded-2xl bg-white border ${
              i === 1 ? 'border-[#C5C1B8] shadow-md ring-1 ring-[#111217]/5' : 'border-[#D9D6CF] shadow-sm'
            } p-5 hover:border-[#111217] transition-all group`}
          >
            <div>
              {/* 16:10 Preview Canvas */}
              <div
                className={`relative w-full aspect-[16/10] rounded-xl bg-gradient-to-br ${d.bgGradient} p-4 overflow-hidden mb-5 border border-black/5 shadow-inner flex flex-col justify-between`}
              >
                {/* Structural Graphic Mockup for direction */}
                {i === 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 rounded bg-white/80" />
                      <div className="h-2.5 w-12 rounded bg-[#C9FF57]" />
                    </div>
                    <div className="space-y-1.5 my-auto">
                      <div className="h-5 w-40 rounded bg-white/95" />
                      <div className="h-2 w-48 rounded bg-[#8EA2FF]/80" />
                      <div className="h-2 w-36 rounded bg-[#8EA2FF]/50" />
                    </div>
                    <div className="flex items-end justify-between pt-2 border-t border-white/10">
                      <div className="space-y-1">
                        <div className="h-2 w-16 rounded bg-white/40" />
                        <div className="h-3 w-10 rounded bg-[#C9FF57]" />
                      </div>
                      <svg width="72" height="24" viewBox="0 0 72 24" fill="none">
                        <polyline
                          points="2,20 18,14 34,18 48,6 68,10"
                          stroke="#C9FF57"
                          strokeWidth="2.5"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </>
                )}

                {i === 1 && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-28 rounded bg-[#2F261F]/70" />
                      <div className="h-2 w-8 rounded bg-[#7A6456]/40" />
                    </div>
                    <div className="space-y-2 my-auto">
                      <div className="h-6 w-52 rounded bg-[#1B1713]" />
                      <div className="h-2.5 w-44 rounded bg-[#7A6456]/60" />
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-[#7A6456]/20">
                      <div className="h-6 w-6 rounded-full bg-[#D39A78]" />
                      <div className="h-2.5 w-24 rounded bg-[#2F261F]/60" />
                    </div>
                  </>
                )}

                {i === 2 && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-16 rounded bg-[#201C26] border border-[#3A3045]" />
                      <div className="h-3 w-16 rounded bg-[#201C26] border border-[#3A3045]" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 my-auto">
                      <div className="h-16 rounded-lg bg-[#18161C] border border-[#37313D] p-1.5 flex flex-col justify-between">
                        <div className="h-1.5 w-6 rounded bg-[#8B68FF]" />
                        <div className="h-3 w-8 rounded bg-white/80" />
                      </div>
                      <div className="col-span-2 h-16 rounded-lg bg-[#1C1920] border border-[#403648] p-1.5 flex items-center justify-center">
                        <div className="h-7 w-7 rounded-full bg-[#8B68FF]/30 border border-[#8B68FF] flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-[#C9FF57]" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-white/50 font-mono">
                      <span>FLOW 03</span>
                      <span>AGENT · ADAPTIVE</span>
                    </div>
                  </>
                )}
              </div>

              {/* Direction Meta */}
              <div className="space-y-1.5 mb-4">
                <span className="font-mono text-[11px] font-semibold text-[#8B8F97] tracking-wider uppercase">
                  {d.index} · {d.category}
                </span>
                <h3 className="text-xl font-semibold tracking-tight text-[#111217]">
                  {d.name}
                </h3>
                <p className="text-xs text-[#62666F] font-normal leading-relaxed">
                  {d.tagline}
                </p>
              </div>

              {/* DNA Badges */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {d.dnaTags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#D9D6CF] text-[#62666F]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions: Choose or Blend */}
            <div className="flex items-center gap-2 pt-4 border-t border-[#D9D6CF]/60">
              <a
                href={`/workbench?direction=${d.routeParam}`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-[#111217] text-white hover:bg-[#2547E8] transition-colors"
              >
                <span>Choose</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={() =>
                  setActiveBlend({
                    from: d.name,
                    to: i === 0 ? 'Research Publication' : 'Intelligence Terminal',
                  })
                }
                className="flex items-center gap-1 py-2 px-3 text-xs font-semibold rounded-lg border border-[#D9D6CF] text-[#62666F] hover:text-[#111217] hover:border-[#111217] bg-[#FAF9F6] transition-colors"
                title="Blend this style with another direction"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Blend</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Blend Modal Drawer */}
      {activeBlend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#FAF9F6] rounded-2xl border border-[#D9D6CF] p-6 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#D9D6CF] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2547E8]" />
                <h4 className="text-base font-semibold text-[#111217]">
                  Design DNA Blend Studio
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveBlend(null)}
                className="text-xs font-mono text-[#8B8F97] hover:text-[#111217]"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-[#62666F]">
              Interpolating mathematical Design DNA between <strong>{activeBlend.from}</strong> and{' '}
              <strong>{activeBlend.to}</strong>.
            </p>

            {/* Slider */}
            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#D9D6CF]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#2547E8]">{activeBlend.from} ({100 - blendRatio}%)</span>
                <span className="text-[#111217]">{activeBlend.to} ({blendRatio}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={blendRatio}
                onChange={(e) => setBlendRatio(Number(e.target.value))}
                className="w-full accent-[#2547E8] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#8B8F97]">
                <span>Pure Base</span>
                <span>Hybrid Balance (50/50)</span>
                <span>Target Shift</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveBlend(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D9D6CF] text-[#62666F] hover:text-[#111217]"
              >
                Cancel
              </button>
              <a
                href={`/workbench?blend=${blendRatio}`}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#2547E8] text-white hover:bg-[#1E3CCD]"
              >
                <span>Open Blended System in Workbench</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
