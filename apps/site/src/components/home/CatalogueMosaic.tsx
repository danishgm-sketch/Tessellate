import React, { useState } from 'react';
import { ArrowUpRight, Activity, Terminal } from 'lucide-react';

interface MosaicItem {
  id: string;
  title: string;
  type: 'primitive' | 'component' | 'section' | 'pattern';
  description: string;
  tags: string[];
  slug: string;
}

const MOSAIC_RESOURCES: MosaicItem[] = [
  {
    id: 'res-1',
    title: 'High-Throughput Telemetry Chart',
    type: 'component',
    description: 'WebGL-accelerated time series chart with real-time streaming intervals and tooltip telemetry.',
    tags: ['Data Density 85', 'WebGL/Canvas', 'Micro-interactions'],
    slug: 'telemetry-chart',
  },
  {
    id: 'res-2',
    title: 'Audited Financial Ledger Table',
    type: 'section',
    description: 'Virtualised tabular records display with inline sorting, filter chips, and column pin support.',
    tags: ['Virtual Scroll', 'High Density', 'Accessibility AA'],
    slug: 'data-table',
  },
  {
    id: 'res-3',
    title: 'Tactile Kinetic Button',
    type: 'primitive',
    description: 'Canonical button primitive supporting 4 variant elevations, press physics, and loading state.',
    tags: ['CSS Spring', 'Reduced Motion Safe', 'Zero Runtime'],
    slug: 'button',
  },
  {
    id: 'res-4',
    title: 'Focal Metric Card Pulse',
    type: 'component',
    description: 'Executive overview metric card with delta indicator, sparkline trend, and status dot.',
    tags: ['Layout Modular', 'Dynamic Chroma', 'Contrast 95'],
    slug: 'metric-card',
  },
  {
    id: 'res-5',
    title: 'Command Palette Overlay',
    type: 'pattern',
    description: 'Global ⌘K fuzzy action launcher with keyboard navigation, section groupings, and recent history.',
    tags: ['Keyboard First', 'Portal Modal', 'Fast Fuzzy Match'],
    slug: 'command-palette',
  },
  {
    id: 'res-6',
    title: 'Semantic Cockpit Navigation',
    type: 'section',
    description: 'Multi-level responsive app shell navigation with collapsed rail and breadcrumb hierarchy.',
    tags: ['Landmark Navigation', 'ARIA Compliant', 'Mobile Sheet'],
    slug: 'navigation-bar',
  },
];

