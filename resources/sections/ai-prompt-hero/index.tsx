import React, { useState } from 'react';

export type AiPromptHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AiPromptHeroProps {
  variant?: AiPromptHeroVariant;
  headline?: string;
  subheadline?: string;
}

export function AiPromptHero({
  variant = 'quiet',
  headline = 'Describe your product. Generate the entire interface system.',
  subheadline = 'Tessellate pairs natural language intent with deterministic layout grammars and accessible schemas.',
}: AiPromptHeroProps) {
  const [prompt, setPrompt] = useState('');
  const presets = [
    'A high-density trading terminal with Nocturne styling',
    'A modern B2B SaaS analytics dashboard with 3-tier pricing',
    'A minimalist developer documentation portal',
  ];

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let box = 'bg-white border-neutral-300 shadow-sm';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg = 'bg-gradient-to-b from-blue-50/50 via-white to-purple-50/30 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-xl ring-1 ring-blue-500/10';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] shadow-2xl';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section className={`relative w-full py-24 sm:py-32 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">{headline}</h1>
        <p className="text-base sm:text-lg opacity-75 max-w-xl mb-10">{subheadline}</p>

        <div className={`w-full rounded-2xl border p-4 text-left transition-all ${box}`}>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. Create a healthcare admin console with patient timeline and audit log..."
            className="w-full bg-transparent text-sm sm:text-base outline-none resize-none placeholder:text-neutral-400"
          />
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-mono opacity-60">Engine: Gemini 2.5 Flash / BYO Key</span>
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${btn}`}
            >
              Synthesize Blueprint →
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 justify-center text-xs">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrompt(p)}
              className="px-3 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800 opacity-80 hover:opacity-100 transition-opacity truncate max-w-xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
