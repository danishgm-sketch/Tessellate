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
    { title: 'Keyboard First', desc: 'Design goal: support Tab, Enter, Space and Escape for every core control; verify keyboard behavior in your integration.' },
    { title: 'Contrast Guardrails', desc: 'Design goal: maintain WCAG AA contrast; test your final foreground and background combinations.' },
    { title: 'Reduced Motion', desc: 'Design goal: honor prefers-reduced-motion and verify that essential interactions work without animation.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Accessibility commitments — WCAG 2.2 AA target</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className={`p-6 rounded-2xl border ${card}`}>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 block">DESIGN TARGET</span>
              <h3 className="font-bold text-base mb-2">{p.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
