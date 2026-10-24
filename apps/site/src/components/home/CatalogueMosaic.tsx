import React, { useState } from 'react';
import { ArrowUpRight, Activity, Terminal } from 'lucide-react';

interface MosaicItem {
  id: string;
  title: string;
  type: 'primitive' | 'block' | 'data' | 'ai' | 'shell';
  description: string;
  tags: string[];
  slug: string;
}

const MOSAIC_RESOURCES: MosaicItem[] = [
  {
    id: 'res-1',
    title: 'Area Chart',
    type: 'data',
    description:
      'Smooth bezier-curved single or dual area plot with subtle vertical gradient fill, baseline threshold, and interactive peek point.',
    tags: ['chart', 'area', 'gradient'],
    slug: 'area-chart',
  },
  {
    id: 'res-2',
    title: 'Advanced Data Table',
    type: 'block',
    description:
      'Feature-rich data table with column sorting, checkbox selection, pagination, and filter bar.',
    tags: ['table', 'data-table', 'sorting'],
    slug: 'advanced-data-table',
  },
  {
    id: 'res-3',
    title: 'Button',
    type: 'primitive',
    description:
      'Tactile, accessible multi-intent button primitive with Quiet, Expressive, and Nocturne curated configurations.',
    tags: ['button', 'action', 'trigger'],
    slug: 'button',
  },
  {
    id: 'res-4',
    title: 'Dashboard KPI Grid',
    type: 'block',
    description:
      'Multi-column grid of key performance cards with visual trend indicators and contextual meta.',
    tags: ['dashboard', 'grid', 'metrics'],
    slug: 'dashboard-kpi-grid',
  },
  {
    id: 'res-5',
    title: 'AI Prompt Composer',
    type: 'ai',
    description:
      'Structured prompt input box with context variable attachment pills, system mode badges, and token counters.',
    tags: ['ai', 'prompt', 'composer'],
    slug: 'ai-prompt-composer',
  },
  {
    id: 'res-6',
    title: 'Minimal Top Navigation',
    type: 'shell',
    description:
      'Restrained horizontal header with brand mark, essential route links, and profile badge.',
    tags: ['header', 'top-nav', 'navigation'],
    slug: 'minimal-top-nav',
  },
];

export function CatalogueMosaic() {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'primitive' | 'block' | 'data' | 'ai' | 'shell'
  >('all');

  const filtered =
    activeFilter === 'all'
      ? MOSAIC_RESOURCES
      : MOSAIC_RESOURCES.filter((r) => r.type === activeFilter);

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-5">
        <div className="space-y-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
            The Resource Vocabulary
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
            Open resources. Clear sample data.
          </h2>
          <p className="text-base sm:text-lg text-[#62666F] max-w-xl font-normal">
            Browse React and Tailwind resources with declared provenance, dependency, accessibility,
            and performance metadata. Example preview · sample data, not live product activity.
            Runtime eligibility is listed separately from manifest status.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] self-start md:self-auto">
          {(['all', 'primitive', 'block', 'data', 'ai', 'shell'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[#111217] text-white shadow-sm'
                  : 'text-[#62666F] hover:text-[#111217]'
              }`}
            >
              {filter === 'all' ? 'All' : filter === 'ai' ? 'AI' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Mosaic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            data-testid="home-resource-card"
            className="group flex flex-col justify-between rounded-2xl border border-[#D9D6CF] bg-white p-5 hover:border-[#111217] transition-all shadow-sm hover:shadow-md"
          >
            <div>
              {/* Interactive Visual Preview Area */}
              <div
                data-testid="home-resource-preview"
                className="relative aspect-[16/10] rounded-xl bg-[#FAF9F6] border border-[#D9D6CF]/70 p-5 overflow-hidden mb-5 flex flex-col justify-between group-hover:bg-[#F4F2ED] transition-colors"
              >
                {idx === 0 && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 pr-14 text-[10px] font-mono text-[#62666F] sm:text-xs">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-[#2547E8]" />
                        <span>Example series</span>
                      </span>
                      <span className="whitespace-nowrap text-[#62666F] font-semibold">
                        Sample values
                      </span>
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
                      <span>ITEM</span>
                      <span>STATUS</span>
                      <span>TYPE</span>
                    </div>
                    <div className="space-y-1.5 py-1">
                      <div className="flex justify-between">
                        <span>Example A</span>
                        <span className="text-[#12603F]">READY</span>
                        <span>Resource</span>
                      </div>
                      <div className="flex justify-between text-[#62666F]">
                        <span>Example B</span>
                        <span>REVIEW</span>
                        <span>Pattern</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-[#D9D6CF] rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-[#2547E8]" />
                    </div>
                  </div>
                )}

                {idx === 2 && (
                  <div className="h-full flex items-center justify-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-[#2547E8] text-white text-xs font-semibold shadow">
                      Primary Action
                    </span>
                    <span className="px-4 py-2 rounded-lg bg-white border border-[#D9D6CF] text-[#111217] text-xs font-semibold">
                      Secondary
                    </span>
                  </div>
                )}

                {idx === 3 && (
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs text-[#62666F]">
                      <span className="font-semibold text-[#111217]">Catalogue resources</span>
                      <span className="h-2 w-2 rounded-full bg-[#177B55]" />
                    </div>
                    <div className="my-auto">
                      <span className="text-3xl font-semibold tracking-tight text-[#111217]">
                        324
                      </span>
                      <span className="text-xs text-[#62666F] ml-2 font-mono">resources</span>
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
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[#D9D6CF] text-xs text-[var(--text-muted)]">
                      <Terminal className="h-3.5 w-3.5 text-[#2547E8]" />
                      <span>Search commands, workflows…</span>
                    </div>
                    <div className="space-y-1 pt-2 text-[10px] font-mono text-[#62666F]">
                      <div className="px-2 py-1 rounded bg-[#E7EBFF] text-[#2547E8] font-semibold">
                        → Recompose screen around locks
                      </div>
                      <div className="px-2 py-1 text-[#62666F]">
                        → Review accessibility metadata
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

                <div
                  data-testid="home-resource-type-badge"
                  className="absolute top-3 right-3 text-[10px] font-mono uppercase font-semibold text-[var(--text-muted)] bg-white/90 border border-[#D9D6CF] px-2 py-0.5 rounded-full"
                >
                  {item.type}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-1.5 mb-4">
                <h3 className="text-base font-semibold text-[#111217]">{item.title}</h3>
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
