import type { ProjectManifest } from '@tessellate/schemas';
import type { Checkpoint } from '../history/checkpoints.js';

const DB_NAME = 'tessellate-local-db';
/** v2 adds the projectMeta store (client folders, soft delete, last opened). */
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_CHECKPOINTS = 'checkpoints';
const STORE_META = 'projectMeta';

/** Workspace metadata kept beside (not inside) the exportable manifest. */
export interface ProjectMeta {
  id: string;
  /** Client / folder name used to group projects on the dashboard. */
  folder?: string;
  /** Soft-delete marker; deleted projects stay restorable until purged. */
  deletedAt?: string;
  lastOpenedAt?: string;
}

export interface LocalProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  screenCount: number;
  archetype?: string;
  folder?: string;
  deletedAt?: string;
  lastOpenedAt?: string;
}

// In-memory fallback for test and non-browser/SSR environments
const memoryProjects = new Map<string, ProjectManifest>();
const memoryCheckpoints = new Map<string, Checkpoint & { projectId: string }>();
const memoryMeta = new Map<string, ProjectMeta>();

function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Collision-free project identifier (D-025 data safety: never derive IDs from constant seeds). */
export function newProjectId(): string {
  const uuid =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  return `proj-${uuid}`;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!hasIndexedDB()) return Promise.reject(new Error('IndexedDB not supported in this environment.'));
  dbPromise ??= new Promise((resolve, reject) => {
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
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
    request.onblocked = () => {
      dbPromise = null;
      reject(new Error('Local storage is blocked by another open Tessellate tab. Close other tabs and reload.'));
    };
  });
  return dbPromise;
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

/**
 * Saves or updates a project manifest in local IndexedDB (or fallback).
 */
export async function saveLocalProject(manifest: ProjectManifest): Promise<void> {
  if (!hasIndexedDB()) {
    memoryProjects.set(manifest.id, clone(manifest));
    return;
  }
  const db = await openDB();
  const tx = db.transaction(STORE_PROJECTS, 'readwrite');
  tx.objectStore(STORE_PROJECTS).put(clone(manifest));
  await txDone(tx);
}

/**
 * Loads a project manifest from local storage by ID.
 */
export async function loadLocalProject(id: string): Promise<ProjectManifest | null> {
  if (!hasIndexedDB()) {
    const found = memoryProjects.get(id);
    return found ? clone(found) : null;
  }
  const db = await openDB();
  const result = await requestToPromise(db.transaction(STORE_PROJECTS, 'readonly').objectStore(STORE_PROJECTS).get(id));
  return result ? (result as ProjectManifest) : null;
}

async function getAllMeta(): Promise<Map<string, ProjectMeta>> {
  if (!hasIndexedDB()) return new Map([...memoryMeta].map(([k, v]) => [k, clone(v)]));
  const db = await openDB();
  const all = (await requestToPromise(db.transaction(STORE_META, 'readonly').objectStore(STORE_META).getAll())) as ProjectMeta[];
  return new Map(all.map((m) => [m.id, m]));
}

export async function getProjectMeta(id: string): Promise<ProjectMeta> {
  if (!hasIndexedDB()) return clone(memoryMeta.get(id) ?? { id });
  const db = await openDB();
  const found = (await requestToPromise(db.transaction(STORE_META, 'readonly').objectStore(STORE_META).get(id))) as ProjectMeta | undefined;
  return found ?? { id };
}

/** Merges workspace metadata for a project (folder, soft delete, last opened). */
export async function updateProjectMeta(id: string, patch: Partial<Omit<ProjectMeta, 'id'>>): Promise<ProjectMeta> {
  const next: ProjectMeta = { ...(await getProjectMeta(id)), ...patch, id };
  for (const key of Object.keys(next) as Array<keyof ProjectMeta>) {
    if (next[key] === undefined) delete next[key];
  }
  if (!hasIndexedDB()) {
    memoryMeta.set(id, clone(next));
    return next;
  }
  const db = await openDB();
  const tx = db.transaction(STORE_META, 'readwrite');
  tx.objectStore(STORE_META).put(next);
  await txDone(tx);
  return next;
}

/**
 * Lists stored project summaries, newest first. Soft-deleted projects are excluded unless requested.
 */
