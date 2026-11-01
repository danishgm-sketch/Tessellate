import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCheckpoint } from '../history/checkpoints.js';
import { createSampleProject } from '../store/sample-project.js';

const persistence = vi.hoisted(() => ({
  writes: [] as Array<{ projectId: string; checkpoint: unknown }>,
  stored: [] as unknown[],
  journalRaw: null as string | null,
}));

vi.mock('./storage.js', () => ({
  saveLocalCheckpoint: vi.fn(async (projectId: string, checkpoint: unknown) => {
    persistence.writes.push({ projectId, checkpoint });
  }),
  listLocalCheckpoints: vi.fn(async () => persistence.stored),
}));

import { loadCheckpointJournal, saveCheckpointJournal } from './checkpoint-journal.js';

describe('checkpoint journal persistence', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  beforeEach(() => {
    persistence.writes.length = 0;
    persistence.stored.length = 0;
    persistence.journalRaw = null;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => persistence.journalRaw,
        setItem: () => {
          throw Object.assign(new Error('quota exceeded'), { name: 'QuotaExceededError' });
        },
      } satisfies Pick<Storage, 'getItem' | 'setItem'>,
    });
  });

  afterEach(() => {
    if (originalDescriptor) Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('attempts durable checkpoint storage when the localStorage journal exceeds quota', async () => {
    const manifest = createSampleProject();
    const checkpoint = createCheckpoint(manifest, { trigger: 'manual', name: 'Before quota' });

    await expect(saveCheckpointJournal(manifest.id, [checkpoint]))
      .rejects.toMatchObject({ name: 'QuotaExceededError' });

    expect(persistence.writes).toEqual([{ projectId: manifest.id, checkpoint }]);
  });

  it('restores durable checkpoints when the localStorage journal is malformed and preserves its raw value', async () => {
    const manifest = createSampleProject();
    const checkpoint = createCheckpoint(manifest, { trigger: 'manual', name: 'Durable copy' });
    persistence.stored.push(checkpoint);
    persistence.journalRaw = '{malformed';

    const loaded = await loadCheckpointJournal(manifest.id);

    expect(loaded.map((item) => item.id)).toContain(checkpoint.id);
    expect(persistence.journalRaw).toBe('{malformed');
  });

  it('restores durable checkpoints when localStorage is inaccessible', async () => {
    const manifest = createSampleProject();
    const checkpoint = createCheckpoint(manifest, { trigger: 'manual', name: 'Durable copy' });
    persistence.stored.push(checkpoint);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => { throw new DOMException('Blocked', 'SecurityError'); },
    });

    const loaded = await loadCheckpointJournal(manifest.id);

    expect(loaded.map((item) => item.id)).toContain(checkpoint.id);
  });
});
