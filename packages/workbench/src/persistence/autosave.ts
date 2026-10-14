import type { StoreApi, UseBoundStore } from 'zustand';
import type { WorkbenchState } from '../types.js';
import { saveLocalCheckpoint, saveLocalProject, updateProjectMeta } from './storage.js';

export interface AutosaveOptions {
  debounceMs?: number;
}

/**
 * Persists the open project to IndexedDB as the user works (local-first source of truth).
 * Manifest changes are debounced; new checkpoints are written immediately; pending work is
 * flushed when the page is hidden so closing a tab never loses edits.
 *
 * Returns a function that stops autosave after flushing pending changes.
 */
export function startProjectAutosave(
  store: UseBoundStore<StoreApi<WorkbenchState>>,
  options: AutosaveOptions = {},
): () => Promise<void> {
  const debounceMs = options.debounceMs ?? 400;
  const savedCheckpointIds = new Set(store.getState().checkpoints.map((c) => c.id));
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Promise<void> = Promise.resolve();
  let dirty = false;

  const flush = async () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (!dirty) return pending;
    dirty = false;
    const { manifest, persistenceEnabled, setSaveState } = store.getState();
    if (!persistenceEnabled) return pending;

    setSaveState({ status: 'saving' });
    const at = new Date().toISOString();
    pending = pending
      .then(() => saveLocalProject({ ...manifest, updatedAt: at }))
      .then(() => {
        store.getState().setSaveState({ status: 'saved', lastSavedAt: at });
      })
      .catch((err: unknown) => {
        dirty = true; // retry on the next change or flush
        store.getState().setSaveState({
          status: 'error',
          error: err instanceof Error ? err.message : 'Could not save to this browser.',
        });
      });
    return pending;
  };

  const schedule = () => {
    dirty = true;
    // Show unsaved state immediately so the UI never claims "saved" while a write is pending.
    if (store.getState().saveState.status !== 'pending') store.getState().setSaveState({ status: 'pending' });
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void flush(), debounceMs);
  };

  const unsubscribe = store.subscribe((state, prev) => {
    if (!state.persistenceEnabled) return;

    // Opening a different project: remember its stored checkpoints, nothing to save yet.
    if (state.manifest.id !== prev.manifest.id || (state.persistenceEnabled && !prev.persistenceEnabled)) {
      savedCheckpointIds.clear();
      for (const c of state.checkpoints) savedCheckpointIds.add(c.id);
      void updateProjectMeta(state.manifest.id, { lastOpenedAt: new Date().toISOString() });
      // Persist the initial "Opened" checkpoint if the project had none stored.
      for (const c of state.checkpoints) {
        if (c.trigger === 'initial-generation' && c.name === 'Opened') void saveLocalCheckpoint(state.manifest.id, c);
      }
      return;
    }

    if (state.manifest !== prev.manifest) schedule();

    if (state.checkpoints !== prev.checkpoints) {
      for (const c of state.checkpoints) {
        if (savedCheckpointIds.has(c.id)) continue;
        savedCheckpointIds.add(c.id);
        void saveLocalCheckpoint(state.manifest.id, c).catch(() => {
          savedCheckpointIds.delete(c.id);
        });
      }
    }
  });

  const onHide = () => {
    if (typeof document === 'undefined' || document.visibilityState === 'hidden') void flush();
  };
  // A write started during unload may not finish, so warn while work is unsaved.
  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    const status = store.getState().saveState.status;
    if (dirty || status === 'pending' || status === 'saving') {
      void flush();
      e.preventDefault();
      e.returnValue = '';
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', onHide);
  }

  return async () => {
    unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('visibilitychange', onHide);
    }
    await flush();
  };
}
