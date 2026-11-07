import React, { useState } from 'react';

export type PasswordInputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'formAction'
> {
  variant?: PasswordInputVariant;
  label?: string;
  error?: string;
}

export function PasswordInput({
  variant = 'quiet',
  label = 'Password',
  error,
  className = '',
  ...rest
}: PasswordInputProps) {
  // Password inputs never submit to caller-provided destinations.
  const { formAction: ignoredFormAction, ...safeRest } = rest as typeof rest & {
    formAction?: string;
  };
  void ignoredFormAction;
  const [show, setShow] = useState(false);

  let theme = 'border-neutral-300 focus-within:border-neutral-900 bg-white text-neutral-900';
  if (variant === 'expressive') {
    theme = 'border-[#D9D6CF] focus-within:border-[#2547E8] bg-white text-neutral-900 shadow-2xs';
  } else if (variant === 'nocturne') {
    theme = 'border-[#2E3440] focus-within:border-white bg-[#11141B] text-white';
  }

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <div
        className={`flex items-center rounded-lg border px-3 py-2 text-sm focus-within:ring-1 transition-all ${theme} ${className}`}
      >
        <input
          type={show ? 'text' : 'password'}
          className="w-full bg-transparent outline-none placeholder:text-neutral-400 text-sm"
          {...safeRest}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="text-xs text-neutral-500 hover:text-neutral-800 ml-2"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
