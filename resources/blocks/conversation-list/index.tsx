import React from 'react';

export type ConversationListVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ConversationListProps {
  variant?: ConversationListVariant;
}

export function ConversationList({ variant = 'quiet' }: ConversationListProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const channels = [
    { name: '# general-architecture', unread: 0 },
    { name: '# design-dna-tokens', unread: 3 },
    { name: '# agent-mcp-stream', unread: 12 },
  ];

  return (
    <div className={`w-full p-4 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-xs font-bold uppercase text-neutral-500 mb-3 px-2">Channels</h3>
      <div className="space-y-1 text-xs">
        {channels.map((c) => (
          <div key={c.name} className="px-3 py-2 rounded-lg flex items-center justify-between hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
            <span className="font-medium">{c.name}</span>
            {c.unread > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-bold">
                {c.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
