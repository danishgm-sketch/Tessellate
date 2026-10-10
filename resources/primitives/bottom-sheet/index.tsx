import React from 'react';

export type BottomSheetVariant = 'quiet' | 'expressive' | 'nocturne';

export interface BottomSheetProps {
  variant?: BottomSheetVariant;
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({
  variant = 'quiet',
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  if (!open) return null;

  let theme = 'bg-white border-neutral-200 text-neutral-900 shadow-2xl';
  if (variant === 'expressive') theme = 'bg-white border-[#D9D6CF] text-neutral-900 shadow-2xl';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-2xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-lg rounded-t-3xl border-t p-6 z-10 ${theme}`}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        {title && <h3 className="text-base font-semibold mb-3">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
