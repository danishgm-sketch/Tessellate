import React, { useEffect, useState } from 'react';

export function StructureComparison() {
  const [layoutMode, setLayoutMode] = useState<'familiar' | 'cockpit' | 'spatial'>('familiar');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  return (
    <section className="py-24 px-6 max-w-[1440px] mx-auto select-none border-t border-[#D9D6CF]">
      <div className="max-w-3xl mb-12 space-y-4">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#62666F]">
          Screen Architecture Grammar
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111217]">
          Familiar → Experimental structure.
        </h2>
        <p className="text-lg text-[#62666F] font-normal leading-relaxed">
          Tessellate breaks free from the ubiquitous left-sidebar-and-table monoculture when your
          user workflows demand deeper structural density.
        </p>
        <p className="text-sm text-[#62666F]">
          Illustrative layout · no connected project.{' '}
          <span id="structure-comparison-status" aria-live="polite">
            {hydrated
              ? 'The selectors change this diagram only.'
              : 'Diagram selectors become available after this example loads.'}
          </span>
        </p>

        {/* Mode Selector */}
        <div className="flex w-full flex-wrap p-1 rounded-xl bg-[#FAF9F6] border border-[#D9D6CF] gap-1">
          <button
            type="button"
            disabled={!hydrated}
            aria-describedby="structure-comparison-status"
            aria-pressed={layoutMode === 'familiar'}
            onClick={() => setLayoutMode('familiar')}
            className={`min-h-11 flex-1 basis-28 px-2 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:cursor-wait disabled:opacity-60 ${
              layoutMode === 'familiar'
                ? 'bg-[#111217] text-white shadow'
                : 'text-[#62666F] hover:text-[#111217]'
            }`}
          >
            Familiar (Standard Sidebar)
          </button>
          <button
            type="button"
            disabled={!hydrated}
            aria-describedby="structure-comparison-status"
            aria-pressed={layoutMode === 'cockpit'}
            onClick={() => setLayoutMode('cockpit')}
            className={`min-h-11 flex-1 basis-28 px-2 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:cursor-wait disabled:opacity-60 ${
              layoutMode === 'cockpit'
                ? 'bg-[#111217] text-white shadow'
                : 'text-[#62666F] hover:text-[#111217]'
            }`}
          >
            Modular Cockpit (Three-Pane)
          </button>
          <button
            type="button"
            disabled={!hydrated}
            aria-describedby="structure-comparison-status"
            aria-pressed={layoutMode === 'spatial'}
            onClick={() => setLayoutMode('spatial')}
            className={`min-h-11 flex-1 basis-28 px-2 sm:px-4 py-2 text-xs font-semibold rounded-lg transition-all disabled:cursor-wait disabled:opacity-60 ${
              layoutMode === 'spatial'
                ? 'bg-[#111217] text-white shadow'
                : 'text-[#62666F] hover:text-[#111217]'
            }`}
          >
            Spatial Canvas (Exploratory)
          </button>
        </div>
      </div>

      {/* Wireframe Comparison Display */}
      <div className="rounded-3xl border border-[#D9D6CF] bg-[#FAF9F6] p-4 sm:p-10">
        <div className="aspect-[21/9] min-h-[460px] lg:min-h-[340px] w-full rounded-2xl bg-white border border-[#D9D6CF] p-3 sm:p-4 shadow-sm flex flex-col justify-between">
          {/* Top chrome bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9D6CF] text-xs font-mono text-[var(--text-muted)]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C83D48]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#A66A15]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#177B55]" />
              <span className="ml-1 sm:ml-2 font-semibold text-[#111217] break-words">
                {layoutMode === 'familiar' && 'LAYOUT GRAMMAR: STANDARD_SIDEBAR'}
                {layoutMode === 'cockpit' && 'LAYOUT GRAMMAR: THREE_PANE_COCKPIT'}
                {layoutMode === 'spatial' && 'EXPLORATORY LAYOUT: SPATIAL CANVAS'}
              </span>
            </div>
            <span>DESKTOP WIREFRAME</span>
          </div>

          {/* Dynamic Wireframe Body */}
          <div className="flex-1 my-3 flex flex-col lg:flex-row gap-3">
            {layoutMode === 'familiar' && (
              <>
                {/* Standard sidebar */}
                <div className="w-full lg:w-48 shrink-0 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-3 space-y-2">
                  <div className="h-4 w-20 rounded bg-[#2547E8]" />
                  <div className="h-2 w-28 rounded bg-[#D9D6CF]" />
                  <div className="h-2 w-24 rounded bg-[#D9D6CF]" />
                  <div className="h-2 w-32 rounded bg-[#D9D6CF]" />
                </div>
                {/* Main central content */}
                <div className="min-w-0 flex-1 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-4 space-y-3">
                  <div className="h-5 w-48 rounded bg-[#111217]" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                    <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                    <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                  </div>
                  <div className="h-28 rounded bg-white border border-[#D9D6CF]" />
                </div>
              </>
            )}

            {layoutMode === 'cockpit' && (
              <>
                {/* Three-pane layout */}
                <div className="w-full lg:w-56 shrink-0 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-3 space-y-2">
                  <div className="h-3 w-20 rounded bg-[#2547E8]" />
                  <div className="h-2 w-full rounded bg-[#D9D6CF]" />
                  <div className="h-2 w-full rounded bg-[#D9D6CF]" />
                  <div className="h-2 w-full rounded bg-[#D9D6CF]" />
                </div>
                <div className="min-w-0 flex-1 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-3 space-y-2">
                  <div className="h-4 w-32 rounded bg-[#111217]" />
                  <div className="h-44 rounded bg-white border border-[#D9D6CF] p-2 flex items-center justify-center font-mono text-xs text-[#2547E8]">
                    Example main content
                  </div>
                </div>
                <div className="w-full lg:w-64 shrink-0 rounded-lg bg-[#FAF9F6] border border-[#D9D6CF] p-3 space-y-2">
                  <div className="h-3 w-24 rounded bg-[#111217]" />
                  <div className="h-16 rounded bg-white border border-[#D9D6CF]" />
                  <div className="h-24 rounded bg-white border border-[#D9D6CF]" />
                </div>
              </>
            )}

            {layoutMode === 'spatial' && (
              <div className="min-h-52 flex-1 rounded-lg bg-[#111217] p-6 relative overflow-hidden flex items-center justify-center">
                {/* Node cluster */}
                <div className="absolute top-6 left-12 p-3 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs">
                  Brief
                </div>
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200" fill="none">
                  <path
                    d="M120,40 Q200,80 200,100"
                    stroke="#2547E8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <path d="M200,100 Q200,120 280,140" stroke="#C9FF57" strokeWidth="2" />
                </svg>
                <div className="p-4 rounded-xl bg-[#2547E8] text-white font-semibold text-xs shadow-xl z-10">
                  Composition
                </div>
                <div className="absolute bottom-6 right-16 p-3 rounded-xl bg-white/10 border border-white/20 text-[#C9FF57] font-mono text-xs">
                  Preview
                </div>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 text-[11px] font-mono text-[#62666F]">
            <span>
              {layoutMode === 'familiar' &&
                'Best for: Executive Dashboards, Settings, Documentation'}
              {layoutMode === 'cockpit' &&
                'Best for: Financial Terminals, Developer APMs, Observability'}
              {layoutMode === 'spatial' &&
                'Best for: AI Canvas Exploration, Prompt Graph Engineering'}
            </span>
            <span className="text-[#12603F] font-semibold">Keyboard-accessible selectors</span>
          </div>
        </div>
      </div>
    </section>
  );
}
