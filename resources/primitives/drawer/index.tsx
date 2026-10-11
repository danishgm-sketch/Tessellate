import React from 'react';

export type DrawerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DrawerProps {
  variant?: DrawerVariant;
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function Drawer({
  variant = 'quiet',
  open,
  onClose,
  title,
  children,
  position = 'right',
}: DrawerProps) {
  if (!open) return null;

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  const posClass = position === 'right' ? 'right-0 border-l' : 'left-0 border-r';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-2xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`fixed top-0 bottom-0 w-full max-w-md p-6 overflow-y-auto ${posClass} ${theme}`}>
        <div className="flex items-center justify-between pb-4 border-b border-inherit">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm opacity-60 hover:opacity-100">✕</button>
        </div>
        <div className="py-4 text-sm">{children}</div>
      </div>
    </div>
  );
}
