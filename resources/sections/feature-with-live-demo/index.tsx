import React, { useState } from 'react';

export type FeatureWithLiveDemoVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureWithLiveDemoProps {
  variant?: FeatureWithLiveDemoVariant;
}

export function FeatureWithLiveDemo({ variant = 'quiet' }: FeatureWithLiveDemoProps) {
  const [active, setActive] = useState(true);

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-mono font-bold uppercase text-neutral-500 mb-3 block">Live Sandbox</span>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Tactile state transitions without re-render cascades.</h2>
          <p className="text-sm opacity-80 leading-relaxed mb-6">
            Observe how state toggles propagate smoothly across nested manifests without incurring unwanted DOM rewrites.
          </p>
        </div>

        <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${card}`}>
          <span className="text-xs font-mono opacity-60 mb-6">Interactive Toggle Component</span>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`px-6 py-3 rounded-xl font-semibold text-xs tracking-wider transition-all ${
              active ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            {active ? 'SYSTEM ACTIVE [ONLINE]' : 'SYSTEM STANDBY [OFFLINE]'}
          </button>
        </div>
      </div>
    </section>
  );
}
