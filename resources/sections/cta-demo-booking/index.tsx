import React from 'react';

export type CtaDemoBookingVariant = 'quiet' | 'expressive' | 'nocturne';

export interface CtaDemoBookingProps {
  variant?: CtaDemoBookingVariant;
}

export function CtaDemoBooking({ variant = 'quiet' }: CtaDemoBookingProps) {
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
        <h2 className="text-3xl font-bold tracking-tight mb-4">Book an Architecture Consultation</h2>
        <p className="text-xs sm:text-sm opacity-75 max-w-md mb-8">Speak with our core team about integrating Tessellate into your enterprise monorepo.</p>

        <div className={`p-6 rounded-2xl border w-full max-w-sm ${card}`}>
          <div className="text-xs font-semibold mb-4 text-left">Available Times (Tomorrow):</div>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {['10:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'].map((time) => (
              <button key={time} type="button" className="p-2 rounded border text-xs font-mono hover:bg-neutral-200 dark:hover:bg-neutral-800">
                {time}
              </button>
            ))}
          </div>
          <button type="button" className="w-full py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold uppercase tracking-wider">
            Confirm Slot
          </button>
        </div>
      </div>
    </section>
  );
}
