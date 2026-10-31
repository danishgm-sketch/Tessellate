import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectManifest } from '@tessellate/schemas';
import { createSampleProject } from '../store/sample-project.js';

const persistence = vi.hoisted(() => ({ projects: new Map<string, unknown>() }));

vi.mock('./storage.js', () => ({
  loadLocalProject: vi.fn(async (id: string) => {
    const project = persistence.projects.get(id);
    return project ? structuredClone(project) as ProjectManifest : null;
  }),
  saveLocalProject: vi.fn(async (manifest: ProjectManifest) => {
    persistence.projects.set(manifest.id, structuredClone(manifest));
    return 'indexeddb' as const;
  }),
  listLocalProjects: vi.fn(async () => Array.from(persistence.projects.values()) as ProjectManifest[]),
}));

import { createProjectSaver, journalBrowserProject, loadBrowserProject } from './browser-session.js';

describe('browser project journal recovery', () => {
  const values = new Map<string, string>();
  let rejectWrites = false;

  beforeEach(() => {
    values.clear();
    persistence.projects.clear();
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
});
