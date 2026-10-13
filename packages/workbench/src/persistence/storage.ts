import type { ProjectManifest } from '@tessellate/schemas';
import type { Checkpoint } from '../history/checkpoints.js';

const DB_NAME = 'tessellate-local-db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_CHECKPOINTS = 'checkpoints';

// In-memory fallback for test and non-browser/SSR environments
const memoryProjects = new Map<string, ProjectManifest>();
const memoryCheckpoints = new Map<string, Checkpoint & { projectId: string }>();

function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      reject(new Error('IndexedDB not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CHECKPOINTS)) {
        const chkStore = db.createObjectStore(STORE_CHECKPOINTS, { keyPath: 'id' });
        chkStore.createIndex('projectId', 'projectId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates a project manifest in local IndexedDB (or fallback).
 */
export async function saveLocalProject(manifest: ProjectManifest): Promise<void> {
  if (!hasIndexedDB()) {
    memoryProjects.set(manifest.id, JSON.parse(JSON.stringify(manifest)));
    return;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = tx.objectStore(STORE_PROJECTS);
    const req = store.put(JSON.parse(JSON.stringify(manifest)));

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Loads a project manifest from local storage by ID.
 */
export async function loadLocalProject(id: string): Promise<ProjectManifest | null> {
  if (!hasIndexedDB()) {
    const found = memoryProjects.get(id);
    return found ? (JSON.parse(JSON.stringify(found)) as ProjectManifest) : null;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readonly');
    const store = tx.objectStore(STORE_PROJECTS);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result ? (req.result as ProjectManifest) : null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Lists all stored project summaries.
 */
export async function listLocalProjects(): Promise<Array<{ id: string; name: string; updatedAt: string }>> {
  if (!hasIndexedDB()) {
    return Array.from(memoryProjects.values()).map((p) => ({
      id: p.id,
      name: p.name,
      updatedAt: p.updatedAt,
    }));
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readonly');
    const store = tx.objectStore(STORE_PROJECTS);
    const req = store.getAll();

    req.onsuccess = () => {
      const projects = (req.result || []) as ProjectManifest[];
      resolve(
        projects.map((p) => ({
          id: p.id,
          name: p.name,
          updatedAt: p.updatedAt,
        }))
      );
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Deletes a project and its checkpoints from local storage.
 */
export async function deleteLocalProject(id: string): Promise<void> {
  if (!hasIndexedDB()) {
    memoryProjects.delete(id);
    for (const [k, chk] of memoryCheckpoints) {
      if (chk.projectId === id) memoryCheckpoints.delete(k);
    }
    return;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROJECTS, STORE_CHECKPOINTS], 'readwrite');
    tx.objectStore(STORE_PROJECTS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Persists a durable local checkpoint associated with a project.
 */
export async function saveLocalCheckpoint(
  projectId: string,
  checkpoint: Checkpoint
): Promise<void> {
  const item = { ...JSON.parse(JSON.stringify(checkpoint)), projectId };

  if (!hasIndexedDB()) {
    memoryCheckpoints.set(checkpoint.id, item);
    return;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHECKPOINTS, 'readwrite');
    const store = tx.objectStore(STORE_CHECKPOINTS);
    const req = store.put(item);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Lists all durable local checkpoints for a given project.
 */
export async function listLocalCheckpoints(projectId: string): Promise<Checkpoint[]> {
  if (!hasIndexedDB()) {
    return Array.from(memoryCheckpoints.values()).filter((c) => c.projectId === projectId);
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CHECKPOINTS, 'readonly');
    const store = tx.objectStore(STORE_CHECKPOINTS);
    const index = store.index('projectId');
    const req = index.getAll(projectId);

    req.onsuccess = () => resolve((req.result || []) as Checkpoint[]);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clears local test memory stores.
 */
export function clearLocalMemoryStorage(): void {
  memoryProjects.clear();
  memoryCheckpoints.clear();
}
