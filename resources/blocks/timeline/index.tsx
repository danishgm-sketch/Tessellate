import React from 'react';

export type TimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TimelineProps {
  variant?: TimelineVariant;
  title?: string;
  events?: Array<{time:string;title:string;desc:string}>;
}

export function Timeline({ variant = 'quiet', title='Sample activity', events: suppliedEvents }: TimelineProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const events = suppliedEvents ?? [
    { time: '10:00 AM', title: 'System Deploy', desc: 'Released version 1.0.0 to edge nodes.' },
    { time: '11:30 AM', title: 'Catalog Synced', desc: 'All 324 manifests validated and compiled.' },
    { time: '02:00 PM', title: 'Review scheduled', desc: 'Check accessibility and keyboard behaviour before publishing.' },
  ];

  return (
    <div
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border transition-colors ${bg}`}
    >
      <h3 className="text-sm font-semibold mb-6">{title}</h3>
      {events.length === 0 ? (
        <p role="status" aria-live="polite" className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm opacity-75 dark:border-neutral-700">
          No activity to show yet.
        </p>
      ) : (
        <div className="space-y-6 border-l-2 border-neutral-200 dark:border-neutral-800 ml-3 pl-6">
          {events.map((e) => (
            <div key={e.title} className="relative">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-neutral-900 dark:bg-white" />
              <span className="text-[10px] font-mono text-[var(--tess-ink-muted,#62666F)] uppercase block mb-0.5">{e.time}</span>
              <div className="font-semibold text-xs mb-0.5">{e.title}</div>
              <p className="text-[11px] opacity-75">{e.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
