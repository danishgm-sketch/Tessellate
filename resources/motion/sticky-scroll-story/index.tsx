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
    { title: '01. Ingestion', text: 'Telemetry streams continuously into edge workers with sub-5ms routing.' },
    { title: '02. Validation', text: 'Deterministic schema validation rejects malformed packets at the gateway boundary.' },
    { title: '03. Synthesis', text: 'Composed UI manifests update in real-time with zero client bundle penalties.' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col md:flex-row gap-6 transition-colors ${cardBg}`}>
      <div className="flex-1 space-y-4">
        <h4 className="text-sm font-semibold tracking-tight">Sticky Story Chapters</h4>
        <div className="space-y-2">
          {chapters.map((c, idx) => (
            <div
              key={c.title}
              onClick={() => setActiveChapter(idx)}
              className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                activeChapter === idx
                  ? 'border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-800 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="mb-0.5">{c.title}</div>
              <div className="text-[11px] text-neutral-500 font-normal leading-relaxed">{c.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
        <div className="text-xs font-mono uppercase text-neutral-400 mb-1">Active Visual State</div>
        <div className="text-base font-bold mb-2">{chapters[activeChapter]?.title}</div>
        <div className="w-16 h-16 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xl font-bold font-mono">
          {activeChapter + 1}
        </div>
      </div>
    </div>
  );
}
