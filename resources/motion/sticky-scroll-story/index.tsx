import React, { useState } from 'react';

export type StickyScrollStoryVariant = 'quiet' | 'expressive' | 'nocturne';

export interface StickyScrollStoryProps {
  variant?: StickyScrollStoryVariant;
}

export function StickyScrollStory({ variant = 'quiet' }: StickyScrollStoryProps) {
  const [activeChapter, setActiveChapter] = useState(0);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const chapters = [
    { title: '01. Gather', text: 'Bring together the information your team needs from the systems it uses.' },
    { title: '02. Review', text: 'Check the inputs before work moves to the next step.' },
    { title: '03. Share', text: 'Show a clear result that people can understand and act on.' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col md:flex-row gap-6 transition-colors ${cardBg}`}>
      <div className="flex-1 space-y-4">
        <h4 className="text-sm font-semibold tracking-tight">Story chapters</h4>
        <div className="space-y-2">
          {chapters.map((c, idx) => (
            <button
              type="button"
              key={c.title}
              aria-pressed={activeChapter === idx}
              onClick={() => setActiveChapter(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                activeChapter === idx
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mb-0.5">{c.title}</div>
              <div className="text-[11px] text-neutral-500 font-normal leading-relaxed">{c.text}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
        <div className="text-xs font-mono uppercase text-neutral-400 mb-1">Selected chapter</div>
        <div className="text-base font-bold mb-2">{chapters[activeChapter]?.title}</div>
        <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold font-mono">
          {activeChapter + 1}
        </div>
      </div>
    </div>
  );
}
