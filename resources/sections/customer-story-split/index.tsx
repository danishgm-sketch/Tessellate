import React from 'react';

export type CustomerStorySplitVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CustomerStorySplitProps {
  variant?: CustomerStorySplitVariant;
  company?: string;
  challenge?: string;
  solution?: string;
  storyHref?: string;
}

export function CustomerStorySplit({
  variant = 'quiet',
  company = 'Example organisation',
  challenge = 'Add a verified customer challenge and obtain approval before publishing this story.',
  solution = 'Describe the implemented solution and include only outcomes supported by customer-approved evidence.',
  storyHref,
}: CustomerStorySplitProps) {
  const noteId = React.useId();
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let box = 'bg-neutral-100 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/50 text-neutral-950 border-[#D9D6CF]';
    box = 'bg-blue-50/50 border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    box = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className={`aspect-square rounded-2xl border flex items-center justify-center p-8 text-center ${box}`}>
          <div className="flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-widest opacity-60 mb-2">Example customer story</span>
            <span className="font-bold text-lg">{company}</span>
            {!storyHref && <span id={noteId} className="text-xs opacity-75 mt-2">Replace with approved organisation details</span>}
          </div>
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4 block">Illustrative story layout</span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">Customer challenge and response</h3>
          <div className="space-y-4 text-sm opacity-80 leading-relaxed mb-6">
            <p><strong>The Challenge:</strong> {challenge}</p>
            <p><strong>The Solution:</strong> {solution}</p>
          </div>
          {storyHref ? (
            <a href={storyHref} className="text-xs font-semibold uppercase tracking-wider underline hover:opacity-75 transition-opacity">Read approved customer story →</a>
          ) : (
            <button type="button" disabled aria-describedby={noteId} className="text-xs font-semibold uppercase tracking-wider underline opacity-60 cursor-not-allowed">
              Story link not configured
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
