import React from 'react';

export type TaskDetailVariant = 'quiet' | 'expressive' | 'nocturne';

export interface TaskDetailProps {
  variant?: TaskDetailVariant;
}

export function TaskDetail({ variant = 'quiet' }: TaskDetailProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-6 sm:p-8 rounded-xl border transition-colors ${bg}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-mono opacity-60 uppercase">TASK-1048</span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">IN PROGRESS</span>
      </div>
      <h2 className="text-base sm:text-lg font-bold mb-3">Scale 56 Application Blocks</h2>
      <p className="text-xs opacity-75 leading-relaxed mb-6">
        Ensure every block implements Quiet, Expressive, and Nocturne variants with 0 external dependencies.
      </p>

      <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-neutral-100 dark:border-neutral-800 pt-4">
        <div>
          <span className="opacity-50 text-[10px] block">Assignee</span>
          <span className="font-bold">Antigravity Agent</span>
        </div>
        <div>
          <span className="opacity-50 text-[10px] block">Priority</span>
          <span className="font-bold text-amber-500">P0 Urgent</span>
        </div>
      </div>
    </div>
  );
}
