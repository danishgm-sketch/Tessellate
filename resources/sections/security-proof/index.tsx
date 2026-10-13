import React from 'react';

export type SecurityProofVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SecurityProofProps {
  variant?: SecurityProofVariant;
}

export function SecurityProof({ variant = 'quiet' }: SecurityProofProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  const items = [
    { title: 'End-to-End Encryption', desc: 'Encrypted at rest using AES-256 and in transit via TLS 1.3.' },
    { title: 'No Arbitrary Eval Runtime', desc: 'Zero runtime eval or dynamic arbitrary script injection.' },
    { title: 'Isolated Sandboxes', desc: 'Untrusted previews run in sandboxed cross-origin iframes.' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-16">Enterprise Security Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it) => (
            <div key={it.title} className={`p-6 rounded-2xl border ${card}`}>
              <span className="text-emerald-500 font-mono text-sm block mb-3">✓ SECURE</span>
              <h3 className="font-bold text-base mb-2">{it.title}</h3>
              <p className="text-xs sm:text-sm opacity-75 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
