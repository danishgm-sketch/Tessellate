import React, { useState } from 'react';

export type AIChatPanelVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIChatPanelProps {
  variant?: AIChatPanelVariant;
}

export function AIChatPanel({ variant = 'quiet' }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'user', content: 'Can you optimize the SVG viewBox calculation for the TimeSeriesChart component?' },
    { role: 'assistant', content: 'Certainly. To make the chart fully responsive, normalize the padding and use a fixed aspect ratio viewBox of 600x220 with scalable path coordinates.' },
  ]);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const userBubble =
    variant === 'nocturne'
      ? 'bg-[#151921] border-[#2E3440] text-neutral-200'
      : variant === 'expressive'
      ? 'bg-neutral-100 border-neutral-200 text-neutral-900'
      : 'bg-neutral-50 border-neutral-200 text-neutral-900';

  const assistantBubble =
    variant === 'nocturne'
      ? 'bg-[#0F141C] border-cyan-900/50 text-cyan-50'
      : variant === 'expressive'
      ? 'bg-blue-50/50 border-blue-200 text-neutral-900'
      : 'bg-white border-neutral-200 text-neutral-900';

  const sendBtn =
    variant === 'nocturne'
      ? 'bg-cyan-500 text-black font-semibold hover:bg-cyan-400'
      : variant === 'expressive'
      ? 'bg-[#2547E8] text-white font-medium hover:bg-blue-700'
      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: input.trim() },
      { role: 'assistant', content: `Analyzed: "${input.trim()}". Applied deterministic update with 0 dependencies.` },
    ]);
    setInput('');
  };

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col justify-between min-h-[420px] transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-sm font-semibold tracking-tight">Tessellate Assistant</h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
            Claude 3.7 Sonnet
          </span>
        </div>
      </div>

      <div className="flex-1 py-4 space-y-4 overflow-y-auto">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] uppercase font-mono text-neutral-400 mb-1 px-1">
              {m.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div
              className={`p-3.5 rounded-xl text-xs max-w-lg border leading-relaxed ${
                m.role === 'user' ? userBubble : assistantBubble
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI to design, refine, or audit interface..."
          className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
        <button type="submit" className={`px-4 py-2 text-xs rounded-lg transition-colors ${sendBtn}`}>
          Send
        </button>
      </form>
    </div>
  );
}
