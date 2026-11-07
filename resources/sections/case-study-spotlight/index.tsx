import React from 'react';

export type CaseStudySpotlightVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CaseStudySpotlightProps {
  variant?: CaseStudySpotlightVariant;
  client?: string;
  metric?: string;
  metricLabel?: string;
  headline?: string;
  summary?: string;
  caseStudyHref?: string;
}

export function CaseStudySpotlight({
  variant = 'quiet',
  client = 'Example organisation',
  metric = '—',
  metricLabel = 'Add a verified outcome before publishing',
  headline = 'Example customer result',
  summary = 'Add a customer-approved story and evidence for each outcome before publishing this section.',
  caseStudyHref,
}: CaseStudySpotlightProps) {
  const noteId = React.useId();
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-sm';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-gradient-to-br from-blue-50/50 to-white border-blue-200 shadow-xl';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-2xl';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`rounded-2xl border p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center ${card}`}>
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 pb-8 md:pb-0 md:pr-8">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-4 block">{client}</span>
            <div className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mb-2">{metric}</div>
            <p className="text-xs font-medium opacity-80">{metricLabel}</p>
            {!caseStudyHref && <p id={noteId} className="text-xs text-neutral-500 mt-3">Example content. Replace with approved customer details.</p>}
          </div>
          <div className="md:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">{headline}</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-6">{summary}</p>
            {caseStudyHref ? (
              <a href={caseStudyHref} className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75 transition-opacity">Read case study →</a>
            ) : (
              <button type="button" disabled aria-describedby={noteId} className="text-xs font-semibold uppercase tracking-wider underline opacity-60 cursor-not-allowed">
                Case study link not configured
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
