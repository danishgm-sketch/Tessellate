import React from 'react';

export type ButtonVariant = 'quiet' | 'expressive' | 'nocturne';
export type ButtonIntent = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'formAction'
> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
  label?: string;
  helperText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'quiet',
      intent = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      children,
      label,
      helperText,
      className = '',
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    // This primitive does not forward caller-supplied submit destinations.
    const { formAction: ignoredFormAction, ...safeRest } = rest as typeof rest & {
      formAction?: string;
    };
    void ignoredFormAction;
    const helperId = React.useId();
    // Base interactive styles
    const baseClasses =
      'inline-flex items-center justify-center font-medium select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100';

    // Size mappings
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--tess-radius-md,8px)]',
      md: 'h-9 px-4 text-sm gap-2 rounded-[var(--tess-radius-lg,8px)]',
      lg: 'h-11 px-5 text-base gap-2.5 rounded-[var(--tess-radius-xl,8px)]',
    }[size];

    // Variant & Intent styling matrix
    let colorClasses = '';

    if (variant === 'quiet') {
      // Quiet: Restrained, subtle, monochrome, minimal contrast for high data density shells
      switch (intent) {
        case 'primary':
          colorClasses =
            'bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900 shadow-sm focus-visible:ring-neutral-900 focus-visible:ring-offset-white';
          break;
        case 'secondary':
          colorClasses =
            'bg-white text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900 border border-neutral-300 shadow-xs focus-visible:ring-neutral-400 focus-visible:ring-offset-white';
          break;
        case 'ghost':
          colorClasses =
            'bg-transparent text-[var(--tess-ink-secondary,#62666F)] hover:bg-neutral-100 hover:text-neutral-900 border border-transparent focus-visible:ring-neutral-400';
          break;
        case 'danger':
          colorClasses =
            'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 focus-visible:ring-rose-500';
          break;
      }
    } else if (variant === 'expressive') {
      // Expressive: Cobalt interactive system emphasis, tactile elevation, spring-like feel
      switch (intent) {
        case 'primary':
          colorClasses =
            'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)] hover:bg-[#1E3CCD] border border-[#2547E8] shadow-sm hover:shadow-md focus-visible:ring-[#2547E8] focus-visible:ring-offset-white';
          break;
        case 'secondary':
          colorClasses =
            'bg-white text-[#2547E8] hover:bg-[#E7EBFF] border border-[#D9D6CF] shadow-xs focus-visible:ring-[#2547E8] focus-visible:ring-offset-white';
          break;
        case 'ghost':
          colorClasses =
            'bg-transparent text-[#2547E8] hover:bg-[#E7EBFF] border border-transparent focus-visible:ring-[#2547E8]';
          break;
        case 'danger':
          colorClasses =
            'bg-[#C83D48] text-white hover:bg-[#A92A34] border border-[#C83D48] shadow-sm focus-visible:ring-[#C83D48] focus-visible:ring-offset-white';
          break;
      }
    } else {
      // Nocturne: Deep obsidian canvas, razor-sharp hairline borders, luminescence
      switch (intent) {
        case 'primary':
          colorClasses =
            'bg-white text-neutral-950 hover:bg-neutral-200 border border-white shadow-sm focus-visible:ring-white focus-visible:ring-offset-neutral-950';
          break;
        case 'secondary':
          colorClasses =
            'bg-[#171A21] text-neutral-100 hover:bg-[#20242D] border border-[#2E3440] shadow-xs focus-visible:ring-[#2547E8] focus-visible:ring-offset-neutral-950';
          break;
        case 'ghost':
          colorClasses =
            'bg-transparent text-neutral-400 hover:bg-[#171A21] hover:text-neutral-100 border border-transparent focus-visible:ring-[#2547E8]';
          break;
        case 'danger':
          colorClasses =
            'bg-[#2A1518] text-[#FF6B7A] hover:bg-[#3D1D22] border border-[#522329] focus-visible:ring-[#FF6B7A] focus-visible:ring-offset-neutral-950';
          break;
      }
    }

    const button = (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-describedby={disabled && helperText ? helperId : undefined}
        className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}
        {...safeRest}
      >
        {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
        {children ?? label ?? 'Example action'}
        {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
      </button>
    );

    if (!disabled || !helperText) return button;

    return (
      <span className="inline-flex flex-col items-start gap-1">
        {button}
        <span id={helperId} className="text-xs text-[var(--tess-ink-muted,#62666F)]">
          {helperText}
        </span>
      </span>
    );
  }
);

Button.displayName = 'Button';
