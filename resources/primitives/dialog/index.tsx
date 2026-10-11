import React from 'react';

export type DialogVariant = 'quiet' | 'expressive' | 'nocturne';

export interface DialogProps {
  variant?: DialogVariant;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Dialog({
  variant = 'quiet',
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  if (!open) return null;

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl border p-6 z-10 space-y-4 ${theme}`}>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>}
        </div>
        <div className="py-2 text-sm">{children}</div>
        {footer && <div className="flex justify-end gap-2 pt-2 border-t border-inherit">{footer}</div>}
      </div>
    </div>
  );
}
