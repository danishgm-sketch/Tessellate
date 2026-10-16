import { afterEach, describe, expect, it, vi } from 'vitest';
import { validProjectFixture } from '@tessellate/schemas';
import { checkHostHealth, executeQueuedCommand } from './queue-client.js';

afterEach(() => vi.unstubAllGlobals());
const screenId = validProjectFixture.screens[0]!.id;
describe('offline laptop command behavior', () => {
  it('runs recognized deterministic commands without contacting the backend', async () => {
    const transport = vi
      .fn()
      .mockResolvedValue(Response.json({ apiOnline: true, hostOnline: true }));
    vi.stubGlobal('fetch', transport);
    const result = await executeQueuedCommand(validProjectFixture, screenId, 'reduce motion');
    expect(result.success).toBe(true);
    expect(result.usedFallback).toBe(true);
    expect(result.command?.dnaDeltas?.motion).toBeLessThan(0);
    expect(transport).not.toHaveBeenCalled();
  });
  it('reports the local host as offline without probing an unconfigured laptop backend', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost', port: '4321' } });
    const transport = vi.fn();
    vi.stubGlobal('fetch', transport);
    await expect(checkHostHealth()).resolves.toEqual({
      apiOnline: false,
      hostOnline: false,
      pendingTasks: 0,
    });
    expect(transport).not.toHaveBeenCalled();
  });
  it('uses the local Sites Worker proxy when running its adapter on port 4323', async () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1', port: '4323' } });
    const transport = vi
      .fn()
      .mockResolvedValue(Response.json({ apiOnline: true, hostOnline: false }));
    vi.stubGlobal('fetch', transport);
    await expect(checkHostHealth()).resolves.toMatchObject({ apiOnline: true, hostOnline: false });
    expect(transport).toHaveBeenCalledWith('/api/inference/health', expect.anything());
  });
  it('does not silently recompose an unsupported prompt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ apiOnline: false, hostOnline: false }))
    );
    const result = await executeQueuedCommand(
      validProjectFixture,
      screenId,
      'Explain the employee sentiment report for last Tuesday'
    );
    expect(result.success).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(result.error).toContain('unavailable');
  });
  it('keeps unrecognized commands out of the experimental laptop model unless explicitly enabled', async () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1', port: '4323' } });
    const transport = vi
      .fn()
      .mockResolvedValue(Response.json({ apiOnline: true, hostOnline: true }));
    vi.stubGlobal('fetch', transport);

    const result = await executeQueuedCommand(
      validProjectFixture,
      screenId,
      'Rebalance the information architecture for this screen'
    );

    expect(result.success).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(result.error).toContain('Lab');
    expect(transport).not.toHaveBeenCalled();
  });
  it('retains explicitly recognized local commands', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ apiOnline: false, hostOnline: false }))
    );
    const result = await executeQueuedCommand(validProjectFixture, screenId, 'reduce motion');
    expect(result.success).toBe(true);
    expect(result.usedFallback).toBe(true);
    expect(result.mutations.length).toBeGreaterThan(0);
  });
  it('does not mutate the project when the online queue disappears', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ apiOnline: true, hostOnline: true }))
        .mockRejectedValueOnce(new Error('connection lost'))
    );
    const result = await executeQueuedCommand(
      validProjectFixture,
      screenId,
      'Improve visual hierarchy and keep existing structure coherent'
    );
    expect(result.success).toBe(false);
    expect(result.usedFallback).toBe(false);
    expect(result.mutations).toEqual([]);
  });
});
