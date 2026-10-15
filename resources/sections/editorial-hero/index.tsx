import React from 'react';

export type EditorialHeroVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EditorialHeroProps {
  /** Small line above the heading, e.g. the product name or a short announcement. */
  eyebrow?: string;
  heading?: string;
  description?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  /** Reassurance under the buttons, e.g. "No card needed". */
  note?: string;
  variant?: EditorialHeroVariant;
}

/** Text-led hero with a strong heading, supporting line and up to two actions. */
export function EditorialHero({
  eyebrow,
  heading = 'Say what your product does in one clear sentence.',
  description = 'Add a short line about who it is for and the main benefit. Replace this sample text with your own.',
  primaryActionLabel = 'Get started',
  primaryActionHref = '#',
  secondaryActionLabel,
  secondaryActionHref = '#',
  note,
  variant = 'quiet',
}: EditorialHeroProps) {
  const shell = variant === 'expressive' ? 'bg-accent-soft' : variant === 'nocturne' ? 'bg-surface border-y-2 border-hairline-strong' : 'bg-canvas';

  return (
    <section className={`w-full px-4 py-16 font-body text-ink sm:px-6 sm:py-24 ${shell}`}>
      <div className="mx-auto max-w-3xl">
        {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{heading}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-secondary">{description}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {primaryActionLabel && (
            <a
              href={primaryActionHref}
              className="inline-flex items-center rounded-ui-sm bg-accent px-5 py-3 text-base font-semibold text-on-accent transition-colors duration-150 ease-ui hover:bg-accent-hover motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {primaryActionLabel}
            </a>
          )}
          {secondaryActionLabel && (
            <a
              href={secondaryActionHref}
              className="inline-flex items-center rounded-ui-sm border border-hairline-strong bg-surface-raised px-5 py-3 text-base font-semibold text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              {secondaryActionLabel}
            </a>
          )}
        </div>
        {note && <p className="mt-4 text-sm text-ink-secondary">{note}</p>}
      </div>
    </section>
  );
}
