import React from 'react';

export type ApiCapabilitySectionVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ApiCapabilitySectionProps {
  variant?: ApiCapabilitySectionVariant;
}

export function ApiCapabilitySection({ variant = 'quiet' }: ApiCapabilitySectionProps) {
  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let card = 'bg-white border-neutral-200 font-mono text-xs';

  if (variant === 'expressive') {
    bg = 'bg-white text-neutral-950 border-[#D9D6CF]';
    card = 'bg-blue-50/30 border-blue-100 shadow-sm font-mono text-xs';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] font-mono text-xs';
  }

  const endpoints = [
    { method: 'GET', path: '/api/v1/resources/:slug', desc: 'Retrieve verified JSON manifest' },
    { method: 'POST', path: '/api/v1/compose', desc: 'Validate and compile project tree' },
    { method: 'GET', path: '/api/v1/dna/tokens', desc: 'Query calibrated Design DNA dimensions' },
  ];

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Programmatic API Access</h2>

        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.path} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${card}`}>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">{ep.method}</span>
                <span className="font-semibold">{ep.path}</span>
              </div>
              <span className="text-xs opacity-70 font-sans">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
