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
    <div className={`h-screen flex divide-x text-xs ${theme}`}>
      <div className="w-80 p-4 space-y-2 shrink-0">
        <span className="font-semibold block mb-2">Incidents Queue</span>
        {items.map((it) => (
          <div
            key={it.id}
            onClick={() => setSelected(it.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              it.id === selected ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800' : 'border-transparent hover:bg-neutral-50'
            }`}
          >
            <p className="font-medium">{it.title}</p>
            <p className="text-[10px] opacity-50 mt-1">{it.time}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 p-8 space-y-4">
        <h2 className="text-base font-semibold">Incident Details (ID: {selected})</h2>
        <p className="text-neutral-500 leading-relaxed">Telemetry metrics indicate node threshold normalization.</p>
      </div>
    </div>
  );
}
