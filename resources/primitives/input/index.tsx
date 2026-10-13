import React from 'react';

export type InputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'quiet', label, error, helperText, className = '', id, ...rest }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    let borderTheme = 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 bg-white text-neutral-900';
    if (variant === 'expressive') {
      borderTheme = 'border-[#D9D6CF] focus:border-[#2547E8] focus:ring-[#2547E8] bg-white text-neutral-900 shadow-2xs';
    } else if (variant === 'nocturne') {
      borderTheme = 'border-[#2E3440] focus:border-white focus:ring-white bg-[#11141B] text-white';
    }

    if (error) {
      borderTheme = 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-white text-rose-900';
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-1 ${borderTheme} ${className}`}
          {...rest}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {!error && helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
