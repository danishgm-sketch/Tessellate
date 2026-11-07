import React from 'react';

export type EntityProfileHeaderVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EntityProfileHeaderProps {
  variant?: EntityProfileHeaderVariant;
  title?: string;
  subtitle?: string;
  badge?: string;
  initials?: string;
}

export function EntityProfileHeader({
  variant = 'quiet',
  title = 'Example profile',
  subtitle = 'Replace sample content with your organisation',
  badge = 'SAMPLE',
  initials = 'EP',
}: EntityProfileHeaderProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border transition-colors ${bg}`}
    >
      <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[var(--tess-radius-xl,8px)] bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100 font-bold text-xl flex items-center justify-center">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{title}</h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 ${variant === 'nocturne' ? 'text-emerald-300' : 'text-emerald-800'} font-bold`}
              >
                {badge}
              </span>
            </div>
            <p className="text-xs font-mono">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
