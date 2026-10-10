import React, { useState } from 'react';

export type MobileBottomNavVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MobileBottomNavProps {
  variant?: MobileBottomNavVariant;
}

export function MobileBottomNav({ variant = 'quiet' }: MobileBottomNavProps) {
  const [active, setActive] = useState('feed');

  let bar = 'bg-white/90 border-t border-neutral-200 text-neutral-800 backdrop-blur-md';
  let activeStyle = 'text-neutral-900 font-bold';
  if (variant === 'expressive') {
    bar = 'bg-white/95 border-t border-[#D9D6CF] text-neutral-700 backdrop-blur-md';
    activeStyle = 'text-[#2547E8] font-bold';
  } else if (variant === 'nocturne') {
    bar = 'bg-[#0B0D10]/95 border-t border-[#2E3440] text-neutral-400 backdrop-blur-md';
    activeStyle = 'text-white font-bold';
  }

  const items = [
    { id: 'feed', label: 'Feed', icon: '◫' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'dna', label: 'DNA', icon: '🧬' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 w-full h-16 flex items-center justify-around z-40 md:hidden ${bar}`}>
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => setActive(it.id)}
          className={`flex flex-col items-center gap-1 text-[10px] transition-colors ${
            it.id === active ? activeStyle : 'opacity-60'
          }`}
        >
          <span className="text-sm">{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
