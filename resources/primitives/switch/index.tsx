import React from 'react';

export type SwitchVariant = 'quiet' | 'expressive' | 'nocturne';

export interface SwitchProps {
  variant?: SwitchVariant;
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({
  variant = 'quiet',
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SwitchProps) {
  let track = checked ? 'bg-neutral-900' : 'bg-neutral-200';
  if (variant === 'expressive' && checked) track = 'bg-[#2547E8] shadow-xs';
  if (variant === 'nocturne' && checked) track = 'bg-white';

  return (
    <label className={`inline-flex items-center justify-between gap-4 cursor-pointer select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {(label || description) && (
        <div className="text-xs">
          {label && <span className="font-medium text-neutral-900 dark:text-neutral-100">{label}</span>}
          {description && <p className="text-neutral-500 mt-0.5">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${track}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5 ml-0.5 shadow-xs ${
            checked ? (variant === 'nocturne' ? 'translate-x-4 bg-neutral-950' : 'translate-x-4') : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
