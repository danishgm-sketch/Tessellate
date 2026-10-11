import React from 'react';

export type InlineSpinnerVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InlineSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: InlineSpinnerVariant;
  children?: React.ReactNode;
}

export function InlineSpinner({
  label = 'Processing request...',
  size = 'md',
  variant = 'quiet',
  children,
}: InlineSpinnerProps) {
  const containerBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] text-white border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-neutral-50/50 text-neutral-900 border-[#D9D6CF]'
      : 'bg-white text-neutral-900 border-neutral-200';

  const spinnerColor =
    variant === 'nocturne'
      ? 'text-cyan-400'
      : variant === 'expressive'
      ? 'text-indigo-600'
      : 'text-neutral-800 dark:text-neutral-200';

  const sizeClasses =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  return (
    <div className={`p-6 md:p-8 rounded-xl border max-w-4xl mx-auto flex items-center gap-3 transition-colors ${containerBg}`}>
      <svg
        className={`animate-spin shrink-0 ${sizeClasses} ${spinnerColor}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        role="status"
        aria-label={label}
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
      {children}
    </div>
  );
}
