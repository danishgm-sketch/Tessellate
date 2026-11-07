import React from 'react';

export type SearchInputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'formAction'
> {
  variant?: SearchInputVariant;
  shortcut?: string;
  onClear?: () => void;
}

export function SearchInput({
  variant = 'quiet',
  shortcut = '⌘K',
  onClear,
  value,
  className = '',
  ...rest
}: SearchInputProps) {
  // Search input actions are local UI behavior, not remote form submission.
  const { formAction: ignoredFormAction, ...safeRest } = rest as typeof rest & {
    formAction?: string;
  };
  void ignoredFormAction;
  let theme =
    'border-neutral-300 bg-white text-neutral-900 focus-within:border-neutral-900 focus-within:ring-neutral-900';
  if (variant === 'expressive') {
    theme =
      'border-[#D9D6CF] bg-white text-neutral-900 focus-within:border-[#2547E8] focus-within:ring-[#2547E8] shadow-2xs';
  } else if (variant === 'nocturne') {
    theme =
      'border-[#2E3440] bg-[#11141B] text-white focus-within:border-white focus-within:ring-white';
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm focus-within:ring-1 transition-all ${theme} ${className}`}
    >
      <svg
        className="w-4 h-4 opacity-50 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        value={value}
        className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
        placeholder="Search resources..."
        {...safeRest}
      />
      {value && onClear ? (
        <button type="button" onClick={onClear} className="opacity-60 hover:opacity-100 text-xs">
          ✕
        </button>
      ) : shortcut ? (
        <kbd className="hidden sm:inline-block rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] font-mono text-neutral-500">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}
