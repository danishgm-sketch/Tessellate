import React from 'react';

export type EmptyWorkspaceVariant = 'quiet' | 'expressive' | 'nocturne';

export interface EmptyWorkspaceProps {
  variant?: EmptyWorkspaceVariant;
  onCreateProject?: () => void;
}

export function EmptyWorkspace({ variant = 'quiet', onCreateProject }: EmptyWorkspaceProps) {
  let bg = 'bg-white text-neutral-900 border-neutral-200';

  if (variant === 'expressive') {
    bg = 'bg-neutral-50/40 text-neutral-950 border-[#D9D6CF] dark:bg-[#0B0D10] dark:text-white dark:border-[#2E3440]';
  } else if (variant === 'nocturne') {
    bg = 'bg-[#0B0D10] text-white border-[#2E3440]';
  }

  return (
    <div className={`w-full p-12 rounded-[var(--tess-radius-xl,8px)] border text-center flex flex-col items-center justify-center transition-colors ${bg}`}>
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg mb-4 opacity-75">
        ✧
      </div>
      <h3 className="text-base font-bold mb-2">No Projects Found</h3>
      <p className="text-xs text-neutral-700 dark:text-neutral-300 max-w-sm mb-6">
        Start by creating a new composition or choose from 12 pre-built blueprints.
      </p>
      <button type="button" onClick={onCreateProject} disabled={!onCreateProject} aria-describedby={!onCreateProject ? 'empty-workspace-action-help' : undefined} className="px-5 py-2.5 rounded-[var(--tess-radius-lg,8px)] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60">
        + Create New Project
      </button>
      {!onCreateProject && <span id="empty-workspace-action-help" className="sr-only">Connect a project creation action before enabling this control.</span>}
    </div>
  );
}
