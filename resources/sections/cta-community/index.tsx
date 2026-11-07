import React from 'react';

export type CtaCommunityVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaCommunityProps {
  variant?: CtaCommunityVariant;
  guideHref?: string;
  repositoryHref?: string;
}

export function CtaCommunity({ variant = 'quiet', guideHref, repositoryHref }: CtaCommunityProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-blue-50/20 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Contribute to the public commons</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">
          Read the contributor guide or browse the source repository to learn how to share a
          resource.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {guideHref && (
            <a
              href={guideHref}
              className="px-6 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold"
            >
              Read contributor guide
            </a>
          )}
          {repositoryHref && (
            <a
              href={repositoryHref}
              className="px-6 py-2.5 rounded-lg border text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              View repository
            </a>
          )}
          {!guideHref && !repositoryHref && (
            <p role="status" className="text-xs opacity-75">
              Set guideHref or repositoryHref to add a destination.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
