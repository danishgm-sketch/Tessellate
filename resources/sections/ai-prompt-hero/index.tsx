import React, { useId, useState } from 'react';

export type AiPromptHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AiPromptHeroProps {
  variant?: AiPromptHeroVariant;
  headline?: string;
  subheadline?: string;
  onGenerate?: (prompt: string) => void;
}

export function AiPromptHero({
  variant = 'quiet',
  headline = 'Describe the product you want to shape.',
  subheadline = 'Start with a plain-language brief. Connect this pattern to your own generation flow when you use it in an application.',
  onGenerate,
}: AiPromptHeroProps) {
  const [prompt, setPrompt] = useState('');
  const inputId = useId();
  const instructionsId = `${inputId}-instructions`;
  const presets = [
    'An employee onboarding workspace for a growing team',
    'A developer documentation portal with searchable guides',
    'A subscription billing dashboard for small businesses',
  ];

  let bg = 'bg-[#FAF8F5] text-neutral-900 border-neutral-200';
  let box = 'bg-white border-neutral-300 shadow-sm';
  let btn = 'bg-neutral-900 text-white hover:bg-neutral-800';

  if (variant === 'expressive') {
    bg =
      'bg-gradient-to-b from-blue-50/50 via-white to-purple-50/30 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-white border-blue-200 shadow-xl ring-1 ring-blue-500/10';
    btn = 'bg-[#2547E8] text-white hover:bg-[#1B35B4] shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440] shadow-2xl';
    btn = 'bg-cyan-500 text-black hover:bg-cyan-400 font-medium';
  }

  return (
    <section
      className={`relative w-full min-w-0 py-24 sm:py-32 px-4 sm:px-12 border-b transition-colors ${bg}`}
    >
      <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col items-center text-center">
        <h1 className="mb-4 max-w-full break-words text-3xl font-bold tracking-tight sm:text-5xl">
          {headline}
        </h1>
        <p className="mb-10 w-full min-w-0 max-w-xl break-words text-base opacity-75 sm:text-lg">
          {subheadline}
        </p>

        <div className={`w-full rounded-2xl border p-4 text-left transition-all ${box}`}>
          <textarea
            id={inputId}
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Describe the product or workflow"
            aria-describedby={instructionsId}
            placeholder="Describe the product or workflow you have in mind..."
            className="block w-full min-w-0 max-w-full bg-transparent text-sm sm:text-base outline-none resize-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-blue-600"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <p
              id={instructionsId}
              className="min-w-0 flex-1 basis-full break-words text-xs opacity-75 sm:basis-auto"
            >
              {onGenerate
                ? 'This example sends the prompt only to the onGenerate handler supplied by its host.'
                : 'Preview only. This example keeps your prompt on this page and does not generate a blueprint.'}
            </p>
            <button
              type="button"
              disabled={!onGenerate || !prompt.trim()}
              onClick={() => onGenerate?.(prompt.trim())}
              aria-describedby={instructionsId}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${btn}`}
            >
              Generate Blueprint
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 justify-center text-xs">
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrompt(p)}
              className="max-w-full whitespace-normal break-words rounded-full bg-neutral-200/60 px-3 py-1 text-left opacity-80 transition-opacity hover:opacity-100 dark:bg-neutral-800 sm:max-w-xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
