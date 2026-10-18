import React, { useEffect, useState } from 'react';

export type NotificationCentreVariant = 'quiet' | 'expressive' | 'nocturne';

export interface NotificationCentreProps {
  variant?: NotificationCentreVariant;
  title?: string;
  events?: Array<{time:string;title:string;desc:string}>;
}

type NotificationItem = { id: number; title: string; time: string; read: boolean };

const DEFAULT_ITEMS: NotificationItem[] = [
  { id: 1, title: 'Build Succeeded', time: '2m ago', read: false },
  { id: 2, title: 'Token Threshold Exceeded', time: '1h ago', read: false },
  { id: 3, title: 'New Member Joined Team', time: '1d ago', read: true },
];

export function NotificationCentre({ variant = 'quiet', title='Sample notifications',events }: NotificationCentreProps) {
  const [items, setItems] = useState<NotificationItem[]>(() =>
    events === undefined
      ? DEFAULT_ITEMS
      : events.map((event, index) => ({ id: index, title: event.title, time: event.time, read: false }))
  );
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (events !== undefined) {
      setItems(events.map((event, index) => ({ id: index, title: event.title, time: event.time, read: false })));
      setStatusMessage('');
    }
  }, [events]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const markAllRead = () => {
    const unreadCount = items.filter((item) => !item.read).length;
    if (unreadCount === 0) return;

    setItems((previous) => previous.map((item) => ({ ...item, read: true })));
    setStatusMessage(`${unreadCount} notification${unreadCount === 1 ? '' : 's'} marked as read.`);
  };

  const canMarkAllRead = items.some((item) => !item.read);

  return (
    <div
      style={{
        '--tess-ink-muted': variant === 'nocturne' ? '#A8AFBA' : '#62666F',
        '--tess-ink-secondary': variant === 'nocturne' ? '#D1D5DB' : '#4B5563',
      } as React.CSSProperties}
      className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border transition-colors ${bg}`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button type="button" onClick={markAllRead} disabled={!canMarkAllRead} className="text-xs text-[var(--tess-ink-muted,#62666F)] hover:underline disabled:cursor-not-allowed disabled:opacity-50">
          Mark all as read
        </button>
      </div>

      {items.length === 0 ? (
        <p role="status" aria-live="polite" className="rounded border border-dashed border-neutral-300 p-6 text-center text-sm opacity-75 dark:border-neutral-700">
          No notifications yet.
        </p>
      ) : (
        <>
          {statusMessage && <p role="status" aria-live="polite" className="mb-3 text-xs text-[var(--tess-ink-muted,#62666F)]">{statusMessage}</p>}
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
        </>
      )}
    </div>
  );
}
