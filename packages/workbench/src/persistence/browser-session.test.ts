import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectManifest } from '@tessellate/schemas';
import { createSampleProject } from '../store/sample-project.js';

const persistence = vi.hoisted(() => ({
  projects: new Map<string, unknown>(),
  saveGate: null as Promise<void> | null,
  saveStarted: null as (() => void) | null,
  databaseExists: null as boolean | null,
}));

vi.mock('./storage.js', () => ({
  hasExistingLocalProjectDatabase: vi.fn(async () => persistence.databaseExists),
  loadLocalProject: vi.fn(async (id: string) => {
    const project = persistence.projects.get(id);
    return project ? structuredClone(project) as ProjectManifest : null;
  }),
  saveLocalProject: vi.fn(async (manifest: ProjectManifest) => {
    persistence.projects.set(manifest.id, structuredClone(manifest));
    persistence.saveStarted?.();
    if (persistence.saveGate) await persistence.saveGate;
    return 'indexeddb' as const;
  }),
  listLocalProjects: vi.fn(async () => Array.from(persistence.projects.values()) as ProjectManifest[]),
}));

import { createProjectSaver, journalBrowserProject, loadBrowserProject } from './browser-session.js';
import { hasExistingLocalProjectDatabase, listLocalProjects } from './storage.js';

describe('browser project journal recovery', () => {
  const values = new Map<string, string>();
  let rejectWrites = false;

  beforeEach(() => {
    values.clear();
    persistence.projects.clear();
    persistence.saveGate = null;
    persistence.saveStarted = null;
    persistence.databaseExists = null;
    rejectWrites = false;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        get length() { return values.size; },
        key: (index: number) => Array.from(values.keys())[index] ?? null,
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => {
          if (rejectWrites) throw Object.assign(new Error('quota exceeded'), { name: 'QuotaExceededError' });
          values.set(key, value);
        },
        removeItem: (key: string) => { values.delete(key); },
        clear: () => values.clear(),
      } satisfies Storage,
    });
  });

  it('does not open a new local project database on a clean first visit', async () => {
    persistence.databaseExists = false;

    const loaded = await loadBrowserProject();

    expect(loaded.manifest).toBeNull();
    expect(loaded.storageWarnings).toEqual([]);
    expect(hasExistingLocalProjectDatabase).toHaveBeenCalledOnce();
    expect(listLocalProjects).not.toHaveBeenCalled();
  });

  it('keeps listing local projects when database enumeration is unsupported', async () => {
    const existing = { ...createSampleProject(), id: 'project-legacy-browser' };
    persistence.projects.set(existing.id, existing);

    const loaded = await loadBrowserProject();

    expect(loaded.manifest?.id).toBe(existing.id);
    expect(listLocalProjects).toHaveBeenCalledOnce();
  });

  it('does not put an unrelated corrupted active project into the requested project recovery state', async () => {
    const requested = { ...createSampleProject(), id: 'project-requested' };
    const unrelatedRaw = JSON.stringify({ id: 'project-unrelated', name: 'damaged record' });
    values.set('tessellate_active_project', unrelatedRaw);
    persistence.projects.set(requested.id, requested);

    const loaded = await loadBrowserProject(requested.id);

    expect(loaded.manifest?.id).toBe(requested.id);
    expect(loaded.damagedRecords).toEqual([]);
    expect(values.get('tessellate_active_project')).toBe(unrelatedRaw);
  });

  it('reloads the newest IndexedDB project when a later localStorage journal write exceeds quota', async () => {
    const original = { ...createSampleProject(), id: 'project-quota-recovery' };
    journalBrowserProject(original);
    const edited: ProjectManifest = {
      ...original,
      name: 'Saved in IndexedDB after quota failure',
      updatedAt: new Date(Date.now() + 10_000).toISOString(),
    };
    rejectWrites = true;

    await createProjectSaver(vi.fn())(edited);
    rejectWrites = false;
    const loaded = await loadBrowserProject(original.id);

    expect(loaded.manifest).toEqual(edited);
    expect(loaded.damagedRecords).toEqual([]);
  });

  it('does not restore a newer timestamped journal after Undo was saved to IndexedDB', async () => {
    const original = { ...createSampleProject(), id: 'project-undo-quota-recovery', name: 'Undo target A', updatedAt: '2026-01-01T00:00:00.000Z' };
    const edited = { ...original, name: 'Edited state B', updatedAt: '2026-02-01T00:00:00.000Z' };
    const save = createProjectSaver(vi.fn());
    await save(original);
    await save(edited);

    rejectWrites = true;
    await save(original);
    rejectWrites = false;
    const loaded = await loadBrowserProject(original.id);

    expect(persistence.projects.get(original.id)).toEqual(original);
    expect(loaded.manifest).toEqual(original);
  });

  it('discovers an IndexedDB project when its active localStorage journal has been cleared', async () => {
    const project = { ...createSampleProject(), id: 'project-indexeddb-only' };
    persistence.projects.set(project.id, project);

    const loaded = await loadBrowserProject();

    expect(loaded.manifest?.id).toBe(project.id);
  });

  it('does not let an older queued save delete a newer browser recovery journal', async () => {
    const original = { ...createSampleProject(), id: 'project-raced-journal' };
    const older = { ...original, name: 'Older saved project', updatedAt: '2026-01-01T00:00:00.000Z' };
    const newer = { ...original, name: 'Newer recovery project', updatedAt: '2026-01-02T00:00:00.000Z' };
    journalBrowserProject(original);
    let releaseSave!: () => void;
    let signalSaveStarted!: () => void;
    const saveStarted = new Promise<void>((resolve) => { signalSaveStarted = resolve; });
    persistence.saveStarted = signalSaveStarted;
    persistence.saveGate = new Promise<void>((resolve) => { releaseSave = resolve; });
    const save = createProjectSaver(vi.fn());

    rejectWrites = true;
    const olderSave = save(older);
    await saveStarted;
    rejectWrites = false;
    const newerSave = save(newer);
    persistence.saveGate = null;
    releaseSave();
    await Promise.all([olderSave, newerSave]);

    expect(JSON.parse(values.get(`tessellate_project_${original.id}`)!).name).toBe('Newer recovery project');
    expect(JSON.parse(values.get('tessellate_active_project')!).name).toBe('Newer recovery project');
  });
});
