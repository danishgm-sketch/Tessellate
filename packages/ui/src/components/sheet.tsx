import { useDialogFocus } from '../use-dialog-focus.js';
import React, { useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'right' | 'left' | 'bottom';
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onClose,
  title,
  side = 'right',
  children,
  className,
}: SheetProps) {
  const dialogRef=useDialogFocus<HTMLDivElement>(open,onClose);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideStyles = {
    right: 'inset-y-0 right-0 h-full w-full max-w-md border-l',
    left: 'inset-y-0 left-0 h-full w-full max-w-md border-r',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full border-t rounded-t-2xl',
  }[side];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef} tabIndex={-1} role="dialog"
        aria-modal="true"
        aria-label={title || 'Sheet'}
        className={twMerge(
          clsx(
            'fixed bg-[#FFFFFF] p-6 shadow-2xl transition-transform overflow-y-auto ' +
              'border-[#D9D6CF] dark:border-[#272C34] dark:bg-[#111419] dark:text-[#F5F7FA]',
            sideStyles,
            className
          )
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#D9D6CF] dark:border-[#272C34]">
          {title && (
            <h2 className="text-base font-semibold text-[#111217] dark:text-[#F5F7FA]">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-[var(--text-muted)] hover:text-[#111217] dark:hover:text-[#F5F7FA] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2547E8]"
            aria-label="Close sheet"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}
