import React, { useState } from 'react';
import { SHOWCASE_PROJECTS } from '@tessellate/composer';
import { ArrowRight, Sliders, ExternalLink } from 'lucide-react';

export function ShowcasesGallery() {
  const [activeId, setActiveId] = useState<string>(SHOWCASE_PROJECTS[0]!.id);
  const activeShowcase = SHOWCASE_PROJECTS.find((s) => s.id === activeId) ?? SHOWCASE_PROJECTS[0]!;

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      {/* Selector pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
        {SHOWCASE_PROJECTS.map((sc) => {
          const isSelected = sc.id === activeId;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveId(sc.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-[#111217] text-white border-[#111217] shadow-sm'
                  : 'bg-white/80 text-[#62666F] border-[#D9D6CF] hover:border-[#111217] hover:text-[#111217]'
              }`}
            >
              {sc.name.split(' ')[0]} • {sc.dnaPresetName}
            </button>
          );
        })}
      </div>

      {/* Featured Showcase Card */}
      <div className={`p-6 sm:p-8 md:p-12 rounded-2xl border transition-colors max-w-full overflow-hidden ${
        activeShowcase.colorMode === 'dark'
          ? 'bg-[#0B0D10] text-white border-[#2E3440]'
          : 'bg-white text-[#111217] border-[#D9D6CF]'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                activeShowcase.colorMode === 'dark' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-[#E8E6DF] text-[#111217]'
              }`}>
                {activeShowcase.archetypeId}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Navigation: {activeShowcase.navigationModel}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {activeShowcase.name}
            </h2>
            <p className="text-base text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xl">
              {activeShowcase.tagline}. Composed deterministically from canonical open resources with zero framework lock-in.
            </p>

            {/* Screen tags */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 block">
                Composed Screens ({activeShowcase.manifest.screens.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {activeShowcase.manifest.screens.map((screen) => (
                  <span
                    key={screen.id}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-neutral-200/40 bg-neutral-100/50 dark:bg-neutral-900/50 dark:border-neutral-800"
                  >
                    {screen.name} ({screen.slug})
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3 items-center">
              <a
                href={`/workbench?showcase=${activeShowcase.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2547E8] text-white hover:bg-[#1E3AB8] transition-colors shadow-sm"
              >
                Inspect in Workbench
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={`/data/showcases/${activeShowcase.id}.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                View Manifest JSON
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>
          </div>

          {/* Right column: DNA Radar Metrics */}
          <div className="lg:col-span-5 p-6 rounded-xl border border-neutral-200/20 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200/20 pb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                Design DNA Profile
              </span>
              <span className="text-xs font-mono font-bold text-neutral-500">
                {activeShowcase.dnaPresetName}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Professionalism</span>
                <span className="font-bold">{activeShowcase.designDNA.professionalism}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Technicality</span>
                <span className="font-bold">{activeShowcase.designDNA.technicality}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Data Density</span>
                <span className="font-bold">{activeShowcase.designDNA.dataDensity}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Visual Ambition</span>
                <span className="font-bold">{activeShowcase.designDNA.visualAmbition}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Whitespace</span>
                <span className="font-bold">{activeShowcase.designDNA.whitespace}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Accessibility Priority</span>
                <span className="font-bold">{activeShowcase.designDNA.accessibilityPriority}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
