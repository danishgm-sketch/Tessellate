import React from 'react';

export type FeatureBentoVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureBentoProps {
  variant?: FeatureBentoVariant;
  title?: string;
  items?: Array<{ title: string; description: string; detail: string }>;
}

export function FeatureBento({
  variant = 'quiet',
  title = 'Explore the possibilities',
  items = [
    {
      title: 'A coherent vocabulary',
      description: 'Combine resources with compatible layouts and shared design tokens.',
      detail: 'Sample feature',
    },
    {
      title: 'Inspect the result',
      description: 'Check behaviour in your target browser and devices before release.',
      detail: 'Review required',
    },
    {
      title: 'Own your source',
      description: 'Export and adapt the interface in your own application.',
      detail: 'Portable React',
    },
    {
      title: 'Adapt to your product',
      description: 'Replace these examples with your own content and verified claims.',
      detail: 'Example content',
    },
  ],
}: FeatureBentoProps) {
  const gridColumns =
    items.length <= 1
      ? 'grid-cols-1'
      : items.length <= 3
        ? 'grid-cols-1 @md:grid-cols-2'
        : 'grid-cols-1 @md:grid-cols-3';
  const primarySpan = items.length >= 3 ? '@md:col-span-2' : '';

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440] shadow-xl';
  }

  return (
    <section
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`relative w-full py-20 px-6 @sm:px-12 border-b transition-colors ${bg}`}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl @sm:text-5xl font-bold tracking-tight text-center mb-16">
          {title}
        </h2>

        <div className={`grid ${gridColumns} gap-6`}>
          {items[0] && (
            <div
              className={`${primarySpan} p-8 rounded-[var(--tess-radius-xl,8px)] border flex flex-col justify-between min-h-[260px] ${card}`}
            >
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[var(--tess-ink-muted,#62666F)] mb-2 block">
                  Flagship Feature
                </span>
                <h3 className="text-2xl font-bold mb-3">{items[0]?.title}</h3>
                <p className="text-sm opacity-80 max-w-lg leading-relaxed">
                  {items[0]?.description}
                </p>
              </div>
              <div className="h-10 rounded-[var(--tess-radius-lg,8px)] bg-neutral-200/60 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 flex items-center px-4 font-mono text-xs">
                {items[0]?.detail}
              </div>
            </div>
          )}

          {items[1] && (
            <div
              className={`p-8 rounded-[var(--tess-radius-xl,8px)] border flex flex-col justify-between min-h-[260px] ${card}`}
            >
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[var(--tess-ink-muted,#62666F)] mb-2 block">
                  Everyday experience
                </span>
                <h3 className="text-xl font-bold mb-2">{items[1]?.title}</h3>
                <p className="text-xs opacity-75 leading-relaxed">{items[1]?.description}</p>
              </div>
              <div className="text-sm font-mono font-bold">{items[1]?.detail}</div>
            </div>
          )}

          {items[2] && (
            <div
              className={`p-8 rounded-[var(--tess-radius-xl,8px)] border flex flex-col justify-between min-h-[240px] ${card}`}
            >
              <div>
                <h3 className="text-lg font-bold mb-2">{items[2]?.title}</h3>
                <p className="text-xs opacity-75">{items[2]?.description}</p>
              </div>
              <span className="text-xs font-mono">{items[2]?.detail}</span>
            </div>
          )}

          {items[3] && (
            <div
              className={`@md:col-span-2 p-8 rounded-[var(--tess-radius-xl,8px)] border flex flex-col justify-between min-h-[240px] ${card}`}
            >
              <div>
                <h3 className="text-lg font-bold mb-2">{items[3]?.title}</h3>
                <p className="text-xs opacity-75 max-w-md">{items[3]?.description}</p>
              </div>
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="h-3 w-3 rounded-full bg-purple-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
