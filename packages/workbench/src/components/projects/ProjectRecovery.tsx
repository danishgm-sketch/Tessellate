import React from 'react';
import type { CorruptedProjectRecovery } from '../../persistence/recovery.js';

/**
 * Safe mode for a stored project that fails validation and cannot be migrated (AGENTS.md §12):
 * the raw record is preserved, explained and exportable — never silently discarded.
 */
export function ProjectRecovery({ projectId, recovery }: { projectId: string; recovery: CorruptedProjectRecovery }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([recovery.exportRawJson()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectId}-raw-record.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <main
      data-testid="project-recovery"
      className="min-h-screen bg-[var(--tess-dark-canvas,#0B0D10)] px-4 py-16 text-[var(--tess-dark-text,#F5F7FA)]"
    >
      <div className="mx-auto max-w-2xl space-y-5 rounded-xl border border-[#7A2A31] bg-[var(--tess-dark-panel,#111419)] p-6">
        <h1 className="text-lg font-semibold">This project needs recovery</h1>
        <p className="text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]">
          The saved data for this project could not be read safely, so it has been opened in safe mode. Nothing has been
          changed or deleted. Download the raw record to keep a copy, then contact support or import a corrected file.
        </p>
        <ul className="max-h-60 list-disc space-y-1 overflow-auto rounded-md bg-[var(--tess-dark-canvas,#0B0D10)] p-3 pl-6 font-mono text-xs text-[#FF8A93]">
          {recovery.validationIssues.map((issue, i) => (
            <li key={i}>{issue}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={download}
            className="rounded-md bg-[var(--tess-dark-accent,#6782FF)] px-3 py-2 text-xs font-semibold text-[#0B0D10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Download raw record
          </button>
          <a
            href="/workbench"
            className="rounded-md px-3 py-2 text-xs font-medium text-[var(--tess-dark-text-secondary,#A8AFBA)] hover:bg-[var(--tess-dark-hover,#1C2128)]"
          >
            Back to projects
          </a>
        </div>
      </div>
    </main>
  );
}

export function ProjectNotFound({ projectId }: { projectId: string }) {
  return (
    <main
      data-testid="project-not-found"
      className="min-h-screen bg-[var(--tess-dark-canvas,#0B0D10)] px-4 py-16 text-[var(--tess-dark-text,#F5F7FA)]"
    >
      <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-panel,#111419)] p-6">
        <h1 className="text-lg font-semibold">Project not found</h1>
        <p className="text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]">
          No project with id <code className="font-mono">{projectId}</code> is saved in this browser. Projects are stored
          locally, so they are only available on the browser where they were created unless you export them.
        </p>
        <a
          href="/workbench"
          className="inline-block rounded-md bg-[var(--tess-dark-accent,#6782FF)] px-3 py-2 text-xs font-semibold text-[#0B0D10]"
        >
          Go to your projects
        </a>
      </div>
    </main>
  );
}
