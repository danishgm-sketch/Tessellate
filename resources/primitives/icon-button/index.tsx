import React from 'react';

export type IconButtonVariant = 'quiet' | 'expressive' | 'nocturne';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon?: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'quiet', size = 'md', icon, className = '', disabled, children, ...rest }, ref) => {
    const sizeClasses = {
      sm: 'h-7 w-7 p-1 text-xs rounded-md',
      md: 'h-9 w-9 p-1.5 text-sm rounded-lg',
      lg: 'h-11 w-11 p-2 text-base rounded-xl',
    }[size];

    let colorClasses = '';
    if (variant === 'quiet') {
      colorClasses = 'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 border border-transparent focus-visible:ring-neutral-400';
    } else if (variant === 'expressive') {
      colorClasses = 'bg-white text-[#2547E8] hover:bg-[#E7EBFF] border border-[#D9D6CF] shadow-xs hover:border-[#2547E8] focus-visible:ring-[#2547E8]';
    } else {
      colorClasses = 'bg-[#171A21] text-neutral-300 hover:bg-[#20242D] hover:text-white border border-[#2E3440] focus-visible:ring-white';
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={`inline-flex items-center justify-center transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-95 motion-reduce:transition-none ${sizeClasses} ${colorClasses} ${className}`}
        {...rest}
      >
        {icon || children || (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';
