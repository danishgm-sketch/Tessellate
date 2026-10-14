import { create } from 'zustand';
import type { ResourceManifest } from '@tessellate/schemas';
import { setActiveCatalog } from '../mutations/replace.js';

export type LibraryStatus = 'idle' | 'loading' | 'ready' | 'error';

interface LibraryState {
  status: LibraryStatus;
  resources: ResourceManifest[];
  error: string | null;
  /** Loads the real resource catalogue once; replacement and gap filling rank against it. */
  load: (url?: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  status: 'idle',
  resources: [],
  error: null,
  load: async (url = '/data/catalog.json') => {
    if (get().status === 'loading' || get().status === 'ready') return;
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { resources?: ResourceManifest[] };
      const resources = Array.isArray(data.resources) ? data.resources : [];
      setActiveCatalog(resources);
      set({ status: 'ready', resources });
    } catch (err) {
      set({ status: 'error', error: `The resource library could not be loaded (${(err as Error).message}). Refresh to try again.` });
    }
  },
}));
