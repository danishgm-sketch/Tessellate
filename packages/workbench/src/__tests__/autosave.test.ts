import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { createSampleProject } from '../store/sample-project.js';
import { startProjectAutosave } from '../persistence/autosave.js';
import {
  clearLocalMemoryStorage,
  deleteLocalProject,
  duplicateLocalProject,
  listLocalCheckpoints,
  listLocalProjects,
  loadLocalProject,
  newProjectId,
  restoreProject,
  saveLocalProject,
  softDeleteProject,
  updateProjectMeta,
} from '../persistence/storage.js';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function storedProject(name: string) {
  return { ...createSampleProject(), id: newProjectId(), name };
}

describe('Local-first persistence (Phase 25)', () => {
  let stop: (() => Promise<void>) | null = null;

  beforeEach(() => {
    clearLocalMemoryStorage();
    useWorkbenchStore.getState().loadSampleProject();
    useWorkbenchStore.setState({ persistenceEnabled: false });
  });

  afterEach(async () => {
    await stop?.();
    stop = null;
  });

  it('generates unique project ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newProjectId()));
    expect(ids.size).toBe(200);
  });

  it('autosaves edits and renames of an opened project', async () => {
    const project = storedProject('Clinic booking');
    await saveLocalProject(project);
    stop = startProjectAutosave(useWorkbenchStore, { debounceMs: 5 });

    useWorkbenchStore.getState().openProject(project);
    useWorkbenchStore.getState().updateProjectName('Clinic booking — v2');
    await wait(30);

    const reloaded = await loadLocalProject(project.id);
    expect(reloaded?.name).toBe('Clinic booking — v2');
    expect(useWorkbenchStore.getState().saveState.status).toBe('saved');
  });

  it('persists checkpoints so they survive a reload', async () => {
    const project = storedProject('Travel marketplace');
    await saveLocalProject(project);
    stop = startProjectAutosave(useWorkbenchStore, { debounceMs: 5 });
    useWorkbenchStore.getState().openProject(project);

    useWorkbenchStore.getState().createCheckpoint('Before client review');
    await wait(20);

    const stored = await listLocalCheckpoints(project.id);
    expect(stored.map((c) => c.name)).toContain('Before client review');
  });

  it('does not autosave the unsaved built-in sample', async () => {
    stop = startProjectAutosave(useWorkbenchStore, { debounceMs: 5 });
    useWorkbenchStore.getState().updateProjectName('Edited sample');
    await wait(30);
    expect(await listLocalProjects()).toHaveLength(0);
  });

  it('flushes pending edits when autosave stops (tab close)', async () => {
    const project = storedProject('Unsaved edit');
    await saveLocalProject(project);
    stop = startProjectAutosave(useWorkbenchStore, { debounceMs: 10_000 });
    useWorkbenchStore.getState().openProject(project);
    useWorkbenchStore.getState().updateProjectName('Saved on close');
    await stop();
    stop = null;
    expect((await loadLocalProject(project.id))?.name).toBe('Saved on close');
  });

  it('keeps separate projects separate', async () => {
    const a = storedProject('Client A');
    const b = storedProject('Client B');
    await saveLocalProject(a);
    await saveLocalProject(b);
    stop = startProjectAutosave(useWorkbenchStore, { debounceMs: 5 });

    useWorkbenchStore.getState().openProject(a);
    useWorkbenchStore.getState().updateProjectName('Client A edited');
    await wait(30);
    useWorkbenchStore.getState().openProject(b);
    useWorkbenchStore.getState().updateProjectName('Client B edited');
    await wait(30);

    expect((await loadLocalProject(a.id))?.name).toBe('Client A edited');
    expect((await loadLocalProject(b.id))?.name).toBe('Client B edited');
    expect(await listLocalProjects()).toHaveLength(2);
  });

  it('supports folders, soft delete with restore, duplicate and permanent delete', async () => {
    const a = storedProject('Physio');
    await saveLocalProject(a);
    await updateProjectMeta(a.id, { folder: 'Acme Health' });

    const copy = await duplicateLocalProject(a.id);
    expect(copy.id).not.toBe(a.id);
    let list = await listLocalProjects();
    expect(list.find((p) => p.id === copy.id)?.folder).toBe('Acme Health');

    await softDeleteProject(a.id);
    list = await listLocalProjects();
    expect(list.map((p) => p.id)).not.toContain(a.id);
    await restoreProject(a.id);
    expect((await listLocalProjects()).map((p) => p.id)).toContain(a.id);

    await deleteLocalProject(a.id);
    expect(await loadLocalProject(a.id)).toBeNull();
    expect(await listLocalCheckpoints(a.id)).toHaveLength(0);
  });
});
