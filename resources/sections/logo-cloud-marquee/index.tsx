import React from 'react';

export type LogoCloudMarqueeVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LogoCloudMarqueeProps {
  variant?: LogoCloudMarqueeVariant;
  logos?: string[];
}

export function LogoCloudMarquee({
  variant = 'quiet',
  logos: suppliedLogos,
}: LogoCloudMarqueeProps) {
  const usesSampleNames = suppliedLogos === undefined;
  const logos = suppliedLogos ?? [
    'Sample Partner A',
    'Sample Partner B',
    'Sample Partner C',
    'Sample Partner D',
    'Sample Partner E',
    'Sample Partner F',
    'Sample Partner G',
    'Sample Partner H',
  ];
  let bg = 'bg-white text-neutral-800 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-900 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section
      aria-label="Partner wordmarks"
      className={`relative w-full py-10 px-6 overflow-hidden border-b transition-colors ${bg}`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        {usesSampleNames && (
          <p>Sample names only — replace with approved partner wordmarks before publishing.</p>
        )}
        <p className="ml-auto">Scroll horizontally to view all labels.</p>
      </div>
      <div
        role="region"
        aria-label="Partner names, horizontally scrollable"
        tabIndex={0}
        className="overflow-x-auto no-scrollbar focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tess-cobalt,#2547E8)]"
      >
        <div className="flex w-max min-w-full items-center gap-12 sm:gap-20 justify-center">
          {logos.map((logo, idx) => (
            <span
              key={`${logo}-${idx}`}
              className="font-mono text-sm sm:text-base font-bold tracking-tight opacity-70 shrink-0"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
