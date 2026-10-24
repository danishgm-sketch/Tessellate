import { afterEach, describe, expect, it, vi } from 'vitest';
import { validProjectFixture } from '@tessellate/schemas';
import { checkHostHealth, executeQueuedCommand } from './queue-client.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
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
    expect(result.error).toContain('not sent');
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
  it('does not send a negated command to the experimental laptop model', async () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1', port: '4323' } });
    const transport = vi.fn();
    vi.stubGlobal('fetch', transport);

    const result = await executeQueuedCommand(
      validProjectFixture,
      screenId,
      "Don't surprise me",
      undefined,
      { useExperimentalHost: true }
    );

    expect(result.success).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(result.error).toContain('negated intent');
    expect(transport).not.toHaveBeenCalled();
  });
  it('shows a safe backend rejection message and leaves the project unchanged', async () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1', port: '4323' } });
    const transport = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ apiOnline: true, hostOnline: true }))
      .mockResolvedValueOnce(Response.json(
        { error: 'AmbiguousPrompt', message: 'Negated intent is not sent to the laptop model. Your project was not changed.' },
        { status: 400 }
      ));
    vi.stubGlobal('fetch', transport);

    const result = await executeQueuedCommand(
      validProjectFixture,
      screenId,
      'Rebuild the product with a different navigation structure',
      undefined,
      { useExperimentalHost: true }
    );

    expect(result.success).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(result.error).toContain('Negated intent is not sent');
  });
  it('cancels its ticket when the laptop request times out', async () => {
    vi.stubGlobal('window', { location: { hostname: '127.0.0.1', port: '4323' } });
    vi.useFakeTimers();
    const ticket = {
      ticketId: '123e4567-e89b-12d3-a456-426614174000',
      accessToken: 'opaque-ticket-access-token',
      tokenNumber: 7,
      position: 1,
      estimatedWaitSeconds: 2,
    };
    const transport = vi.fn()
      .mockResolvedValueOnce(Response.json({ apiOnline: true, hostOnline: true }))
      .mockResolvedValueOnce(Response.json(ticket))
      .mockImplementation((input) => {
        if (String(input).includes('/status/')) return Promise.resolve(Response.json({ status: 'processing' }));
        return Promise.resolve(Response.json({ success: true }));
      });
    vi.stubGlobal('fetch', transport);

    const pending = executeQueuedCommand(
      validProjectFixture,
      screenId,
      'Rebuild the screen with a new navigation structure',
      undefined,
      { useExperimentalHost: true }
    );
    await vi.advanceTimersByTimeAsync(45000);
    const result = await pending;

    expect(result.success).toBe(false);
    expect(result.mutations).toEqual([]);
    expect(transport).toHaveBeenLastCalledWith(
      `/api/inference/cancel/${ticket.ticketId}`,
      expect.objectContaining({ method: 'POST', headers: { Authorization: `Bearer ${ticket.accessToken}` } })
    );
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
