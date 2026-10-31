import React, { useState } from 'react';

export type AIToolExecutionTimelineVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AIToolExecutionTimelineProps {
  variant?: AIToolExecutionTimelineVariant;
}

export function AIToolExecutionTimeline({ variant = 'quiet' }: AIToolExecutionTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>('t2');

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
        ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
        : 'bg-white border-neutral-200 text-neutral-900';

  const toolCalls = [
    {
      id: 't1',
      tool: 'search_catalog',
      args: 'query: "feature steps", category: "sections"',
      duration: '32ms · sample',
      status: 'example',
      output: 'Example match: feature-steps',
    },
    {
      id: 't2',
      tool: 'validate_manifest',
      args: 'target: "example-manifest.json"',
      duration: '18ms · sample',
      status: 'example',
      output: 'Example result: the sample manifest passed validation.',
    },
    {
      id: 't3',
      tool: 'export_vite_project',
      args: 'outputDir: "example-app"',
      duration: '140ms · sample',
      status: 'example',
      output: 'Preview only. No project files were generated.',
    },
  ];

  return (
    <div className={`w-full p-5 rounded-xl border flex flex-col gap-4 transition-colors ${cardBg}`}>
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-semibold">Example agent tool trace</span>
        <span className="text-[10px] font-mono text-neutral-400">Sample total: 190ms</span>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Example trace. Sample calls and timings only; this preview does not run tools or create
        files.
      </p>

      <div className="space-y-3">
        {toolCalls.map((tc) => {
          const isExpanded = expandedId === tc.id;
          return (
            <div
              key={tc.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden text-xs"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/60 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono font-semibold">{tc.tool}()</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
                  <span>{tc.duration}</span>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="p-3 bg-white dark:bg-black/30 border-t border-neutral-200 dark:border-neutral-800 space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Arguments:</span>
                    <span className="text-neutral-800 dark:text-neutral-200">{tc.args}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Sample output:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{tc.output}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
