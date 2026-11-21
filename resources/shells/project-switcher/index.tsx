import React, { useState } from 'react';

export type ProjectSwitcherVariant = 'quiet' | 'expressive' | 'nocturne';

export interface ProjectSwitcherProps {
  variant?: ProjectSwitcherVariant;
  currentProject?: string;
  projects?: string[];
  onSelectProject?: (project: string) => void;
}

export function ProjectSwitcher({
  variant = 'quiet',
  currentProject = 'Example Workspace',
  projects = ['Example Workspace', 'Design System', 'Documentation Site'],
  onSelectProject,
}: ProjectSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(currentProject);

  let theme = 'hover:bg-neutral-100 text-neutral-800';
  let menuTheme = 'bg-white border-neutral-200 text-neutral-900';
  if (variant === 'expressive') {
    theme = 'hover:bg-[#E7EBFF] text-[#2547E8] font-semibold';
  } else if (variant === 'nocturne') {
    theme = 'hover:bg-neutral-800 text-white';
    menuTheme = 'bg-[#11141B] border-[#2E3440] text-white';
  }

  return (
    <div className="relative inline-flex items-center gap-1.5 text-xs">
      <span className="opacity-70">project /</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${theme}`}
      >
        <span>{selectedProject}</span>
        <span className="opacity-70 text-xs" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Example projects"
          className={`absolute top-full left-0 mt-1 min-w-44 rounded-lg border p-1 shadow-lg z-20 ${menuTheme}`}
        >
          {projects.map((project) => (
            <button
              key={project}
              type="button"
              role="option"
              aria-selected={project === selectedProject}
              onClick={() => {
                setSelectedProject(project);
                setOpen(false);
                onSelectProject?.(project);
              }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                variant === 'nocturne' ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
              } ${project === selectedProject ? 'font-semibold' : ''}`}
            >
              {project}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
