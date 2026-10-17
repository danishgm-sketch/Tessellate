import React, { useState, useEffect } from 'react';

export type TransparentSolidNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TransparentSolidNavProps {
  variant?: TransparentSolidNavVariant;
  links?: Array<{ label: string; href?: string }>;
  onDocsClick?: () => void;
}

export function TransparentSolidNav({ variant = 'quiet', links = [{ label: 'Engine' }, { label: 'Gallery' }], onDocsClick }: TransparentSolidNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solidClass = scrolled
    ? (variant === 'nocturne' ? 'bg-[#0B0D10] border-b border-[#2E3440] shadow-md' : 'bg-white border-b border-neutral-200 shadow-xs')
    : 'bg-transparent border-transparent';

  return (
    <header className={`box-border w-full fixed top-0 left-0 z-40 transition-all duration-200 px-3 py-3 sm:px-6 min-h-16 flex flex-wrap items-center justify-between gap-3 ${solidClass}`}>
      <span className="shrink-0 font-semibold text-sm">Tessellate</span>
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-2 text-xs">
        {links.map((link) => link.href
          ? <a key={link.label} href={link.href} className="opacity-80 hover:opacity-100">{link.label}</a>
          : <span key={link.label} className="opacity-80">{link.label}</span>)}
        <button type="button" onClick={onDocsClick} disabled={!onDocsClick} aria-describedby={!onDocsClick ? 'transparent-nav-docs-help' : undefined} className="px-3 py-1.5 border rounded-lg disabled:cursor-not-allowed disabled:opacity-60">Docs</button>
      </div>
      {!onDocsClick && <span id="transparent-nav-docs-help" className="sr-only">Connect a documentation action before enabling this button.</span>}
    </header>
  );
}
