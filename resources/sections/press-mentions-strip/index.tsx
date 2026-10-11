import React from 'react';

export type PressMentionsStripVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PressMentionsStripProps {
  variant?: PressMentionsStripVariant;
  quotes?: Array<{ outlet: string; quote: string }>;
}

export function PressMentionsStrip({
  variant = 'quiet',
  quotes = [
    { outlet: 'TechCrunch', quote: 'Tessellate redefines how software teams approach UI coherence.' },
    { outlet: 'Wired', quote: 'A monumental step forward for autonomous coding agents and human designers.' },
    { outlet: 'The Verge', quote: 'Finally, an open-source interface architecture with taste.' },
  ],
}: PressMentionsStripProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50/60 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-16 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {quotes.map((q) => (
          <div key={q.outlet} className={`p-6 rounded-xl border flex flex-col justify-between ${card}`}>
            <p className="text-sm italic opacity-90 mb-6 leading-relaxed">"{q.quote}"</p>
            <span className="font-bold text-xs uppercase tracking-wider font-mono opacity-70">{q.outlet}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
