import React from 'react';

export type CenteredTopNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CenteredTopNavProps {
  variant?: CenteredTopNavVariant;
  brand?: React.ReactNode;
  links?: Array<{ label: string; href?: string }>;
  cta?: React.ReactNode;
}

export function CenteredTopNav({
  variant = 'quiet',
  brand = 'Tessellate',
  links = [
    { label: 'Features' },
    { label: 'Showcase' },
    { label: 'Pricing' },
    { label: 'Blog' },
  ],
  cta,
}: CenteredTopNavProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  if (variant === 'expressive') bar = 'bg-white border-b border-[#D9D6CF] text-neutral-900';
  if (variant === 'nocturne') bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';

  return (
    <nav className={`w-full px-6 h-16 flex items-center justify-between ${bar}`}>
      <div className="font-semibold text-sm">{brand}</div>
      <div className="hidden md:flex items-center gap-6 text-xs">
        {links.map((l) => (
          l.href
            ? <a key={l.label} href={l.href} className="opacity-70 hover:opacity-100 transition-opacity">{l.label}</a>
            : <span key={l.label} className="opacity-70">{l.label}</span>
        ))}
      </div>
      {cta && <div>{cta}</div>}
    </nav>
  );
}
