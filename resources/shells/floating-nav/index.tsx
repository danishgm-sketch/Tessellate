import React from 'react';

export type FloatingNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface FloatingNavProps {
  variant?: FloatingNavVariant;
  links?: Array<{ label: string; href?: string }>;
  onOpen?: () => void;
}

export function FloatingNav({ variant = 'quiet', links = [{ label: 'Overview' }, { label: 'Specs' }, { label: 'Changelog' }], onOpen }: FloatingNavProps) {
  let pill = 'bg-white/80 border-neutral-200 text-neutral-900 shadow-lg';
  if (variant === 'expressive') pill = 'bg-white/90 border-[#D9D6CF] text-neutral-900 shadow-xl';
  if (variant === 'nocturne') pill = 'bg-[#11141B]/90 border-[#2E3440] text-white shadow-xl';

  return (
    <div className="w-full pt-4 flex justify-center px-4">
      <div className={`inline-flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border px-4 @sm:px-6 py-2.5 backdrop-blur-md text-xs ${pill}`}>
        <span className="font-semibold">Tessellate</span>
        <div className="flex items-center gap-3 @sm:gap-4">
          {links.map((link) => link.href
            ? <a key={link.label} href={link.href} className="opacity-70 hover:opacity-100">{link.label}</a>
            : <span key={link.label} className="opacity-70">{link.label}</span>)}
        </div>
        <button type="button" onClick={onOpen} disabled={!onOpen} aria-describedby={!onOpen ? 'floating-nav-open-help' : undefined} className="px-3 py-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-full font-medium disabled:cursor-not-allowed disabled:opacity-60">
          Open
        </button>
      </div>
      {!onOpen && <span id="floating-nav-open-help" className="sr-only">Connect an open action before enabling this button.</span>}
    </div>
  );
}
