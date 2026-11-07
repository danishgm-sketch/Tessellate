import React, { useState } from 'react';

export type CtaDemoBookingVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaDemoBookingProps {
  variant?: CtaDemoBookingVariant;
  onBook?: (time: string) => void;
}

export function CtaDemoBooking({ variant = 'quiet', onBook }: CtaDemoBookingProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const noteId = React.useId();
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let card = 'bg-neutral-50 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    card = 'bg-white border-blue-200 shadow-md';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    card = 'bg-[#151921] border-[#2E3440]';
  }

  return (
    <section className={`relative w-full py-20 px-6 sm:px-12 border-b transition-colors ${bg}`}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Example appointment selector</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Connect a calendar to show real availability and confirm bookings.</p>

        <div className={`p-6 rounded-2xl border w-full max-w-sm ${card}`}>
          <div className="text-xs font-semibold mb-4 text-left">Example times (not live availability):</div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'].map((time) => (
              <button
                key={time}
                type="button"
                aria-pressed={selectedTime === time}
                onClick={() => setSelectedTime(time)}
                className={`p-2 rounded border text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-800 ${selectedTime === time ? 'ring-2 ring-neutral-800 dark:ring-white' : ''}`}
              >
                {time}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!onBook || !selectedTime}
            aria-describedby={noteId}
            onClick={() => selectedTime && onBook?.(selectedTime)}
            className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {onBook ? 'Confirm selected time' : 'Booking not configured'}
          </button>
          <p id={noteId} className="text-xs opacity-75 mt-3">{onBook ? 'Example times only; confirm with your connected booking service.' : 'This example has no calendar integration.'}</p>
        </div>
      </div>
    </section>
  );
}
