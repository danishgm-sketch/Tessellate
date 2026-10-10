import React from 'react';

export type SplitButtonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SplitButtonProps {
  variant?: SplitButtonVariant;
  label: string;
  onClick?: () => void;
  onMenuClick?: () => void;
  disabled?: boolean;
}

export function SplitButton({
  variant = 'quiet',
  label,
  onClick,
  onMenuClick,
  disabled = false,
}: SplitButtonProps) {
  let theme = 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900';
  let divider = 'border-r border-neutral-700';
  if (variant === 'expressive') {
    theme = 'bg-[#2547E8] text-white hover:bg-[#1E3CCD] border-[#2547E8] shadow-sm';
    divider = 'border-r border-blue-400/30';
  } else if (variant === 'nocturne') {
    theme = 'bg-white text-neutral-950 hover:bg-neutral-200 border-white shadow-sm';
    divider = 'border-r border-neutral-300';
  }

  return (
    <div className="inline-flex rounded-lg border overflow-hidden shadow-xs">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`px-3.5 py-2 text-sm font-medium transition-colors ${theme} ${divider} disabled:opacity-40`}
      >
        {label}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onMenuClick}
        aria-label="More options"
        className={`px-2.5 py-2 text-sm font-medium transition-colors ${theme} disabled:opacity-40`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
