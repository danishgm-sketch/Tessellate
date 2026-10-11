import React, { useState } from 'react';

export type FloatingAIAssistantVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FloatingAIAssistantProps {
  variant?: FloatingAIAssistantVariant;
}

export function FloatingAIAssistant({ variant = 'quiet' }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-xl'
      : 'bg-white border-neutral-200 text-neutral-900 shadow-lg';

  const triggerBg =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black hover:bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white hover:bg-blue-700'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  return (
    <div className="relative inline-flex flex-col items-end">
      {isOpen && (
        <div className={`w-80 p-4 rounded-xl border mb-3 flex flex-col gap-3 transition-all ${cardBg}`}>
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold">Tessellate Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-xs text-neutral-400 hover:text-current">
              ✕
            </button>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Need help selecting an archetype or generating tokens? Choose a quick question below:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['Explain Design DNA', 'Check AA Contrast', 'Export Manifest'].map((chip) => (
              <button
                key={chip}
                className="text-[11px] px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform hover:scale-105 ${triggerBg}`}
        aria-label="Toggle AI Assistant"
      >
        ✦
      </button>
    </div>
  );
}
