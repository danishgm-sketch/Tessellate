import React from 'react';

export type TagChipVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TagChipProps {
  variant?: TagChipVariant;
  label: string;
  selected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
}

export function TagChip({
  variant = 'quiet',
  label,
  selected = false,
  onRemove,
  onClick,
}: TagChipProps) {
  let theme = 'bg-white border-neutral-300 text-neutral-800 hover:border-neutral-400';
  if (selected) theme = 'bg-neutral-900 border-neutral-900 text-white';

  if (variant === 'expressive' && selected) {
    theme = 'bg-[#2547E8] border-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne') {
    theme = selected ? 'bg-white text-neutral-950 border-white' : 'bg-[#171A21] border-[#2E3440] text-neutral-300';
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs cursor-pointer select-none transition-colors ${theme}`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75"
        >
          ✕
        </button>
      )}
    </div>
  );
}