export function CatalogueMosaic() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'primitive' | 'component' | 'section' | 'pattern'>('all');

  const filtered = activeFilter === 'all'
    ? MOSAIC_RESOURCES
    : MOSAIC_RESOURCES.filter((r) => r.type === activeFilter);

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
            The Resource Vocabulary
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
            Real resources. Zero synthetic filler.
          </h2>
          <p className="text-base sm:text-lg text-[#62666F] max-w-xl font-normal">
            Every component in Tessellate is production-grade React + Tailwind 4, verified against accessibility baselines and exportable without proprietary runtimes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] self-start md:self-auto">
          {(['all', 'primitive', 'component', 'section', 'pattern'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[#111217] text-white shadow-sm'
                  : 'text-[#62666F] hover:text-[#111217]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Mosaic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-2xl border border-[#D9D6CF] bg-white p-5 hover:border-[#111217] transition-all shadow-sm hover:shadow-md"
          >
            <div>
              {/* Interactive Visual Preview Area */}
              <div className="relative aspect-[16/10] rounded-xl bg-[#FAF9F6] border border-[#D9D6CF]/70 p-5 overflow-hidden mb-5 flex flex-col justify-between group-hover:bg-[#F4F2ED] transition-colors">
                {idx === 0 && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs font-mono text-[#62666F]">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-[#2547E8]" />
                        <span>TPS Telemetry</span>
                      </span>
                      <span className="text-[#177B55] font-semibold">+14.2%</span>
                    </div>
                    <svg className="w-full h-20" viewBox="0 0 200 60" fill="none">
                      <path
                        d="M0,45 Q30,55 60,30 T120,25 T160,10 T200,18"
                        stroke="#2547E8"
                        strokeWidth="2.5"
                        fill="none"
                      />
                      <path
                        d="M0,45 Q30,55 60,30 T120,25 T160,10 T200,18 L200,60 L0,60 Z"
                        fill="#2547E8"
                        fillOpacity="0.08"
                      />
                    </svg>
                  </div>
                )}

                {idx === 1 && (
                  <div className="h-full flex flex-col justify-between text-[11px] font-mono text-[#62666F]">
                    <div className="flex justify-between pb-1.5 border-b border-[#D9D6CF] font-semibold text-[#111217]">
                      <span>TX ID</span>
                      <span>STATUS</span>
                      <span>AMOUNT</span>
                    </div>
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between">
                        <span>#0x882A</span>
                        <span className="text-[#177B55]">CONFIRMED</span>
                        <span>£14,250.00</span>
                      </div>
                      <div className="flex justify-between text-black/40">
                        <span>#0x7B91</span>
                        <span>PENDING</span>
                        <span>£3,890.50</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-[#D9D6CF] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#2547E8]" />
                    </div>
                  </div>
                )}

                {idx === 2 && (
                  <div className="h-full flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-[#2547E8] text-white text-xs font-semibold shadow hover:bg-[#1E3CCD] transition-colors"
                    >
                      Primary Action
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-white border border-[#D9D6CF] text-[#111217] text-xs font-semibold hover:border-[#111217] transition-colors"
                    >
                      Secondary
                    </button>
                  </div>
                )}

                {idx === 3 && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs text-[#62666F]">
                      <span className="font-semibold text-[#111217]">Active Pipeline Runs</span>
                      <span className="h-2 w-2 rounded-full bg-[#177B55]" />
                    </div>
                    <div className="my-auto">
                      <span className="text-3xl font-semibold tracking-tight text-[#111217]">1,492</span>
                      <span className="text-xs text-[#177B55] ml-2 font-mono">▲ 99.98%</span>
                    </div>
                    <div className="flex gap-1">
                      {[40, 65, 80, 55, 90, 75, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-[#2547E8]/20 rounded-t"
                          style={{ height: `${h * 0.25}px` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {idx === 4 && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D9D6CF] text-xs text-[#8B8F97]">
                      <Terminal className="h-3.5 w-3.5 text-[#2547E8]" />
                      <span>Search commands, workflows…</span>
                    </div>
                    <div className="space-y-1 pt-2 text-[10px] font-mono text-[#62666F]">
                      <div className="px-2 py-1 rounded bg-[#E7EBFF] text-[#2547E8] font-semibold">
                        → Recompose screen around locks
                      </div>
                      <div className="px-2 py-1 text-black/50">
                        → Toggle WCAG AAA contrast floor
                      </div>
                    </div>
                  </div>
                )}

                {idx === 5 && (
                  <div className="h-full flex gap-3">
                    <div className="w-12 h-full rounded-lg bg-white border border-[#D9D6CF] p-1.5 flex flex-col items-center gap-2">
                      <div className="h-4 w-4 rounded bg-[#2547E8]" />
                      <div className="h-2 w-6 rounded bg-[#D9D6CF]" />
                      <div className="h-2 w-6 rounded bg-[#D9D6CF]" />
                    </div>
                    <div className="flex-1 h-full rounded-lg bg-white border border-[#D9D6CF] p-3 space-y-2">
                      <div className="h-3 w-20 rounded bg-[#111217]" />
                      <div className="h-2 w-full rounded bg-[#D9D6CF]" />
                      <div className="h-2 w-3/4 rounded bg-[#D9D6CF]" />
                    </div>
                  </div>
                )}

                <div className="absolute top-3 right-3 text-[10px] font-mono uppercase font-semibold text-[#8B8F97] bg-white/90 border border-[#D9D6CF] px-2 py-0.5 rounded-full">
                  {item.type}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1.5 mb-4">
                <h3 className="text-base font-semibold text-[#111217]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#62666F] font-normal leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#D9D6CF] text-[#62666F]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Inspect / View in Catalogue Link */}
            <a
              href={`/r/${item.slug}`}
              className="flex items-center justify-between pt-3 border-t border-[#D9D6CF] text-xs font-semibold text-[#111217] hover:text-[#2547E8] transition-colors"
            >
              <span>Inspect Manifest & Source</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        ))}
      </div>

      {/* Explore Catalogue CTA */}
      <div className="mt-12 text-center">
        <a
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#D9D6CF] bg-white text-sm font-semibold text-[#111217] hover:border-[#111217] hover:bg-[#FAF9F6] transition-all shadow-sm"
        >
          <span>Explore All Resources in Catalogue</span>
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
