import type { ProjectManifest } from '@tessellate/schemas';
import { hasExistingLocalProjectDatabase, listLocalProjects, loadLocalProject, saveLocalProject } from './storage.js';
import { safelyLoadProjectRecord } from './recovery.js';

export interface BrowserProjectLoad {
  manifest: ProjectManifest | null;
  damagedRecords: Array<{ raw: string; reason: string }>;
  storageWarnings: string[];
  migrated: boolean;
}

function storageFailureMessage(error: unknown, operation: 'read' | 'write'): string {
  const name = typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : '';
  if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED') {
    return 'The browser recovery journal storage is full.';
  }
  return operation === 'read'
    ? 'The browser recovery journal could not be read.'
    : 'The browser recovery journal could not be written.';
}

function recordProjectId(value: unknown): string | null {
  return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string'
    ? value.id
    : null;
}

interface BrowserJournalIdentity {
  version: string | null;
  project: string | null;
  active: string | null;
}

function readBrowserJournalIdentity(projectId: string): BrowserJournalIdentity | null {
  try {
    return {
      version: localStorage.getItem(`tessellate_journal_version_${projectId}`),
      project: localStorage.getItem(`tessellate_project_${projectId}`),
      active: localStorage.getItem('tessellate_active_project'),
    };
  } catch {
    return null;
  }
}

function createJournalGeneration(): string {
  return `v2:${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`;
}

/** Clear only journal bytes observed before this failed save or written by it. */
function invalidateBrowserProjectJournal(
  manifest: ProjectManifest,
  generation: string,
  previous: BrowserJournalIdentity | null
): boolean {
  if (!previous) return false;
  const projectId = manifest.id;
  const versionKey = `tessellate_journal_version_${projectId}`;
  const projectKey = `tessellate_project_${projectId}`;
  const attemptedJson = JSON.stringify(manifest);
  let complete = true;

  const versionStillBelongsToThisSave = () => {
    try {
      const current = localStorage.getItem(versionKey);
      return current === generation || current === previous.version;
    } catch {
      complete = false;
      return false;
    }
  };

  const belongsToProject = (raw: string): boolean => {
    if (raw === attemptedJson) return true;
    try {
      return recordProjectId(JSON.parse(raw)) === projectId;
    } catch {
      return false;
    }
  };

  const clearIfObserved = (key: string, previousRaw: string | null) => {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      complete = false;
      return;
    }
    if (!raw || !belongsToProject(raw)) return;
    // A distinct value is a later edit (or an unrecognised record); leave it intact.
    if (raw !== previousRaw && raw !== attemptedJson) return;
    if (!versionStillBelongsToThisSave()) return;
    try {
      localStorage.removeItem(key);
    } catch {
      complete = false;
    }
  };

  if (!versionStillBelongsToThisSave()) return true;
  clearIfObserved(projectKey, previous.project);
  clearIfObserved('tessellate_active_project', previous.active);

  try {
    const projectRaw = localStorage.getItem(projectKey);
    const activeRaw = localStorage.getItem('tessellate_active_project');
    const projectJournalRemains = [projectRaw, activeRaw]
      .some((raw) => raw !== null && belongsToProject(raw));
    if (!projectJournalRemains && versionStillBelongsToThisSave()) {
      localStorage.removeItem(versionKey);
    }
  } catch {
    complete = false;
  }

  return complete;
}

/** Validate both stores; the synchronous journal records the latest user intent,
 * including Undo to an older timestamp. Legacy stores use timestamp comparison. */
