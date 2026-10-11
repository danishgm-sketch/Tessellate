import React, { useState } from 'react';

export type MessagingThreadVariant = 'quiet' | 'expressive' | 'nocturne';

export interface MessagingThreadProps {
  variant?: MessagingThreadVariant;
}

export function MessagingThread({ variant = 'quiet' }: MessagingThreadProps) {
  const [text, setText] = useState('');

  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let bubbleMe = 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900';
  const bubbleOther = 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
    bubbleMe = 'bg-[#2547E8] text-white';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    bubbleMe = 'bg-cyan-500 text-black font-semibold';
  }

  const messages = [
    { sender: 'Elena', text: 'Checked the new Nocturne tokens. Contrast passes AA across all buttons.', isMe: false },
    { sender: 'You', text: 'Great. Merging into canonical registry now.', isMe: true },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col justify-between min-h-[300px] transition-colors ${bg}`}>
      <div className="space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] opacity-50 mb-1">{m.sender}</span>
            <div className={`p-3 rounded-xl text-xs max-w-xs ${m.isMe ? bubbleMe : bubbleOther}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setText(''); }} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply to thread..."
          className="w-full p-2.5 rounded-lg border text-xs outline-none bg-transparent border-neutral-300 dark:border-neutral-700"
        />
        <button type="submit" className="px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold">
          Send
        </button>
      </form>
    </div>
  );
}
