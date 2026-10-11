import React from 'react';

export type SocialProofHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SocialProofHeroProps {
  variant?: SocialProofHeroVariant;
  headline?: string;
  subheadline?: string;
  userCount?: string;
  rating?: string;
}

export function SocialProofHero({
  variant = 'quiet',
  headline = 'Trusted by 40,000+ engineers building modern web applications.',
  subheadline = 'From early-stage startups to publicly traded technology companies, Tessellate powers reliable UI architecture.',
  userCount = '42,800+ teams',
  rating = '4.9/5 from 1,200 reviews',
}: SocialProofHeroProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let badge = 'bg-neutral-100 text-neutral-700';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/50 via-white to-neutral-50 text-neutral-950 border-[#D9D6CF]';
    badge = 'bg-blue-100 text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    badge = 'bg-[#151921] text-cyan-400 border border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="inline-block h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-700 ring-2 ring-white dark:ring-[#0B0D10]" />
            ))}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${badge}`}>
            ★ {rating}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
          {headline}
        </h1>
        <p className="text-base sm:text-lg opacity-80 max-w-2xl mb-10 leading-relaxed">
          {subheadline}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono opacity-60">
          <span>{userCount}</span>
          <span>•</span>
          <span>Zero security incidents</span>
          <span>•</span>
          <span>SOC2 Type II</span>
        </div>
      </div>
    </section>
  );
}
