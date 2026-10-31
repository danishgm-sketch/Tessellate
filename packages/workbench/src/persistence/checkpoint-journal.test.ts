import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCheckpoint } from '../history/checkpoints.js';
import { createSampleProject } from '../store/sample-project.js';

const persistence = vi.hoisted(() => ({
  writes: [] as Array<{ projectId: string; checkpoint: unknown }>,
}));

vi.mock('./storage.js', () => ({
  saveLocalCheckpoint: vi.fn(async (projectId: string, checkpoint: unknown) => {
    persistence.writes.push({ projectId, checkpoint });
  }),
  listLocalCheckpoints: vi.fn(async () => []),
}));

import { saveCheckpointJournal } from './checkpoint-journal.js';

describe('checkpoint journal persistence', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  beforeEach(() => {
    persistence.writes.length = 0;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        setItem: () => {
          throw Object.assign(new Error('quota exceeded'), { name: 'QuotaExceededError' });
        },
      } satisfies Pick<Storage, 'setItem'>,
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
});
