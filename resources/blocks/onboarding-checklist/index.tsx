import React, { useState } from 'react';

export type OnboardingChecklistVariant = 'quiet' | 'expressive' | 'nocturne';

export interface OnboardingChecklistProps {
  variant?: OnboardingChecklistVariant;
}

export function OnboardingChecklist({ variant = 'quiet' }: OnboardingChecklistProps) {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Inspect Design DNA tokens', done: true },
    { id: 2, title: 'Compose your first shell and section', done: true },
    { id: 3, title: 'Export clean React source code', done: false },
  ]);

  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  const toggle = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <h3 className="text-base font-bold mb-2">Getting Started with Tessellate</h3>
      <p className="text-xs opacity-75 mb-6">Complete these quick steps to master the composition engine.</p>
      <div className="space-y-3">
        {tasks.map((t) => (
          <label key={t.id} className="flex items-center gap-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => toggle(t.id)}
              className="cursor-pointer"
            />
            <span className={t.done ? 'line-through opacity-50' : 'font-medium'}>{t.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
