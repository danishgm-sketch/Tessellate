import React from 'react';

export type LinkVariant = 'quiet' | 'expressive' | 'nocturne';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  external?: boolean;
}

export function Link({ variant = 'quiet', external = false, children, className = '', ...rest }: LinkProps) {
  let theme = 'text-neutral-900 hover:text-neutral-600 underline underline-offset-4 decoration-neutral-300 hover:decoration-neutral-900';
  if (variant === 'expressive') {
    theme = 'text-[#2547E8] hover:text-[#1E3CCD] font-medium underline underline-offset-4 decoration-[#2547E8]/40 hover:decoration-[#2547E8]';
  } else if (variant === 'nocturne') {
    theme = 'text-white hover:text-neutral-300 underline underline-offset-4 decoration-neutral-700 hover:decoration-white';
  }

  return (
    <a
      className={`inline-flex items-center gap-1 transition-colors ${theme} ${className}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...rest}
    >
      {children}
      {external && (
        <svg className="w-3 h-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      )}
    </a>
  );
}
