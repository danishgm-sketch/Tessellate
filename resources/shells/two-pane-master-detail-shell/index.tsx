import React, { useState } from 'react';

export type TwoPaneMasterDetailShellVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TwoPaneMasterDetailShellProps {
  variant?: TwoPaneMasterDetailShellVariant;
}

export function TwoPaneMasterDetailShell({ variant = 'quiet' }: TwoPaneMasterDetailShellProps) {
  const [selected, setSelected] = useState('1');

  let theme = 'bg-white border-neutral-200 text-neutral-900';
  if (variant === 'nocturne') theme = 'bg-[#11141B] border-[#2E3440] text-white';

  const items = [
    { id: '1', title: 'Alert: High CPU Usage', time: '10m ago' },
    { id: '2', title: 'Deploy: Version 0.1.0 Successful', time: '1h ago' },
    { id: '3', title: 'Security: Token Refresh', time: '3h ago' },
  ];

  return (
    <div
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`min-h-screen @container flex flex-col @lg:flex-row divide-y @lg:divide-y-0 @lg:divide-x text-xs ${theme}`}
    >
      <div className="w-full @lg:w-80 p-4 space-y-2 shrink-0">
        <span className="font-semibold block mb-2">Incidents Queue</span>
        {items.map((it) => (
          <button type="button" aria-pressed={it.id===selected}
            key={it.id}
            onClick={() => setSelected(it.id)}
            className={`w-full text-left p-3 rounded-[var(--tess-radius-lg,8px)] border cursor-pointer transition-colors ${
              it.id === selected ? 'border-neutral-900 dark:border-white bg-neutral-50 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100' : 'border-transparent hover:bg-neutral-50'
            }`}
          >
            <p className="font-medium">{it.title}</p>
            <p className={`text-[10px] mt-1 ${it.id === selected ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-600'}`}>{it.time}</p>
          </button>
        ))}
      </div>
      <div className="min-w-0 flex-1 p-4 @lg:p-8 space-y-4">
        <h2 className="text-base font-semibold">Incident Details (ID: {selected})</h2>
        <p className="text-[var(--tess-ink-muted,#62666F)] leading-relaxed">Telemetry metrics indicate node threshold normalization.</p>
      </div>
    </div>
  );
}
