import type { ProjectManifest } from '@tessellate/schemas';
import { loadLocalProject, saveLocalProject } from './storage.js';
import { safelyLoadProjectRecord } from './recovery.js';

export interface BrowserProjectLoad {
  manifest: ProjectManifest | null;
  damagedRecords: Array<{ raw: string; reason: string }>;
}

/** Validate both stores and choose the newest valid revision; retain damaged records. */
export async function loadBrowserProject(projectId?: string): Promise<BrowserProjectLoad> {
  const result: BrowserProjectLoad = {manifest:null, damagedRecords:[]};
  const candidates: ProjectManifest[] = [];
  const keys = projectId ? [`tessellate_project_${projectId}`, 'tessellate_active_project'] : ['tessellate_active_project'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const record = safelyLoadProjectRecord(JSON.parse(raw));
      if (record.status === 'corrupted') result.damagedRecords.push({raw, reason: record.validationIssues.join('; ')});
      else if (!projectId || record.manifest.id === projectId) candidates.push(record.manifest);
    } catch (error) {
      result.damagedRecords.push({raw, reason:String(error)});
    }
  }
  const id = projectId ?? candidates[0]?.id;
  if (id) {
    const stored = await loadLocalProject(id);
    if (stored) {
      const record = safelyLoadProjectRecord(stored);
      if (record.status === 'corrupted') result.damagedRecords.push({raw: JSON.stringify(stored), reason:record.validationIssues.join('; ')});
      else candidates.push(record.manifest);
    }
  }
  candidates.sort((a,b) => Date.parse(b.updatedAt)-Date.parse(a.updatedAt) || b.historyMeta.headRevision-a.historyMeta.headRevision);
  result.manifest = candidates[0] ?? null;
  return result;
}

/** Synchronous browser journal protects edits even when reload interrupts IndexedDB. */
export function journalBrowserProject(manifest: ProjectManifest): void {
  const json = JSON.stringify(manifest);
  localStorage.setItem(`tessellate_project_${manifest.id}`, json);
  localStorage.setItem('tessellate_active_project', json);
}

export function createProjectSaver(onError: (error: unknown) => void) {
  let queue = Promise.resolve();
  return (manifest: ProjectManifest) => {
    try { journalBrowserProject(manifest); } catch(error) { onError(error); }
    queue = queue.then(() => saveLocalProject(manifest)).catch(onError);
    return queue;
  };
}
