import React from 'react';

export type CalendarMonthVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CalendarMonthProps {
  variant?: CalendarMonthVariant;
}

export function CalendarMonth({ variant = 'quiet' }: CalendarMonthProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">October 2026</h3>
        <span className="font-mono text-xs opacity-60">Month View</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="p-1 opacity-50 font-bold">{d}</div>
        ))}
        {days.map((day) => (
          <div
            key={day}
            className={`p-2 rounded text-[11px] ${day === 11 ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
