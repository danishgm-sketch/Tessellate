import { expect, it, vi } from 'vitest';

vi.mock('node:fs', () => { throw new Error('Browser export must not load the Node filesystem adapter'); });

it('loads the public exporter without Node filesystem access', async () => {
  const exporter = await import('../index.js');
  expect(typeof exporter.generateSourceTree).toBe('function');
  expect(typeof exporter.exportProjectManifestToJson).toBe('function');
}, 20000);
