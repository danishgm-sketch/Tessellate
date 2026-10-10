import React from 'react';

export type ButtonVariant = 'quiet' | 'expressive' | 'nocturne';
export type ButtonIntent = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children?: React.ReactNode;
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
      className = '',
      disabled,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    // Base interactive styles
    const baseClasses =
      'inline-flex items-center justify-center font-medium select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100';

    // Size mappings
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
      md: 'h-9 px-4 text-sm gap-2 rounded-lg',
      lg: 'h-11 px-5 text-base gap-2.5 rounded-xl',
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
            'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent focus-visible:ring-neutral-400';
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
            'bg-[#2547E8] text-white hover:bg-[#1E3CCD] border border-[#2547E8] shadow-sm hover:shadow-md focus-visible:ring-[#2547E8] focus-visible:ring-offset-white';
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

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}
        {...rest}
      >
        {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
