import React from 'react';

export type AvatarGroupVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AvatarGroupProps {
  variant?: AvatarGroupVariant;
  items: Array<{ initials: string; src?: string }>;
  max?: number;
}

export function AvatarGroup({ variant = 'quiet', items, max = 3 }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const excess = items.length - max;

  let ring = 'border-white dark:border-neutral-900';
  if (variant === 'expressive') ring = 'border-[#FAF9F6]';
  if (variant === 'nocturne') ring = 'border-[#0B0D10]';

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((it, idx) => (
        <div
          key={idx}
          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-neutral-200 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 shadow-xs ${ring}`}
        >
          {it.initials}
        </div>
      ))}
      {excess > 0 && (
        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 ${ring}`}>
          +{excess}
        </div>
      )}
    </div>
  );
}
