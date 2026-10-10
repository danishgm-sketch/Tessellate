import React from 'react';

export type CheckboxVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CheckboxProps {
  variant?: CheckboxVariant;
  label?: string;
  description?: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Checkbox({
  variant = 'quiet',
  label,
  description,
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
}: CheckboxProps) {
  let box = 'border-neutral-300 text-neutral-900 focus:ring-neutral-900';
  if (checked || indeterminate) {
    box = 'bg-neutral-900 border-neutral-900 text-white';
  }
  if (variant === 'expressive' && (checked || indeterminate)) {
    box = 'bg-[#2547E8] border-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne' && (checked || indeterminate)) {
    box = 'bg-white border-white text-neutral-950 shadow-xs';
  }

  return (
    <label className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <button
        type="button"
        role="checkbox"
        aria-checked={indeterminate ? 'mixed' : checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${box}`}
      >
        {indeterminate ? (
          <span className="h-0.5 w-2 bg-current rounded" />
        ) : checked ? (
          <svg className="h-3 w-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </button>
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-neutral-900 dark:text-neutral-100">{label}</span>}
          {description && <p className="text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
