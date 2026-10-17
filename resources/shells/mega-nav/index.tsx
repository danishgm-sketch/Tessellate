import React, { useState } from 'react';

export type MegaNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MegaNavProps {
  variant?: MegaNavVariant;
  links?: Array<{ label: string; href?: string }>;
  onLaunch?: () => void;
}

export function MegaNav({ variant = 'quiet', links = [{ label: 'Enterprise' }, { label: 'Docs' }], onLaunch }: MegaNavProps) {
  const [open, setOpen] = useState(false);

  let bar = 'bg-white border-b border-neutral-200 text-neutral-900';
  let menu = 'bg-white border-[#D9D6CF] shadow-2xl';
  if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10] border-b border-[#2E3440] text-white';
    menu = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';
  }

  return (
    <div className={`w-full relative ${bar}`}>
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 min-h-16 flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold text-sm">Tessellate Suite</span>
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <button type="button" aria-expanded={open} aria-controls="mega-nav-menu" onClick={() => setOpen(!open)} className="font-medium flex items-center gap-1">
            Products ▾
          </button>
          {links.map((link) => link.href
            ? <a key={link.label} href={link.href} className="opacity-70 hover:opacity-100">{link.label}</a>
            : <span key={link.label} className="opacity-70">{link.label}</span>)}
        </div>
        <button type="button" onClick={onLaunch} disabled={!onLaunch} aria-describedby={!onLaunch ? 'mega-nav-launch-help' : undefined} className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg disabled:cursor-not-allowed disabled:opacity-60">Launch</button>
      </div>
      {!onLaunch && <span id="mega-nav-launch-help" className="sr-only">Connect a launch action before enabling this button.</span>}
      {open && (
        <div id="mega-nav-menu" className={`absolute top-full left-0 w-full border-b p-4 sm:p-8 z-40 ${menu}`}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 text-xs">
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Composition Engine</p>
              <p className="text-neutral-500">Deterministic Zod layout mutation pipeline.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Design DNA</p>
              <p className="text-neutral-500">10-dimensional mathematical aesthetic control.</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold uppercase tracking-wider opacity-50">Workbench</p>
              <p className="text-neutral-500">Dual-layer visual and structural editor.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
