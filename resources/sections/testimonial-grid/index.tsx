import React from 'react';

export type TestimonialGridVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TestimonialGridProps {
  variant?: TestimonialGridVariant;
  title?: string;
  testimonials?: Array<{ quote: string; author: string; role: string; company: string }>;
}

export function TestimonialGrid({
  variant = 'quiet',
  title = 'Loved by builders, engineers, and product designers.',
  testimonials = [
    { quote: 'The cleanest component architecture I have seen in modern React.', author: 'Marcus Vance', role: 'Staff Engineer', company: 'Linear Systems' },
    { quote: 'Reduced our front-end maintenance overhead to near zero.', author: 'Aria Chen', role: 'CTO', company: 'Prism Health' },
    { quote: 'Zero lock-in means our team owns every byte of output.', author: 'Devon Patel', role: 'Lead Architect', company: 'Apex Cloud' },
  ],
}: TestimonialGridProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-2xs';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/40 border-blue-100 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-lg';
  }

  return (
    <section className={`relative w-full py-20 sm:py-28 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-center mb-16">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.author} className={`p-6 rounded-xl border flex flex-col justify-between ${card}`}>
              <div className="mb-6">
                <div className="text-amber-500 text-xs mb-3">★★★★★</div>
                <p className="text-sm opacity-90 leading-relaxed">"{t.quote}"</p>
              </div>
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <div className="font-semibold text-xs">{t.author}</div>
                <div className="text-[11px] opacity-70">{t.role}, {t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
