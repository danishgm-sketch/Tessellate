import { ProjectManifestSchema, type ProjectManifest } from '@tessellate/schemas';
import type { Checkpoint } from '../history/checkpoints.js';
import { z } from 'zod';

const DB_NAME = 'tessellate-local-db';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_CHECKPOINTS = 'checkpoints';
const STORE_HISTORY = 'history';
const HISTORY_LIMIT = 50;

const historyPointerSchema = z.object({
  key: z.string(),
  projectId: z.string().min(1),
  kind: z.literal('stack'),
  schemaVersion: z.literal(1),
  currentId: z.string().min(1),
  historyIds: z.array(z.string().min(1)).max(HISTORY_LIMIT),
  futureIds: z.array(z.string().min(1)).max(HISTORY_LIMIT),
}).strict();
const historySnapshotSchema = z.object({
  key: z.string(),
  projectId: z.string().min(1),
  kind: z.literal('snapshot'),
  manifest: ProjectManifestSchema,
}).strict();

export interface LocalHistoryState {
  history: ProjectManifest[];
  future: ProjectManifest[];
}

interface HistoryPointer {
  key: string;
  projectId: string;
  kind: 'stack';
  schemaVersion: 1;
  currentId: string;
  historyIds: string[];
  futureIds: string[];
}

interface MemoryHistoryState {
  pointer: HistoryPointer;
  snapshots: Map<string, ProjectManifest>;
}

