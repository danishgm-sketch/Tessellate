import React, { useState } from 'react';

export type IconRailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface IconRailProps {
  variant?: IconRailVariant;
}

export function IconRail({ variant = 'quiet' }: IconRailProps) {
  const [active, setActive] = useState('select');

  let theme = 'bg-white border-r border-neutral-200 text-neutral-800';
  let activeStyle = 'bg-neutral-900 text-white';
  if (variant === 'expressive') {
    theme = 'bg-white border-r border-[#D9D6CF] text-neutral-800';
    activeStyle = 'bg-[#2547E8] text-white shadow-xs';
  } else if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border-r border-[#2E3440] text-neutral-300';
    activeStyle = 'bg-white text-neutral-950 font-bold';
  }

  const tools = [
    { id: 'select', label: 'V' },
    { id: 'frame', label: 'F' },
    { id: 'text', label: 'T' },
    { id: 'dna', label: 'D' },
  ];

  return (
    <div className={`w-12 h-screen flex flex-col items-center py-4 gap-2 ${theme}`}>
      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setActive(t.id)}
          className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-mono transition-colors ${
            t.id === active ? activeStyle : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
