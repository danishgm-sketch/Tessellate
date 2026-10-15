import React, { useId } from 'react';

export type FeatureGrid3x2Variant = 'quiet' | 'expressive' | 'nocturne';

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeatureGrid3x2Props {
  heading?: string;
  description?: string;
  /** Up to six features; extra items are ignored. */
  items?: FeatureItem[];
  variant?: FeatureGrid3x2Variant;
}

const SAMPLE: FeatureItem[] = [
  { title: 'Book in seconds', description: 'Sample feature: replace with a real benefit for your customers.' },
  { title: 'Reminders that work', description: 'Sample feature: replace with a real benefit for your customers.' },
  { title: 'Everything in one place', description: 'Sample feature: replace with a real benefit for your customers.' },
];

/** Feature or benefit grid: one column on phones, two on tablets, three on desktop. */
export function FeatureGrid3x2({ heading = 'Why people choose us', description, items, variant = 'quiet' }: FeatureGrid3x2Props) {
  const id = useId();
  const features = (items && items.length > 0 ? items : SAMPLE).slice(0, 6);
  const card = variant === 'expressive' ? 'bg-surface-raised shadow-ui-2 border border-hairline' : variant === 'nocturne' ? 'bg-surface border-2 border-hairline-strong' : 'bg-surface-raised border border-hairline';

  return (
    <section className="w-full bg-canvas px-4 py-16 font-body text-ink sm:px-6" aria-labelledby={`${id}-heading`}>
      <div className="mx-auto max-w-6xl">
        <h2 id={`${id}-heading`} className="max-w-2xl font-heading text-3xl font-semibold">
          {heading}
        </h2>
        {description && <p className="mt-3 max-w-2xl text-lg text-ink-secondary">{description}</p>}
        <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className={`rounded-ui-md p-5 ${card}`}>
              <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-ink-secondary">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
