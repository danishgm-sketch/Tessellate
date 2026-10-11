import { describe, it, expect, beforeEach } from 'vitest';
import { createSampleProject } from '../store/sample-project.js';
import {
  saveLocalProject,
  loadLocalProject,
  listLocalProjects,
  deleteLocalProject,
  saveLocalCheckpoint,
  listLocalCheckpoints,
  clearLocalMemoryStorage,
} from '../persistence/storage.js';
import { safelyLoadProjectRecord } from '../persistence/recovery.js';
import { createCheckpoint } from '../history/checkpoints.js';
import { executeMutation } from '../mutations/executor.js';
import type { ProjectMutation } from '@tessellate/schemas';

describe('Phase 11: Local Persistence & Recovery Gate', () => {
  beforeEach(() => {
    clearLocalMemoryStorage();
  });

  it('Phase 11 Gate: Anonymous user can create/edit/reload/export a project without any backend API', async () => {
    // 1. Create project anonymously
    const initialManifest = createSampleProject();
    expect(initialManifest.id).toBeDefined();

    // 2. Perform local edits (mutations)
    const renameMutation: ProjectMutation = {
      id: 'mut-rename',
      type: 'SET_PROP',
      targetId: 'node-header',
      payload: {
        prop: 'title',
        value: 'Anonymous Offline Workspace',
      },
      actor: 'user',
      timestamp: new Date().toISOString(),
      preconditionRevision: initialManifest.historyMeta.headRevision,
    };
    const { nextManifest } = executeMutation(initialManifest, renameMutation);
    expect(nextManifest.historyMeta.headRevision).toBe(initialManifest.historyMeta.headRevision + 1);

    // 3. Save local checkpoint
    const checkpoint = createCheckpoint(nextManifest, {
      name: 'offline-checkpoint',
      trigger: 'manual',
    });
    await saveLocalCheckpoint(nextManifest.id, checkpoint);

    const savedCheckpoints = await listLocalCheckpoints(nextManifest.id);
    expect(savedCheckpoints).toHaveLength(1);
    expect(savedCheckpoints[0]?.name).toBe('offline-checkpoint');

    // 4. Save project to local storage
    await saveLocalProject(nextManifest);

    const list = await listLocalProjects();
    expect(list.some((p) => p.id === nextManifest.id)).toBe(true);

    // 5. Reload project from storage without any network/backend
    const reloaded = await loadLocalProject(nextManifest.id);
    expect(reloaded).not.toBeNull();
    expect(reloaded?.id).toBe(nextManifest.id);
    expect(reloaded?.historyMeta.headRevision).toBe(nextManifest.historyMeta.headRevision);

    const headerNode = reloaded?.screens[0]?.rootNode.children.find((c) => c.id === 'node-header');
    expect(headerNode?.props['title']).toBe('Anonymous Offline Workspace');

    // 6. Export reloaded project to raw JSON without network
    const exportedJson = JSON.stringify(reloaded, null, 2);
    expect(exportedJson).toContain('Anonymous Offline Workspace');
    const parsed = JSON.parse(exportedJson);
    expect(parsed.id).toBe(nextManifest.id);
  });

  it('supports listing and deleting stored projects and associated checkpoints', async () => {
    const p1 = createSampleProject();
    const p2 = { ...createSampleProject(), id: 'proj-two', name: 'Second Project' };

    await saveLocalProject(p1);
    await saveLocalProject(p2);

    let list = await listLocalProjects();
    expect(list).toHaveLength(2);

    const chk = createCheckpoint(p1, { name: 'p1-chk', trigger: 'manual' });
    await saveLocalCheckpoint(p1.id, chk);
    expect(await listLocalCheckpoints(p1.id)).toHaveLength(1);

    await deleteLocalProject(p1.id);

    list = await listLocalProjects();
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe('proj-two');
    expect(await listLocalCheckpoints(p1.id)).toHaveLength(0);
  });

  describe('Recovery Mode', () => {
    it('returns status "valid" for compliant manifests', () => {
      const manifest = createSampleProject();
      const result = safelyLoadProjectRecord(manifest);
      expect(result.status).toBe('valid');
      if (result.status === 'valid') {
        expect(result.manifest.id).toBe(manifest.id);
      }
    });

    it('returns status "corrupted", preserves rawRecord, and provides exportRawJson for unparseable data', () => {
      const corruptedData = {
        id: 'corrupted-proj',
        missingRequiredFields: true,
      };

      const result = safelyLoadProjectRecord(corruptedData);
      expect(result.status).toBe('corrupted');

      if (result.status === 'corrupted') {
        expect(result.rawRecord).toEqual(corruptedData);
        expect(result.validationIssues.length).toBeGreaterThan(0);
        const exported = result.exportRawJson();
        expect(exported).toContain('corrupted-proj');
      }
    });

    it('handles non-object inputs safely without throwing', () => {
      const result = safelyLoadProjectRecord('totally invalid string');
      expect(result.status).toBe('corrupted');
      if (result.status === 'corrupted') {
        expect(result.validationIssues).toContain('Record is not a valid JSON object.');
      }
    });
  });
});
