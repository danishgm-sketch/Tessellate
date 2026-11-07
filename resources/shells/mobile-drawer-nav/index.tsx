import React, { useEffect, useRef, useState } from 'react';

export type MobileDrawerNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MobileDrawerNavProps {
  variant?: MobileDrawerNavVariant;
  links?: Array<{ label: string; href?: string }>;
}

export function MobileDrawerNav({ variant = 'quiet', links = [{ label: 'Catalogue' }, { label: 'Workbench' }, { label: 'Design DNA' }, { label: 'Documentation' }] }: MobileDrawerNavProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'Tab') {
        const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [])];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  let theme = 'bg-white text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] text-white';

  return (
    <div className="w-full p-4 flex justify-between items-center border-b">
      <span className="font-semibold text-sm">Tessellate</span>
      <button ref={triggerRef} type="button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(true)} className="p-2 border rounded-lg text-xs">
        ☰ Menu
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button type="button" aria-label="Close navigation" tabIndex={-1} className="fixed inset-0 bg-black/40 cursor-default" onClick={() => setOpen(false)} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mobile-drawer-title" className={`relative w-3/4 max-w-xs h-full p-6 space-y-6 z-10 ${theme}`}>
            <div className="flex justify-between items-center">
              <span id="mobile-drawer-title" className="font-semibold text-sm">Navigation</span>
              <button ref={closeRef} type="button" aria-label="Close navigation" onClick={() => setOpen(false)}>✕</button>
            </div>
            <nav aria-label="Primary" className="space-y-3 text-sm">
              {links.map((link) => link.href
                ? <a key={link.label} href={link.href} className="block py-1">{link.label}</a>
                : <span key={link.label} className="block py-1">{link.label}</span>)}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
