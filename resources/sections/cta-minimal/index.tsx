import React, { useId } from 'react';

export type CtaMinimalVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaMinimalProps {
  heading?: string;
  description?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  variant?: CtaMinimalVariant;
}

/** Closing call to action: one heading, one line and up to two buttons. */
export function CtaMinimal({
  heading = 'Get started today.',
  description = 'Sample text: one sentence that tells people what happens when they click.',
  primaryActionLabel = 'Get started',
  primaryActionHref = '#',
  secondaryActionLabel,
  secondaryActionHref = '#',
  variant = 'quiet',
}: CtaMinimalProps) {
  const id = useId();
  const shell = variant === 'expressive' ? 'bg-accent-soft' : variant === 'nocturne' ? 'bg-surface border-y-2 border-hairline-strong' : 'bg-surface';

  return (
    <section className={`w-full px-4 py-16 text-center font-body text-ink sm:px-6 ${shell}`} aria-labelledby={`${id}-heading`}>
      <div className="mx-auto max-w-2xl">
        <h2 id={`${id}-heading`} className="font-heading text-3xl font-semibold">
          {heading}
        </h2>
        {description && <p className="mt-3 text-lg text-ink-secondary">{description}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {primaryActionLabel && (
            <a href={primaryActionHref} className="inline-flex rounded-ui-sm bg-accent px-5 py-3 text-base font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              {primaryActionLabel}
            </a>
          )}
          {secondaryActionLabel && (
            <a href={secondaryActionHref} className="inline-flex rounded-ui-sm border border-hairline-strong bg-surface-raised px-5 py-3 text-base font-semibold text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              {secondaryActionLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
