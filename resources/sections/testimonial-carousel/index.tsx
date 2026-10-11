import React, { useState } from 'react';

export type TestimonialCarouselVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TestimonialCarouselProps {
  variant?: TestimonialCarouselVariant;
  items?: Array<{ quote: string; author: string; company: string }>;
}

export function TestimonialCarousel({
  variant = 'quiet',
  items = [
    { quote: 'We rebuilt our entire data suite using Tessellate in under three weeks.', author: 'Samantha Reed', company: 'Nova Logic' },
    { quote: 'The Design DNA system eliminated endless meetings about spacing and colors.', author: 'Liam Gallagher', company: 'Aether OS' },
    { quote: 'Our lighthouse scores went from 68 to 100 on desktop and mobile.', author: 'Kenji Sato', company: 'HyperScale' },
  ],
}: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const current = items[index] || items[0] || { quote: '', author: '', company: '' };

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <div className={`w-full p-8 sm:p-12 rounded-2xl border text-center transition-all ${card}`}>
          <p className="text-lg sm:text-2xl font-medium tracking-tight mb-8 leading-snug">
            "{current.quote}"
          </p>
          <div className="font-semibold text-sm">{current.author}</div>
          <div className="text-xs opacity-70 mb-8">{current.company}</div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              ←
            </button>
            <span className="text-xs font-mono opacity-60">
              {index + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
