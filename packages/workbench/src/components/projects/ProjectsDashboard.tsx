import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exportProjectManifestToJson, importProjectManifestFromJson } from '@tessellate/exporter';
import {
  deleteLocalProject,
  duplicateLocalProject,
  listLocalProjects,
  loadLocalProject,
  newProjectId,
  purgeDeletedProjects,
  restoreProject,
  saveLocalProject,
  softDeleteProject,
  updateProjectMeta,
  type LocalProjectSummary,
} from '../../persistence/storage.js';
import { createSampleProject } from '../../store/sample-project.js';
import { Copy, Download, FolderOpen, Pencil, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react';

/** Opens a project in the editor. */
export function projectHref(id: string): string {
  return `/workbench?project=${encodeURIComponent(id)}`;
}

function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const diff = Date.now() - Date.parse(iso);
  if (!Number.isFinite(diff)) return '—';
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(iso).toLocaleDateString();
}

function downloadText(fileName: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFileName(name: string): string {
  return name.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'project';
}

type Notice = { tone: 'info' | 'error'; text: string; undoId?: string };

const btn =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tess-dark-accent,#6782FF)]';
const ghost = `${btn} text-[var(--tess-dark-text-secondary,#A8AFBA)] hover:bg-[var(--tess-dark-hover,#1C2128)] hover:text-[var(--tess-dark-text,#F5F7FA)]`;
const primary = `${btn} bg-[var(--tess-dark-accent,#6782FF)] text-[#0B0D10] hover:brightness-110`;

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<LocalProjectSummary[] | null>(null);
  const [deleted, setDeleted] = useState<LocalProjectSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [folderFilter, setFolderFilter] = useState<string>('__all');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [folderEditId, setFolderEditId] = useState<string | null>(null);
  const [folderValue, setFolderValue] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const all = await listLocalProjects({ includeDeleted: true });
      setProjects(all.filter((p) => !p.deletedAt));
      setDeleted(all.filter((p) => p.deletedAt));
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not read projects stored in this browser.');
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    void purgeDeletedProjects().finally(refresh);
  }, [refresh]);

  const folders = useMemo(
    () => [...new Set((projects ?? []).map((p) => p.folder).filter((f): f is string => Boolean(f)))].sort(),
    [projects],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (projects ?? []).filter((p) => {
      if (folderFilter === '__unfiled' && p.folder) return false;
      if (folderFilter !== '__all' && folderFilter !== '__unfiled' && p.folder !== folderFilter) return false;
      if (!q) return true;
      return [p.name, p.folder, p.archetype].some((v) => v?.toLowerCase().includes(q));
    });
  }, [projects, query, folderFilter]);

  const run = async (action: () => Promise<void>, failure: string) => {
    try {
      await action();
    } catch (err) {
      setNotice({ tone: 'error', text: `${failure}: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      await refresh();
    }
  };

  const commitRename = (id: string) =>
    run(async () => {
      const name = renameValue.trim();
      setRenamingId(null);
      if (!name) return;
      const manifest = await loadLocalProject(id);
      if (!manifest) throw new Error('project not found');
      await saveLocalProject({ ...manifest, name, updatedAt: new Date().toISOString() });
    }, 'Could not rename the project');

  const commitFolder = (id: string) =>
    run(async () => {
      setFolderEditId(null);
      await updateProjectMeta(id, { folder: folderValue.trim() || undefined });
    }, 'Could not move the project');

  const handleDelete = (p: LocalProjectSummary) =>
    run(async () => {
      await softDeleteProject(p.id);
      setNotice({ tone: 'info', text: `“${p.name}” moved to Recently deleted.`, undoId: p.id });
    }, 'Could not delete the project');

  const handleExport = (p: LocalProjectSummary) =>
    run(async () => {
      const manifest = await loadLocalProject(p.id);
      if (!manifest) throw new Error('project not found');
      downloadText(`${safeFileName(p.name)}.tess.json`, exportProjectManifestToJson(manifest));
    }, 'Could not export the project');

  const handleImport = async (file: File) => {
    const result = importProjectManifestFromJson(await file.text());
    if (!result.success || !result.manifest) {
      setNotice({ tone: 'error', text: `Import failed: ${result.error ?? 'the file is not a valid .tess.json project.'}` });
      return;
    }
    const now = new Date().toISOString();
    // Imports always become a new project, so an import can never overwrite existing work.
    const imported = { ...result.manifest, id: newProjectId(), createdAt: now, updatedAt: now };
    await run(async () => {
      await saveLocalProject(imported);
      setNotice({ tone: 'info', text: `Imported “${imported.name}”.${result.warnings?.length ? ` ${result.warnings.join(' ')}` : ''}` });
    }, 'Could not import the project');
  };

  const openSample = () =>
    run(async () => {
      const now = new Date().toISOString();
      const sample = { ...createSampleProject(), id: newProjectId(), name: 'Sample project', createdAt: now, updatedAt: now };
      await saveLocalProject(sample);
      window.location.href = projectHref(sample.id);
    }, 'Could not create the sample project');

  return (
    <div className="min-h-screen bg-[var(--tess-dark-canvas,#0B0D10)] text-[var(--tess-dark-text,#F5F7FA)]" data-testid="projects-dashboard">
      <header className="border-b border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-panel,#111419)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <a href="/" className={ghost} aria-label="Tessellate home">
              <span className="grid h-6 w-6 place-items-center rounded bg-[var(--tess-dark-accent,#6782FF)] text-xs font-bold text-[#0B0D10]">T</span>
            </a>
            <div>
              <h1 className="text-lg font-semibold">Projects</h1>
              <p className="text-xs text-[var(--tess-dark-text-secondary,#A8AFBA)]">Saved in this browser · {projects?.length ?? 0} project{projects?.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept=".json,.tess.json,application/json"
              className="sr-only"
              aria-label="Import a .tess.json project file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void handleImport(f);
              }}
            />
            <button type="button" className={ghost} onClick={() => fileInput.current?.click()}>
              <Upload className="h-3.5 w-3.5" aria-hidden /> Import
            </button>
            <a href="/compose" className={primary}>
              <Plus className="h-3.5 w-3.5" aria-hidden /> New project
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        <div role="status" aria-live="polite">
          {notice && (
            <div
              className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
                notice.tone === 'error'
                  ? 'border-[#7A2A31] bg-[#2A1215] text-[#FF8A93]'
                  : 'border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-raised,#171B21)]'
              }`}
            >
              <span>{notice.text}</span>
              <span className="flex gap-2">
                {notice.undoId && (
                  <button
                    type="button"
                    className={ghost}
                    onClick={() => {
                      const id = notice.undoId!;
                      setNotice(null);
                      void run(() => restoreProject(id), 'Could not restore the project');
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Undo
                  </button>
                )}
                <button type="button" className={ghost} onClick={() => setNotice(null)} aria-label="Dismiss message">
                  Dismiss
                </button>
              </span>
            </div>
          )}
        </div>

        {loadError && (
          <p role="alert" className="rounded-lg border border-[#7A2A31] bg-[#2A1215] px-4 py-3 text-sm text-[#FF8A93]">
            {loadError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tess-dark-text-muted,#707986)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, client or type"
              className="w-full rounded-lg border border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-panel,#111419)] py-2 pl-9 pr-3 text-sm placeholder:text-[var(--tess-dark-text-muted,#707986)] focus:border-[var(--tess-dark-accent,#6782FF)] focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--tess-dark-text-secondary,#A8AFBA)]">
            Client folder
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="rounded-lg border border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-panel,#111419)] px-2 py-2 text-sm text-[var(--tess-dark-text,#F5F7FA)]"
            >
              <option value="__all">All projects</option>
              <option value="__unfiled">Unfiled</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </div>

        {projects === null ? (
          <p className="py-16 text-center text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]">Loading projects…</p>
        ) : projects.length === 0 ? (
          <section className="rounded-xl border border-dashed border-[var(--tess-dark-border-strong,#353C46)] px-6 py-16 text-center">
            <h2 className="text-base font-semibold">No projects yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]">
              Describe a product to compose your first interface, import a .tess.json file, or explore the sample.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <a href="/compose" className={primary}>
                <Plus className="h-3.5 w-3.5" aria-hidden /> Compose a project
              </a>
              <button type="button" className={ghost} onClick={() => void openSample()}>
                Open the sample project
              </button>
            </div>
          </section>
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]">No projects match your search.</p>
        ) : (
          <ul className="divide-y divide-[var(--tess-dark-border,#272C34)] overflow-hidden rounded-xl border border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-panel,#111419)]" aria-label="Projects">
            {visible.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3" data-testid="project-row">
                <div className="min-w-[200px] flex-1">
                  {renamingId === p.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void commitRename(p.id);
                      }}
                    >
                      <label className="sr-only" htmlFor={`rename-${p.id}`}>
                        New name for {p.name}
                      </label>
                      <input
                        id={`rename-${p.id}`}
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => void commitRename(p.id)}
                        onKeyDown={(e) => e.key === 'Escape' && setRenamingId(null)}
                        className="w-full rounded-md border border-[var(--tess-dark-accent,#6782FF)] bg-[var(--tess-dark-canvas,#0B0D10)] px-2 py-1 text-sm"
                      />
                    </form>
                  ) : (
                    <a href={projectHref(p.id)} className="text-sm font-semibold hover:underline focus-visible:underline">
                      {p.name}
                    </a>
                  )}
                  <p className="mt-0.5 text-xs text-[var(--tess-dark-text-secondary,#A8AFBA)]">
                    {p.archetype ? `${p.archetype} · ` : ''}
                    {p.screenCount} screen{p.screenCount === 1 ? '' : 's'} · edited {relativeTime(p.updatedAt)}
                  </p>
                </div>

                {folderEditId === p.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void commitFolder(p.id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <label className="sr-only" htmlFor={`folder-${p.id}`}>
                      Client folder for {p.name}
                    </label>
                    <input
                      id={`folder-${p.id}`}
                      autoFocus
                      list="tess-folders"
                      value={folderValue}
                      placeholder="Client name"
                      onChange={(e) => setFolderValue(e.target.value)}
                      onBlur={() => void commitFolder(p.id)}
                      onKeyDown={(e) => e.key === 'Escape' && setFolderEditId(null)}
                      className="w-40 rounded-md border border-[var(--tess-dark-accent,#6782FF)] bg-[var(--tess-dark-canvas,#0B0D10)] px-2 py-1 text-xs"
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    className={ghost}
                    onClick={() => {
                      setFolderEditId(p.id);
                      setFolderValue(p.folder ?? '');
                    }}
                    aria-label={`Move ${p.name} to a client folder`}
                  >
                    <FolderOpen className="h-3.5 w-3.5" aria-hidden /> {p.folder ?? 'Unfiled'}
                  </button>
                )}

                <div className="flex flex-wrap items-center gap-1">
                  <a href={projectHref(p.id)} className={primary}>
                    Open
                  </a>
                  <button
                    type="button"
                    className={ghost}
                    aria-label={`Rename ${p.name}`}
                    onClick={() => {
                      setRenamingId(p.id);
                      setRenameValue(p.name);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={ghost}
                    aria-label={`Duplicate ${p.name}`}
                    onClick={() => void run(async () => void (await duplicateLocalProject(p.id)), 'Could not duplicate the project')}
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button type="button" className={ghost} aria-label={`Export ${p.name} as .tess.json`} onClick={() => void handleExport(p)}>
                    <Download className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button type="button" className={ghost} aria-label={`Delete ${p.name}`} onClick={() => void handleDelete(p)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <datalist id="tess-folders">
          {folders.map((f) => (
            <option key={f} value={f} />
          ))}
        </datalist>

        {deleted.length > 0 && (
          <details className="rounded-xl border border-[var(--tess-dark-border,#272C34)] bg-[var(--tess-dark-panel,#111419)] px-4 py-3">
            <summary className="cursor-pointer text-sm text-[var(--tess-dark-text-secondary,#A8AFBA)]">
              Recently deleted ({deleted.length}) · kept for 30 days
            </summary>
            <ul className="mt-3 space-y-2">
              {deleted.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{p.name}</span>
                  <span className="flex gap-1">
                    <button type="button" className={ghost} onClick={() => void run(() => restoreProject(p.id), 'Could not restore the project')}>
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Restore
                    </button>
                    <button
                      type="button"
                      className={ghost}
                      onClick={() => {
                        if (window.confirm(`Permanently delete “${p.name}”? This cannot be undone.`)) {
                          void run(() => deleteLocalProject(p.id), 'Could not delete the project');
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete forever
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </main>
    </div>
  );
}
