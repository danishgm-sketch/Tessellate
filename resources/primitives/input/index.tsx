import React from 'react';

export type InputVariant = 'quiet' | 'expressive' | 'nocturne';

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'formAction'
> {
  variant?: InputVariant;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'quiet', label, error, helperText, className = '', id, ...rest }, ref) => {
    // Inputs in this library do not submit forms to caller-provided destinations.
    const { formAction: ignoredFormAction, ...safeRest } = rest as typeof rest & {
      formAction?: string;
    };
    void ignoredFormAction;
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    let borderTheme =
      'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 bg-white text-neutral-900';
    if (variant === 'expressive') {
      borderTheme =
        'border-[#D9D6CF] focus:border-[#2547E8] focus:ring-[#2547E8] bg-white text-neutral-900 shadow-2xs';
    } else if (variant === 'nocturne') {
      borderTheme = 'border-[#2E3440] focus:border-white focus:ring-white bg-[#11141B] text-white';
    }

    if (error) {
      borderTheme =
        'border-rose-500 focus:border-rose-500 focus:ring-rose-500 bg-white text-rose-900';
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-[var(--tess-radius-lg,8px)] border px-3 py-2 text-sm outline-none transition-all focus:ring-1 ${borderTheme} ${className}`}
          {...safeRest}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[var(--tess-ink-muted,#62666F)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