export async function loadBrowserProject(projectId?: string): Promise<BrowserProjectLoad> {
  const result: BrowserProjectLoad = {manifest:null, damagedRecords:[], storageWarnings:[], migrated:false};
  const addStorageWarning = (message: string) => {
    if (!result.storageWarnings.includes(message)) result.storageWarnings.push(message);
  };
  const addDamagedRecord = (raw: string, reason: string) => {
    if (!result.damagedRecords.some((record) => record.raw === raw && record.reason === reason)) {
      result.damagedRecords.push({ raw, reason });
    }
  };
  const migratedProjectIds = new Set<string>();
  try {
    const probeKey = `tessellate_storage_probe_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
  } catch (error) {
    addStorageWarning(storageFailureMessage(error, 'write'));
  }
  const candidates: ProjectManifest[] = [];
  let journal:ProjectManifest | null=null;
  const keys = projectId ? [`tessellate_project_${projectId}`, 'tessellate_active_project'] : ['tessellate_active_project'];
  for (const key of keys) {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch (error) {
      addStorageWarning(storageFailureMessage(error, 'read'));
      continue;
    }
    if (!raw) continue;
    let rawRecord: unknown;
    try {
      rawRecord = JSON.parse(raw);
    } catch (error) {
      // The shared active slot may belong to a different project. Its damaged
      // bytes must not force a requested, project-specific open into recovery.
      if (!projectId || key !== 'tessellate_active_project') addDamagedRecord(raw, String(error));
      continue;
    }
    if (projectId && key === 'tessellate_active_project' && recordProjectId(rawRecord) !== projectId) {
      continue;
    }
    try {
      const record = safelyLoadProjectRecord(rawRecord);
      if (record.status === 'corrupted') addDamagedRecord(raw, record.validationIssues.join('; '));
      else if (!projectId || record.manifest.id === projectId) {
        if (record.status === 'recovered') migratedProjectIds.add(record.manifest.id);
        candidates.push(record.manifest);
        try {
          if (localStorage.getItem(`tessellate_journal_version_${record.manifest.id}`)) journal ??=record.manifest;
        } catch (error) {
          addStorageWarning(storageFailureMessage(error, 'read'));
        }
      }
    } catch (error) {
      if (!projectId || key !== 'tessellate_active_project' || recordProjectId(rawRecord) === projectId) {
        addDamagedRecord(raw, String(error));
      }
    }
  }
  let id = projectId ?? candidates[0]?.id;
  if (!id) {
    try {
      const databaseExists = await hasExistingLocalProjectDatabase();
      if (databaseExists !== false) {
        const projects = await listLocalProjects();
        id = projects.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0]?.id;
      }
    } catch {
      addStorageWarning('The local project database could not be listed.');
    }
  }
  if (id) {
    let stored: ProjectManifest | null;
    try {
      stored = await loadLocalProject(id);
    } catch {
      stored = null;
      addStorageWarning('The local project database could not be read; the browser recovery journal will be used when available.');
    }
    if (stored) {
      const record = safelyLoadProjectRecord(stored);
      if (record.status === 'corrupted') addDamagedRecord(JSON.stringify(stored), record.validationIssues.join('; '));
      else {
        if (record.status === 'recovered') migratedProjectIds.add(record.manifest.id);
        candidates.push(record.manifest);
      }
    }
  }
  candidates.sort((a,b) => Date.parse(b.updatedAt)-Date.parse(a.updatedAt) || b.historyMeta.headRevision-a.historyMeta.headRevision);
  result.manifest = journal ?? candidates[0] ?? null;
  result.migrated = Boolean(result.manifest && migratedProjectIds.has(result.manifest.id));
  if (result.migrated) addStorageWarning('Older project data was upgraded to the current schema.');
  if (result.manifest && result.storageWarnings.length > 0 && candidates.length > 0 && !journal) {
    if (!result.storageWarnings.some((warning) => warning.includes('local database'))) {
      result.storageWarnings.push('The project was restored from local database storage.');
    }
  }
  return result;
}

/** Synchronous browser journal protects edits even when reload interrupts IndexedDB. */
export function journalBrowserProject(manifest: ProjectManifest, generation = createJournalGeneration()): string {
  const json = JSON.stringify(manifest);
  localStorage.setItem(`tessellate_project_${manifest.id}`, json);
  localStorage.setItem('tessellate_active_project', json);
  // Commit the generation last so interrupted writes keep the previous marker.
  localStorage.setItem(`tessellate_journal_version_${manifest.id}`, generation);
  return generation;
}

export function createProjectSaver(onWarning: (warning: string, undoHistoryAvailable: boolean) => void) {
  let queue = Promise.resolve();
  return (manifest: ProjectManifest) => {
    const previousJournal = readBrowserJournalIdentity(manifest.id);
    const generation = createJournalGeneration();
    let journalError: unknown;
    try { journalBrowserProject(manifest, generation); } catch(error) { journalError = error; }
    queue = queue.then(async () => {
      try {
        const mode = await saveLocalProject(manifest);
        if (mode === 'memory') {
          if (journalError) {
            onWarning('The project could not be saved to browser storage. Export the manifest before closing this tab.', false);
          } else {
            onWarning('IndexedDB is unavailable. The project is saved in the browser recovery journal, but undo history will not survive a reload.', false);
          }
        } else if (journalError) {
          const journalCleared = invalidateBrowserProjectJournal(manifest, generation, previousJournal);
          onWarning(
            journalCleared
              ? `${storageFailureMessage(journalError, 'write')} The project was saved to local database storage.`
              : `${storageFailureMessage(journalError, 'write')} The project was saved to local database storage, but an older recovery copy could not be removed. Export the current manifest before closing this tab.`,
            true
          );
        }
      } catch {
        if (journalError) {
          onWarning('The project could not be saved to browser storage. Export the manifest before closing this tab.', false);
        } else {
          onWarning('IndexedDB is unavailable. The browser recovery journal has the current project, but undo history may not survive a reload.', false);
        }
      }
    });
    return queue;
  };
}
