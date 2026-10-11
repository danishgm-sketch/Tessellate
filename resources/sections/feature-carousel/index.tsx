import React, { useState } from 'react';

export type FeatureCarouselVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureCarouselProps {
  variant?: FeatureCarouselVariant;
}

export function FeatureCarousel({ variant = 'quiet' }: FeatureCarouselProps) {
  const [idx, setIdx] = useState(0);
  const cards = [
    { title: 'Composition Engine', desc: 'Drag, nest, and mutate verified components dynamically.' },
    { title: 'Design DNA Lab', desc: 'Tune 25+ visual dimensions across your entire layout in real time.' },
    { title: 'Accessibility Lab', desc: 'Simulate color blindness, verify contrast, and test keyboard focus.' },
  ];

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const currentCard = cards[idx] || cards[0] || { title: '', desc: '' };

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Feature Reel</h2>

        <div className={`w-full p-8 rounded-2xl border text-center transition-all ${card}`}>
          <span className="text-xs font-mono font-bold text-neutral-500 mb-2 block">0{idx + 1} / 0{cards.length}</span>
          <h3 className="text-2xl font-bold mb-4">{currentCard.title}</h3>
          <p className="text-sm opacity-80 max-w-md mx-auto mb-8">{currentCard.desc}</p>

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setIdx((i) => (i === 0 ? cards.length - 1 : i - 1))}
              className="px-4 py-1.5 rounded-lg border text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setIdx((i) => (i === cards.length - 1 ? 0 : i + 1))}
              className="px-4 py-1.5 rounded-lg border text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