export async function listLocalProjects(options: { includeDeleted?: boolean } = {}): Promise<LocalProjectSummary[]> {
  let projects: ProjectManifest[];
  if (!hasIndexedDB()) {
    projects = Array.from(memoryProjects.values());
  } else {
    const db = await openDB();
    projects = ((await requestToPromise(db.transaction(STORE_PROJECTS, 'readonly').objectStore(STORE_PROJECTS).getAll())) ?? []) as ProjectManifest[];
  }
  const meta = await getAllMeta();
  return projects
    .map((p) => {
      const m = meta.get(p.id);
      return {
        id: p.id,
        name: p.name,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        screenCount: p.screens?.length ?? 0,
        archetype: p.productModel?.productArchetypes?.[0]?.tag,
        folder: m?.folder,
        deletedAt: m?.deletedAt,
        lastOpenedAt: m?.lastOpenedAt,
      };
    })
    .filter((p) => options.includeDeleted || !p.deletedAt)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

/** Soft delete: hides the project but keeps it restorable (undo). */
export async function softDeleteProject(id: string): Promise<void> {
  await updateProjectMeta(id, { deletedAt: new Date().toISOString() });
}

export async function restoreProject(id: string): Promise<void> {
  await updateProjectMeta(id, { deletedAt: undefined });
}

/**
 * Permanently deletes a project, its checkpoints and its metadata from local storage.
 */
export async function deleteLocalProject(id: string): Promise<void> {
  if (!hasIndexedDB()) {
    memoryProjects.delete(id);
    memoryMeta.delete(id);
    for (const [k, chk] of memoryCheckpoints) {
      if (chk.projectId === id) memoryCheckpoints.delete(k);
    }
    return;
  }

  const db = await openDB();
  const tx = db.transaction([STORE_PROJECTS, STORE_CHECKPOINTS, STORE_META], 'readwrite');
  tx.objectStore(STORE_PROJECTS).delete(id);
  tx.objectStore(STORE_META).delete(id);
  const index = tx.objectStore(STORE_CHECKPOINTS).index('projectId');
  const keys = await requestToPromise(index.getAllKeys(id));
  for (const key of keys) tx.objectStore(STORE_CHECKPOINTS).delete(key);
  await txDone(tx);
}

/** Permanently removes soft-deleted projects older than the given age. */
export async function purgeDeletedProjects(olderThanMs = 30 * 24 * 60 * 60 * 1000): Promise<number> {
  const cutoff = Date.now() - olderThanMs;
  const deleted = (await listLocalProjects({ includeDeleted: true })).filter(
    (p) => p.deletedAt && Date.parse(p.deletedAt) <= cutoff,
  );
  for (const p of deleted) await deleteLocalProject(p.id);
  return deleted.length;
}

/**
 * Copies a project under a new, unique ID (checkpoint history is not copied).
 */
export async function duplicateLocalProject(id: string, name?: string): Promise<ProjectManifest> {
  const source = await loadLocalProject(id);
  if (!source) throw new Error('The project to duplicate no longer exists.');
  const now = new Date().toISOString();
  const copy: ProjectManifest = { ...clone(source), id: newProjectId(), name: name ?? `${source.name} (copy)`, createdAt: now, updatedAt: now };
  await saveLocalProject(copy);
  const meta = await getProjectMeta(id);
  if (meta.folder) await updateProjectMeta(copy.id, { folder: meta.folder });
  return copy;
}

/**
 * Persists a durable local checkpoint associated with a project.
 */
export async function saveLocalCheckpoint(
  projectId: string,
  checkpoint: Checkpoint
): Promise<void> {
  const item = { ...clone(checkpoint), projectId };

  if (!hasIndexedDB()) {
    memoryCheckpoints.set(checkpoint.id, item);
    return;
  }
  const db = await openDB();
  const tx = db.transaction(STORE_CHECKPOINTS, 'readwrite');
  tx.objectStore(STORE_CHECKPOINTS).put(item);
  await txDone(tx);
}

/**
 * Lists all durable local checkpoints for a given project, newest first.
 */
export async function listLocalCheckpoints(projectId: string): Promise<Checkpoint[]> {
  let items: Checkpoint[];
  if (!hasIndexedDB()) {
    items = Array.from(memoryCheckpoints.values()).filter((c) => c.projectId === projectId);
  } else {
    const db = await openDB();
    const index = db.transaction(STORE_CHECKPOINTS, 'readonly').objectStore(STORE_CHECKPOINTS).index('projectId');
    items = ((await requestToPromise(index.getAll(projectId))) ?? []) as Checkpoint[];
  }
  return items.sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''));
}

/**
 * Clears local test memory stores.
 */
export function clearLocalMemoryStorage(): void {
  memoryProjects.clear();
  memoryCheckpoints.clear();
  memoryMeta.clear();
}
