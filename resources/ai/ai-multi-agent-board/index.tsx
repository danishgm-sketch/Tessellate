import React, { useState } from 'react';

export type AIMultiAgentBoardVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIMultiAgentBoardProps {
  variant?: AIMultiAgentBoardVariant;
}

export function AIMultiAgentBoard({ variant = 'quiet' }: AIMultiAgentBoardProps) {
  const [activeLane] = useState('all');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const agents = [
    { name: 'ArchitectAgent', task: 'Design Schema 1.0.0', lane: 'Complete', status: 'done' },
    { name: 'CatalogAgent', task: 'Validating 324 resources', lane: 'In Progress', status: 'active' },
    { name: 'TestingAgent', task: 'Execute Playwright suite', lane: 'Queued', status: 'idle' },
  ];

  return (
    <div className={`w-full p-6 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-semibold tracking-tight">Autonomous Agent Swarm</h4>
          <p className="text-xs text-neutral-500">3 subagents coordinated via Antigravity SDK</p>
        </div>
        <span className="text-xs font-mono font-medium text-emerald-500">Active Swarm</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {['Queued', 'In Progress', 'Complete'].map((lane) => (
          <div key={lane} className="flex flex-col gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-mono font-semibold uppercase text-neutral-400">{lane}</span>
            {agents
              .filter((a) => a.lane === lane && (activeLane === 'all' || activeLane === lane))
              .map((a) => (
                <div key={a.name} className="p-2.5 rounded bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 text-xs shadow-xs">
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{a.name}</div>
                  <div className="text-[11px] text-neutral-500">{a.task}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
