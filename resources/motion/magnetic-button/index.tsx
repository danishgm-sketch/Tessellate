import React, { useId, useState } from 'react';

export type MagneticButtonVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MagneticButtonProps {
  variant?: MagneticButtonVariant;
  children?: React.ReactNode;
  onAction?: () => void;
  disabled?: boolean;
  title?: string;
  helperText?: string;
}

export function MagneticButton({
  variant = 'quiet',
  children = 'Explore Interface System →',
  onAction,
  disabled = false,
  title,
  helperText,
}: MagneticButtonProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const actionHelpId = useId();
  const isDisabled = disabled || !onAction;

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
    <div className="p-8 flex flex-col items-center justify-center gap-2">
      <button
        type="button"
        onClick={onAction}
        disabled={isDisabled}
        title={title}
        aria-describedby={isDisabled ? actionHelpId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
        className={`px-6 py-3 rounded-[var(--tess-radius-xl,8px)] text-xs transition-transform duration-150 ease-out select-none motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-60 ${btnClass}`}
      >
        {children}
      </button>
      {isDisabled && (
        <span id={actionHelpId} className={helperText ? 'text-xs text-[var(--tess-ink-muted,#62666F)]' : 'sr-only'}>
          {helperText ?? 'Connect an action before enabling this button.'}
        </span>
      )}
    </div>
  );
}
