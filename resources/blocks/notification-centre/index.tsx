import React, { useState } from 'react';

export type NotificationCentreVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NotificationCentreProps {
  variant?: NotificationCentreVariant;
  title?: string;
  events?: Array<{time:string;title:string;desc:string}>;
}

export function NotificationCentre({ variant = 'quiet', title='Sample notifications',events }: NotificationCentreProps) {
  const [items, setItems] = useState(events?.map((event,index)=>({id:index,title:event.title,time:event.time,read:false})) ?? [
    { id: 1, title: 'Build Succeeded', time: '2m ago', read: false },
    { id: 2, title: 'Token Threshold Exceeded', time: '1h ago', read: false },
    { id: 3, title: 'New Member Joined Team', time: '1d ago', read: true },
  ]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  };

  return (
    <div className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border transition-colors ${bg}`}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={markAllRead} className="text-xs text-[var(--tess-ink-muted,#62666F)] hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="p-3 rounded-[var(--tess-radius-lg,8px)] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {!it.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
              <span className={it.read ? 'opacity-60' : 'font-semibold'}>{it.title}</span>
            </div>
            <span className="font-mono text-[11px] opacity-50">{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
