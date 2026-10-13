import React from 'react';

export type AccessibilityCommitmentSectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AccessibilityCommitmentSectionProps {
  variant?: AccessibilityCommitmentSectionVariant;
}

export function AccessibilityCommitmentSection({ variant = 'quiet' }: AccessibilityCommitmentSectionProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const pillars = [
    { title: 'Keyboard First', desc: '100% of interactive controls support standard Tab, Enter, Space, and Escape navigation.' },
    { title: 'Contrast Guardrails', desc: 'Every color token is algorithmically verified to pass 4.5:1 AA ratios against its background.' },
    { title: 'Reduced Motion', desc: 'Interfaces respect prefers-reduced-motion automatically, replacing springs with clean crossfades.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Universal Accessibility (WCAG 2.2 AA)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className={`p-6 rounded-2xl border ${card}`}>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 block">AA CERTIFIED</span>
              <h3 className="font-bold text-base mb-2">{p.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
