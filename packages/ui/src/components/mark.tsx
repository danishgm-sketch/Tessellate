import React from 'react';

export interface MarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * Tessellate geometric tile mark.
 * Four offset quadrilateral tiles creating an incomplete tessellation.
 * One accent tile in cobalt. Works cleanly down to 16px.
 */
export function Mark({ size = 24, className = '', ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Tessellate Mark"
      role="img"
      {...props}
    >
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" fill="#2547E8" />
    </svg>
  );
}
