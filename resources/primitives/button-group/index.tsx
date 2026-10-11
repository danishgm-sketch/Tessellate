import React from 'react';

export type ButtonGroupVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ButtonGroupProps {
  variant?: ButtonGroupVariant;
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ variant = 'quiet', children, className = '' }: ButtonGroupProps) {
  let theme = 'border border-neutral-300 divide-x divide-neutral-200 bg-white';
  if (variant === 'expressive') {
    theme = 'border border-[#D9D6CF] divide-x divide-[#D9D6CF] bg-white shadow-xs';
  } else if (variant === 'nocturne') {
    theme = 'border border-[#2E3440] divide-x divide-[#2E3440] bg-[#11141B]';
  }

  return (
    <div className={`inline-flex rounded-lg overflow-hidden ${theme} ${className}`}>
      {children}
    </div>
  );
}
