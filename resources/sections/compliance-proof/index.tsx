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
        <h2 className="text-3xl font-bold tracking-tight mb-8">Audited Regulatory Compliance</h2>
        <p className="text-xs sm:text-sm opacity-80 max-w-xl mx-auto mb-12">
          Independent third-party audits verify that Tessellate satisfies rigorous global data protection standards.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          <div className={`p-6 rounded-2xl border ${card}`}>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500 mb-2 block">SOC 2 Type II</span>
            <p className="text-xs opacity-75">Full annual audit covering Security, Availability, and Confidentiality trust principles.</p>
          </div>
          <div className={`p-6 rounded-2xl border ${card}`}>
            <span className="font-mono text-xs font-bold uppercase text-neutral-500 mb-2 block">GDPR & CCPA</span>
            <p className="text-xs opacity-75">Guaranteed data residency controls, zero third-party telemetry, and instant data deletion.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
