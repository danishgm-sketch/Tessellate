import React from 'react';

export type KanbanBoardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface KanbanBoardProps {
  variant?: KanbanBoardVariant;
}

export function KanbanBoard({ variant = 'quiet' }: KanbanBoardProps) {
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

  const columns = [
    { title: 'Backlog', tasks: ['Audit contrast on Nocturne tokens', 'Generate OpenAPI spec'] },
    { title: 'In Progress', tasks: ['Scale 56 application blocks'] },
    { title: 'Complete', tasks: ['72 Marketing sections verified', '44 Primitives complete'] },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border overflow-x-auto transition-colors ${bg}`}>
      <h3 className="text-sm font-semibold mb-6">Task Board</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[600px]">
        {columns.map((col) => (
          <div key={col.title} className={`p-4 rounded-xl border flex flex-col gap-3 ${lane}`}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>{col.title}</span>
              <span className="font-mono text-[10px] opacity-60">({col.tasks.length})</span>
            </div>
            {col.tasks.map((task) => (
              <div key={task} className={`p-3 rounded-lg border text-xs ${card}`}>
                <span className="font-medium">{task}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
