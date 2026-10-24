import React from 'react';

export type TrustBadgesStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TrustBadgesStripProps {
  variant?: TrustBadgesStripVariant;
  badges?: string[];
}

export function TrustBadgesStrip({
  variant = 'quiet',
  badges = ['SOC 2: EVIDENCE REQUIRED', 'ISO 27001: VERIFY SCOPE', 'PRIVACY: REVIEW POLICY', 'WCAG 2.2 AA: TARGET'],
}: TrustBadgesStripProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-800 border-neutral-200';
  let badgeStyle = 'bg-white text-neutral-700 border-neutral-300';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-900 border-[#D9D6CF]';
    badgeStyle = 'bg-blue-50/50 text-[#2547E8] border-blue-200 font-semibold';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    badgeStyle = 'bg-[#151921] text-cyan-300 border-[#2E3440] font-mono';
  }

  return (
    <section className={`relative w-full py-12 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-4">
        <p className="w-full text-center text-xs opacity-75">
          Sample labels only. Show claims your team can substantiate.
        </p>
        {badges.map((b) => (
          <div key={b} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs border tracking-wider shadow-2xs transition-colors ${badgeStyle}`}>
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
            <span>{b}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
