import React, {useState} from 'react';

export type KanbanBoardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KanbanBoardProps {
  variant?: KanbanBoardVariant;
  title?: string;
  columns?: Array<{title:string;tasks:string[]}>;
}

export function KanbanBoard({ variant = 'quiet', title='Sample task board', columns: suppliedColumns }: KanbanBoardProps) {
  const [completed,setCompleted] = useState<string[]>([]);
  let bg = 'bg-white text-neutral-900 border-neutral-200';
  let lane = 'bg-neutral-50/60 border-neutral-200';
  let card = 'bg-white border-neutral-200 shadow-2xs';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/30 text-neutral-950 border-[#D9D6CF]';
    lane = 'bg-white border-blue-100 shadow-xs';
    card = 'bg-neutral-50/50 border-neutral-200';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
    lane = 'bg-[#151921] border-[#2E3440]';
    card = 'bg-[#0E1217] border-[#2E3440]';
  }

  const columns = suppliedColumns ?? [
    { title: 'Backlog', tasks: ['Prepare employee welcome materials', 'Review first-week checklist'] },
    { title: 'In Progress', tasks: ['Assign an onboarding mentor'] },
    { title: 'Complete', tasks: ['Publish the remote-work guide', 'Confirm team directory details'] },
  ];

  return (
    <div className={`w-full p-6 rounded-[var(--tess-radius-xl,8px)] border overflow-x-auto transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-6">{title}</h3>
      {columns.length === 0 ? (
        <div role="status" aria-live="polite" className="rounded border border-dashed border-neutral-300 p-8 text-center text-sm opacity-75 dark:border-neutral-700">
          This board has no columns or tasks.
        </div>
      ) : (
        <div className="grid grid-cols-1 @md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.title} className={`p-4 rounded-[var(--tess-radius-xl,8px)] border flex flex-col gap-3 ${lane}`}>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>{col.title}</span>
                <span className="font-mono text-[10px] opacity-60">({col.tasks.length})</span>
              </div>
              {col.tasks.map((task) => (
                <button type="button" key={task} aria-pressed={completed.includes(task)} onClick={()=>setCompleted(previous=>previous.includes(task)?previous.filter(value=>value!==task):[...previous,task])} className={`p-3 text-left rounded-[var(--tess-radius-lg,8px)] border text-xs ${card}`}>
                  <span className="font-medium">{completed.includes(task)?'✓ ':''}{task}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