// In-memory fallback for test and non-browser/SSR environments
const memoryProjects = new Map<string, ProjectManifest>();
const memoryCheckpoints = new Map<string, Checkpoint & { projectId: string }>();
const memoryHistory = new Map<string, MemoryHistoryState>();
const historySnapshotIds = new WeakMap<ProjectManifest, Map<string, string>>();
const persistedHistoryIds = new Map<string, Set<string>>();
const historyWriteQueues = new Map<string, Promise<void>>();
let nextHistorySnapshotId = 1;

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
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const historyStore = db.createObjectStore(STORE_HISTORY, { keyPath: 'key' });
        historyStore.createIndex('projectId', 'projectId', { unique: false });
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

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Local project transaction aborted.')); };
    tx.onerror = () => { db.close(); reject(tx.error); };
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
    tx.oncomplete = () => db.close();
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
    memoryHistory.delete(id);
    return;
  }

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROJECTS, STORE_CHECKPOINTS, STORE_HISTORY], 'readwrite');
    tx.objectStore(STORE_PROJECTS).delete(id);
    for (const storeName of [STORE_CHECKPOINTS, STORE_HISTORY]) {
      const store = tx.objectStore(storeName);
      const request = store.index('projectId').getAllKeys(id);
      request.onsuccess = () => {
        for (const key of request.result) store.delete(key);
      };
      request.onerror = () => tx.abort();
    }
    tx.oncomplete = () => { persistedHistoryIds.delete(id); db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Local project deletion transaction aborted.')); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

function idForHistorySnapshot(projectId: string, manifest: ProjectManifest): string {
  const idsByProject = historySnapshotIds.get(manifest);
  const existing = idsByProject?.get(projectId);
  if (existing) return existing;
  const id = `${projectId}:history-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${nextHistorySnapshotId++}`}`;
  const updatedIds = idsByProject ?? new Map<string, string>();
  updatedIds.set(projectId, id);
  if (!idsByProject) historySnapshotIds.set(manifest, updatedIds);
  return id;
}

function rememberHistorySnapshotId(projectId: string, manifest: ProjectManifest, id: string): void {
  const idsByProject = historySnapshotIds.get(manifest) ?? new Map<string, string>();
  idsByProject.set(projectId, id);
  historySnapshotIds.set(manifest, idsByProject);
}

function cloneManifest(manifest: ProjectManifest): ProjectManifest {
  return JSON.parse(JSON.stringify(manifest)) as ProjectManifest;
}

function makeHistoryPointer(
  projectId: string,
  manifest: ProjectManifest,
  history: ProjectManifest[],
  future: ProjectManifest[]
): HistoryPointer {
  if (history.length > HISTORY_LIMIT || future.length > HISTORY_LIMIT) {
    throw new Error(`Local undo history exceeds the supported ${HISTORY_LIMIT}-step limit.`);
  }
  return historyPointerSchema.parse({
    key: `${projectId}:stack`,
    projectId,
    kind: 'stack',
    schemaVersion: 1,
    currentId: idForHistorySnapshot(projectId, manifest),
    historyIds: history.map((snapshot) => idForHistorySnapshot(projectId, snapshot)),
    futureIds: future.map((snapshot) => idForHistorySnapshot(projectId, snapshot)),
  });
}

/**
 * Stores the bounded undo/redo stack as immutable IndexedDB snapshots plus a small pointer.
 * A new edit writes only its new manifest snapshot and the stack pointer, rather than
 * rewriting every retained project snapshot on each keystroke.
 */
export function saveLocalHistoryState(
  projectId: string,
  manifest: ProjectManifest,
  history: ProjectManifest[],
  future: ProjectManifest[]
): Promise<void> {
  const previous = historyWriteQueues.get(projectId) ?? Promise.resolve();
  const queued = previous.catch(() => undefined).then(() => persistLocalHistoryState(projectId, manifest, history, future));
  historyWriteQueues.set(projectId, queued);
  void queued.finally(() => {
    if (historyWriteQueues.get(projectId) === queued) historyWriteQueues.delete(projectId);
  }).catch(() => undefined);
  return queued;
}

async function persistLocalHistoryState(
  projectId: string,
  manifest: ProjectManifest,
  history: ProjectManifest[],
  future: ProjectManifest[]
): Promise<void> {
  const pointer = makeHistoryPointer(projectId, manifest, history, future);
  const manifests = new Map<string, ProjectManifest>();
  for (const snapshot of [manifest, ...history, ...future]) {
    manifests.set(idForHistorySnapshot(projectId, snapshot), snapshot);
  }

  if (!hasIndexedDB()) {
    const previousState = memoryHistory.get(projectId);
    const snapshots = previousState?.snapshots ?? new Map<string, ProjectManifest>();
    for (const [id, snapshot] of manifests) snapshots.set(id, cloneManifest(snapshot));
    const keep = new Set([pointer.currentId, ...pointer.historyIds, ...pointer.futureIds]);
    for (const id of snapshots.keys()) if (!keep.has(id)) snapshots.delete(id);
    memoryHistory.set(projectId, { pointer, snapshots });
    return;
  }

  const db = await openDB();
  const previouslyPersisted = persistedHistoryIds.get(projectId) ?? new Set<string>();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_HISTORY, 'readwrite');
    const store = tx.objectStore(STORE_HISTORY);
    for (const [id, snapshot] of manifests) {
      if (previouslyPersisted.has(id)) continue;
      store.put({ key: id, projectId, kind: 'snapshot', manifest: cloneManifest(snapshot) });
    }
    store.put(pointer);

    const keep = new Set([pointer.key, pointer.currentId, ...pointer.historyIds, ...pointer.futureIds]);
    const recordsRequest = store.index('projectId').getAll(projectId);
    recordsRequest.onsuccess = () => {
      for (const record of recordsRequest.result as Array<{ key: string }>) {
        if (!keep.has(record.key)) store.delete(record.key);
      }
    };
    recordsRequest.onerror = () => tx.abort();

    tx.oncomplete = () => {
      const persisted = new Set([...keep].filter((key) => key !== pointer.key));
      persistedHistoryIds.set(projectId, persisted);
      db.close();
      resolve();
    };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Local undo history transaction aborted.')); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/** Loads and validates all snapshots referenced by a project's persisted undo/redo stack. */
export async function loadLocalHistoryState(projectId: string): Promise<LocalHistoryState | null> {
  if (!hasIndexedDB()) {
    const stored = memoryHistory.get(projectId);
    if (!stored) return null;
    const pointer = historyPointerSchema.parse(stored.pointer);
    const ids = new Set([pointer.currentId, ...pointer.historyIds, ...pointer.futureIds]);
    const snapshots = new Map<string, ProjectManifest>();
    for (const id of ids) {
      const manifest = stored.snapshots.get(id);
      if (!manifest) throw new Error(`Undo history snapshot ${id} is missing; the project was preserved.`);
      const parsed = ProjectManifestSchema.parse(cloneManifest(manifest));
      snapshots.set(id, parsed);
      rememberHistorySnapshotId(projectId, snapshots.get(id)!, id);
    }
    return {
      history: pointer.historyIds.map((id) => snapshots.get(id)!),
      future: pointer.futureIds.map((id) => snapshots.get(id)!),
    };
  }

  const db = await openDB();
  const result = await new Promise<{ pointer: unknown; records: unknown[] }>((resolve, reject) => {
    const tx = db.transaction(STORE_HISTORY, 'readonly');
    const store = tx.objectStore(STORE_HISTORY);
    const pointerRequest = store.get(`${projectId}:stack`);
    const recordsRequest = store.index('projectId').getAll(projectId);
    let pointer: unknown;
    let records: unknown[];
    let pointerReady = false;
    let recordsReady = false;
    const finish = () => {
      if (pointerReady && recordsReady) resolve({ pointer, records });
    };
    pointerRequest.onsuccess = () => { pointer = pointerRequest.result; pointerReady = true; finish(); };
    recordsRequest.onsuccess = () => { records = recordsRequest.result as unknown[]; recordsReady = true; finish(); };
    pointerRequest.onerror = () => reject(pointerRequest.error);
    recordsRequest.onerror = () => reject(recordsRequest.error);
    tx.oncomplete = () => db.close();
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Local undo history read transaction aborted.')); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });

  if (!result.pointer) return null;
  const pointer = historyPointerSchema.parse(result.pointer);
  if (pointer.projectId !== projectId) throw new Error('Undo history belongs to a different project.');
  const records = new Map<string, ProjectManifest>();
  for (const value of result.records) {
    if (typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'stack') continue;
    const record = historySnapshotSchema.parse(value);
    if (record.projectId !== projectId) throw new Error('An undo history snapshot belongs to a different project.');
    records.set(record.key, record.manifest);
  }

  const ids = new Set([pointer.currentId, ...pointer.historyIds, ...pointer.futureIds]);
  const persisted = new Set<string>();
  for (const id of ids) {
    const snapshot = records.get(id);
    if (!snapshot) throw new Error(`Undo history snapshot ${id} is missing; the project was preserved.`);
    rememberHistorySnapshotId(projectId, snapshot, id);
    persisted.add(id);
  }
  persistedHistoryIds.set(projectId, persisted);
  return {
    history: pointer.historyIds.map((id) => records.get(id)!),
    future: pointer.futureIds.map((id) => records.get(id)!),
  };
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

    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error ?? new Error('Local checkpoint transaction aborted.')); };
    tx.onerror = () => { db.close(); reject(tx.error); };
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
  memoryHistory.clear();
  persistedHistoryIds.clear();
}
