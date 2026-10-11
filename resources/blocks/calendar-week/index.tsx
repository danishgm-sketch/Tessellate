import React from 'react';

export type CalendarWeekVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CalendarWeekProps {
  variant?: CalendarWeekVariant;
}

export function CalendarWeek({ variant = 'quiet' }: CalendarWeekProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let slot = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    slot = 'bg-blue-50 text-blue-900 border border-blue-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    slot = 'bg-[#151921] text-cyan-300 border border-[#2E3440]';
  }

  const days = ['Mon 12', 'Tue 13', 'Wed 14', 'Thu 15', 'Fri 16'];

  return (
    <div className={`w-full p-6 rounded-xl border overflow-x-auto transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Weekly Schedule</h3>
      <div className="grid grid-cols-5 gap-3 min-w-[500px]">
        {days.map((d) => (
          <div key={d} className="border border-neutral-100 dark:border-neutral-800 rounded-lg p-3">
            <span className="font-mono text-[11px] font-bold block mb-3 text-neutral-500">{d}</span>
            <div className={`p-2 rounded text-[10px] font-semibold mb-2 ${slot}`}>
              Design Review
            </div>
            <div className="text-[10px] opacity-40 font-mono">No other events</div>
          </div>
        ))}
      </div>
    </div>
  );
}
