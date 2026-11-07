import React, { useState } from 'react';

export type FeatureTabsVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureTabsProps {
  variant?: FeatureTabsVariant;
}

export function FeatureTabs({ variant = 'quiet' }: FeatureTabsProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'code' | 'agents'>('design');

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let tabActive = 'bg-neutral-900 text-white';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    tabActive = 'bg-[#2547E8] text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    tabActive = 'bg-cyan-500 text-black font-semibold';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-center mb-8">One system for people and tools.</h2>

        <div className="flex max-w-full flex-wrap justify-center gap-2 p-1.5 rounded-xl bg-neutral-200/60 dark:bg-neutral-800 mb-12">
          {(['design', 'code', 'agents'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`px-3 sm:px-6 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab ? tabActive : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              For {tab}
            </button>
          ))}
        </div>

        <div className="w-full p-8 sm:p-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151921] text-center max-w-3xl shadow-sm">
          {activeTab === 'design' && (
            <div>
              <h3 className="text-xl font-bold mb-2">Designers adjust a shared set of style controls.</h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-lg mx-auto">Change Design DNA values and review how the selected project responds.</p>
            </div>
          )}
          {activeTab === 'code' && (
            <div>
              <h3 className="text-xl font-bold mb-2">Engineers get raw React & Tailwind source code.</h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-lg mx-auto">Exported React source can be reviewed and adapted in your own project.</p>
            </div>
          )}
          {activeTab === 'agents' && (
            <div>
              <h3 className="text-xl font-bold mb-2">Agents can use schemas and MCP tools.</h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-lg mx-auto">Agents can read project manifests and use MCP tools; review generated output before relying on it.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
