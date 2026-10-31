import React from 'react';

export type ComplianceProofVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ComplianceProofProps {
  variant?: ComplianceProofVariant;
}

export function ComplianceProof({ variant = 'quiet' }: ComplianceProofProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Compliance Evidence Template</h2>
        <p className="text-xs sm:text-sm opacity-80 max-w-xl mx-auto mb-12">
          Illustrative layout. Add current evidence and scope before making compliance claims about your product.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div className={`p-6 rounded-2xl border ${card}`}>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500 mb-2 block">SOC 2 Type II</span>
            <p className="text-xs opacity-75">Evidence required: add a current report, audit period, scope and issuing organisation.</p>
          </div>
          <div className={`p-6 rounded-2xl border ${card}`}>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500 mb-2 block">GDPR & CCPA</span>
            <p className="text-xs opacity-75">Policy review required: describe implemented residency, retention and deletion controls.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
