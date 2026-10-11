import React from 'react';

export type ScheduleAgendaVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ScheduleAgendaProps {
  variant?: ScheduleAgendaVariant;
}

export function ScheduleAgenda({ variant = 'quiet' }: ScheduleAgendaProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const events = [
    { time: '09:00 - 10:00', title: 'Architecture Standup', room: 'Room Alpha' },
    { time: '11:30 - 12:30', title: 'Catalog Verification Review', room: 'Main Stage' },
    { time: '14:00 - 15:00', title: 'Agent MCP Demo', room: 'Virtual Lab' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-4">Today's Agenda</h3>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.title} className="p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-semibold">{e.title}</div>
              <span className="text-[10px] opacity-60">{e.room}</span>
            </div>
            <span className="font-mono text-[11px] opacity-75">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
