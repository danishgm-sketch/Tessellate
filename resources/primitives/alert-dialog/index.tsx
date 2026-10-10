import React from 'react';

export type AlertDialogVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AlertDialogProps {
  variant?: AlertDialogVariant;
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function AlertDialog({
  variant = 'quiet',
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Delete',
  onConfirm,
}: AlertDialogProps) {
  if (!open) return null;

  let card = 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#11141B]';
  if (variant === 'expressive') card = 'border-[#D9D6CF] bg-white shadow-2xl';
  if (variant === 'nocturne') card = 'border-[#2E3440] bg-[#11141B] text-white shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl border p-6 z-10 space-y-4 shadow-2xl ${card}`}>
        <h3 className="text-base font-semibold text-rose-600">{title}</h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
