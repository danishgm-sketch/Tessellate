import { isResourceComposerEligible } from '@tessellate/compatibility';
import { ResourceManifestSchema, type ResourceManifest } from '@tessellate/schemas';

export type RuntimeCatalogStatus = 'idle' | 'loading' | 'ready' | 'error';

let activeCatalog: ResourceManifest[] = [];
let status: RuntimeCatalogStatus = 'idle';
let errorMessage: string | null = null;
let request: Promise<ResourceManifest[]> | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeRuntimeCatalog(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getRuntimeCatalogStatus(): RuntimeCatalogStatus {
  return status;
}

export function getRuntimeCatalogError(): string | null {
  return errorMessage;
}

export function setActiveCatalog(catalog: ResourceManifest[]): void {
  activeCatalog = catalog.filter(isResourceComposerEligible);
  status = 'ready';
  errorMessage = null;
  notify();
}

export function getAvailableResources(): ResourceManifest[] {
  return activeCatalog;
}

/** Load the catalogue only when an editor surface needs search or replacement metadata. */
export function loadActiveCatalog(): Promise<ResourceManifest[]> {
  if (status === 'ready') return Promise.resolve(activeCatalog);
  if (request) return request;

  status = 'loading';
  errorMessage = null;
  notify();
  request = fetch('/data/catalog.json')
    .then(async (response) => {
      if (!response.ok) throw new Error(`Catalogue HTTP ${response.status}`);
      const payload: unknown = await response.json();
      if (typeof payload !== 'object' || payload === null || !('resources' in payload)) {
        throw new Error('Catalogue response is missing its resources list.');
      }
      return ResourceManifestSchema.array().parse(payload.resources);
    })
    .then((catalog) => {
      setActiveCatalog(catalog);
      return activeCatalog;
    })
    .catch((error: unknown) => {
      status = 'error';
      errorMessage = error instanceof Error ? error.message : String(error);
      notify();
      throw error;
    })
    .finally(() => {
      request = null;
    });
  return request;
}
