import React, { useState } from 'react';

export type FloatingAIAssistantVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FloatingAIAssistantProps {
  variant?: FloatingAIAssistantVariant;
  onSelectPrompt?: (prompt: string) => void;
}

const EXAMPLE_RESPONSES: Record<string, string> = {
  'Explain Design DNA':
    'Example preview reply (no AI provider connected): Design DNA adjusts visual density, spacing, contrast, and corner radius tokens.',
  'Check AA Contrast':
    'Example preview reply (no AI provider connected): Run WCAG AA contrast verification across every rendered variant.',
  'Export Manifest':
    'Example preview reply (no AI provider connected): Export your project manifest or standalone build from the host app.',
};

export function FloatingAIAssistant({
  variant = 'quiet',
  onSelectPrompt,
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-lg';

  const secondaryText = variant === 'nocturne' ? 'text-neutral-300' : 'text-neutral-700';

  const triggerBg =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black hover:bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white hover:bg-blue-700'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  return (
    <div className="relative flex w-full max-w-80 flex-col items-end">
      {isOpen && (
        <div className={`w-full p-4 rounded-xl border mb-3 flex flex-col gap-3 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-semibold">Tessellate Assistant (Example)</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant panel"
              className={`text-xs hover:text-current px-1.5 py-0.5 rounded ${secondaryText}`}
            >
              ✕
            </button>
          </div>
          <p className={`text-xs leading-relaxed ${secondaryText}`}>
            Need help selecting a layout direction or generating tokens? Choose an example prompt below:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(EXAMPLE_RESPONSES).map((chip) => {
              const active = selectedPrompt === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedPrompt(chip);
                    onSelectPrompt?.(chip);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? 'border-[#2547E8] font-semibold'
                      : variant === 'nocturne'
                      ? 'border-[#2E3440] hover:bg-[#151921]'
                      : 'border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
          {selectedPrompt && (
            <p role="status" className={`text-xs leading-relaxed border-t pt-2 border-neutral-200 dark:border-neutral-800 ${secondaryText}`}>
              {EXAMPLE_RESPONSES[selectedPrompt]}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform hover:scale-105 ${triggerBg}`}
        aria-label="Toggle AI Assistant"
      >
        ✦
      </button>
    </div>
  );
}
