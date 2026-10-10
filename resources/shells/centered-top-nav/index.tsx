import React from 'react';

export type CenteredTopNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CenteredTopNavProps {
  variant?: CenteredTopNavVariant;
  brand?: React.ReactNode;
  links?: Array<{ label: string; href: string }>;
  cta?: React.ReactNode;
}

export function CenteredTopNav({
  variant = 'quiet',
  brand = 'Tessellate',
  links = [
    { label: 'Features', href: '#' },
    { label: 'Showcase', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  cta = <button className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg">Get Started</button>,
}: CenteredTopNavProps) {
  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  if (variant === 'expressive') bar = 'bg-white border-b border-[#D9D6CF] text-neutral-900';
  if (variant === 'nocturne') bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';

  return (
    <nav className={`w-full px-6 h-16 flex items-center justify-between ${bar}`}>
      <div className="font-semibold text-sm">{brand}</div>
      <div className="hidden md:flex items-center gap-6 text-xs">
        {links.map((l) => (
          <a key={l.label} href={l.href} className="opacity-70 hover:opacity-100 transition-opacity">
            {l.label}
          </a>
        ))}
      </div>
      <div>{cta}</div>
    </nav>
  );
}
