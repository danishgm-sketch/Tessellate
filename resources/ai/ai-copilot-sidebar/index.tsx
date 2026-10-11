import React, { useState } from 'react';

export type AICopilotSidebarVariant = 'quiet' | 'expressive' | 'nocturne';

export interface AICopilotSidebarProps {
  variant?: AICopilotSidebarVariant;
}

export function AICopilotSidebar({ variant = 'quiet' }: AICopilotSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const cardBg =
    variant === 'nocturne'
      ? 'bg-[#0B0D10] border-[#2E3440] text-white'
      : variant === 'expressive'
      ? 'bg-white border-[#D9D6CF] text-neutral-900 shadow-sm'
      : 'bg-white border-neutral-200 text-neutral-900';

  const actionBg =
    variant === 'nocturne'
      ? 'bg-[#151921] hover:bg-[#1E232E] border-[#2E3440]'
      : variant === 'expressive'
      ? 'bg-blue-50/50 hover:bg-blue-50 border-blue-200 text-blue-900'
      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200';

  return (
    <div className={`w-full max-w-sm p-5 rounded-xl border flex flex-col gap-4 transition-all ${cardBg} ${collapsed ? 'h-16 overflow-hidden' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <h4 className="text-sm font-semibold tracking-tight">Active Context Copilot</h4>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs text-neutral-400 hover:text-current font-mono"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="text-xs text-neutral-500 leading-relaxed">
            Inspecting <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">DashboardView.tsx</span>. Found 2 token inconsistencies in border contrast.
          </div>

          <div className="space-y-2">
            <div className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${actionBg}`}>
              <div className="font-medium mb-1">Fix border contrast token</div>
              <div className="text-[11px] text-neutral-500">Replaces hardcoded border-slate-300 with semantic border-border-default.</div>
            </div>
            <div className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${actionBg}`}>
              <div className="font-medium mb-1">Add keyboard shortcuts</div>
              <div className="text-[11px] text-neutral-500">Registers ArrowUp / ArrowDown navigation for search table results.</div>
            </div>
          </div>

          <button className="w-full py-2 text-xs rounded-lg font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">
            Apply All Recommended Fixes
          </button>
        </>
      )}
    </div>
  );
}
