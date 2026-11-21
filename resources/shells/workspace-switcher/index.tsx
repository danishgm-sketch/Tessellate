import React, { useState } from 'react';

export type WorkspaceSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface WorkspaceSwitcherProps {
  variant?: WorkspaceSwitcherVariant;
  currentWorkspace?: string;
  workspaces?: string[];
  onSelectWorkspace?: (name: string) => void;
}

export function WorkspaceSwitcher({
  variant = 'quiet',
  currentWorkspace,
  workspaces = ['Example Workspace', 'Starter Lab'],
  onSelectWorkspace,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [uncontrolledWorkspace, setUncontrolledWorkspace] = useState(
    workspaces[0] ?? 'Example Workspace'
  );
  const selectedWorkspace =
    currentWorkspace ??
    (workspaces.includes(uncontrolledWorkspace)
      ? uncontrolledWorkspace
      : (workspaces[0] ?? 'Example Workspace'));

  let theme = 'bg-white border border-neutral-200 text-neutral-900';
  let menuTheme = 'border-neutral-200 bg-white text-neutral-900';
  if (variant === 'expressive') theme = 'bg-white border border-[#D9D6CF] text-neutral-900 shadow-2xs';
  if (variant === 'nocturne') {
    theme = 'bg-[#11141B] border border-[#2E3440] text-white';
    menuTheme = 'border-[#2E3440] bg-[#11141B] text-white';
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium ${theme}`}
      >
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-[#2547E8] text-white flex items-center justify-center font-bold text-xs" aria-hidden="true">
            {selectedWorkspace.slice(0, 1)}
          </div>
          <span>{selectedWorkspace}</span>
        </div>
        <span className="opacity-70" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div role="listbox" aria-label="Example workspaces" className={`absolute top-full left-0 mt-1 w-full rounded-lg border p-1 shadow-lg z-20 text-xs ${menuTheme}`}>
          {workspaces.map((name) => (
            <button
              key={name}
              type="button"
              role="option"
              aria-selected={name === selectedWorkspace}
              onClick={() => {
                if (currentWorkspace === undefined) {
                  setUncontrolledWorkspace(name);
                }
                setOpen(false);
                onSelectWorkspace?.(name);
              }}
              className={`w-full text-left p-1.5 rounded ${
                variant === 'nocturne' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
              } ${name === selectedWorkspace ? 'font-semibold' : ''}`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
