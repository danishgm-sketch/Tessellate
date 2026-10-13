import { afterEach, describe, expect, it, vi } from 'vitest';
import { validProjectFixture } from '@tessellate/schemas';
import { executeQueuedCommand } from './queue-client.js';

afterEach(() => vi.unstubAllGlobals());
const screenId = validProjectFixture.screens[0]!.id;
describe('offline laptop command behavior', () => {
  it('uses the deterministic contract for recognized commands even with an online model', async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({ apiOnline: true, hostOnline: true }));
    vi.stubGlobal('fetch', transport);
    const result = await executeQueuedCommand(validProjectFixture, screenId, 'reduce motion');
    expect(result.success).toBe(true);
    expect(result.usedFallback).toBe(true);
    expect(result.command?.dnaDeltas?.motion).toBeLessThan(0);
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it('does not silently recompose an unsupported prompt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ apiOnline: false, hostOnline: false })));
    const result = await executeQueuedCommand(validProjectFixture, screenId, 'Explain the employee sentiment report for last Tuesday');
    expect(result.success).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(result.error).toContain('unavailable');
  });
  it('retains explicitly recognized local commands', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ apiOnline: false, hostOnline: false })));
    const result = await executeQueuedCommand(validProjectFixture, screenId, 'reduce motion');
    expect(result.success).toBe(true);
    expect(result.usedFallback).toBe(true);
    expect(result.mutations.length).toBeGreaterThan(0);
  });
  it('does not mutate the project when the online queue disappears', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(Response.json({ apiOnline: true, hostOnline: true }))
      .mockRejectedValueOnce(new Error('connection lost')));
    const result = await executeQueuedCommand(validProjectFixture, screenId, 'Improve visual hierarchy and keep existing structure coherent');
    expect(result.success).toBe(false);
    expect(result.usedFallback).toBe(false);
    expect(result.mutations).toEqual([]);
  });
});
