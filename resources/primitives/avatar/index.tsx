import React from 'react';

export type AvatarVariant = 'quiet' | 'expressive' | 'nocturne';
export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  variant?: AvatarVariant;
  size?: AvatarSize;
  src?: string;
  alt?: string;
  initials?: string;
  status?: 'online' | 'offline' | 'busy';
}

export function Avatar({
  variant = 'quiet',
  size = 'md',
  src,
  alt = 'User avatar',
  initials = 'TL',
  status,
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  }[size];

  let theme = 'bg-neutral-200 text-neutral-800 border-neutral-300';
  if (variant === 'expressive') theme = 'bg-[#E7EBFF] text-[#2547E8] font-bold border-[#2547E8]/20';
  if (variant === 'nocturne') theme = 'bg-[#171A21] text-neutral-200 border-[#2E3440] font-bold';

  return (
    <div className="relative inline-block">
      <div className={`flex items-center justify-center rounded-full border overflow-hidden font-medium select-none ${sizeClasses} ${theme}`}>
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-neutral-950 ${
            status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-rose-500' : 'bg-neutral-400'
          }`}
        />
      )}
    </div>
  );
}
