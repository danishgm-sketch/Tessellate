import React, { useState } from 'react';

export type MagneticButtonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MagneticButtonProps {
  variant?: MagneticButtonVariant;
  children?: React.ReactNode;
  onAction?: () => void;
}

export function MagneticButton({ variant = 'quiet', children = 'Explore Interface System →', onAction }: MagneticButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const btnClass =
    variant === 'nocturne'
      ? 'bg-[var(--tess-accent-primary,#06B6D4)] text-[var(--tess-accent-ink,#111217)] font-semibold hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
      : variant === 'expressive'
      ? 'bg-[var(--tess-accent-primary,#2547E8)] text-[var(--tess-accent-ink,#FFFFFF)] font-medium hover:bg-blue-700 shadow-md'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.35;
    const deltaY = (e.clientY - centerY) * 0.35;
    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="p-8 flex items-center justify-center">
      <button
        type="button"
        onClick={onAction}
        disabled={!onAction}
        aria-describedby={!onAction ? 'magnetic-button-action-help' : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        className={`px-6 py-3 rounded-[var(--tess-radius-xl,8px)] text-xs transition-transform duration-150 ease-out select-none motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 ${btnClass}`}
      >
        {children}
      </button>
      {!onAction && <span id="magnetic-button-action-help" className="sr-only">Connect an action before enabling this button.</span>}
    </div>
  );
}
