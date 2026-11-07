import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runHealthcheck } from './healthcheck.mjs';

describe('laptop API Docker healthcheck recovery', () => {
  let directory: string;
  let failuresPath: string;
  let recoveryBudgetPath: string;
  let startedAtPath: string;
  let now: number;
  let signalParent: ReturnType<typeof vi.fn>;

  const failingFetch = vi.fn(async () => new Response(null, { status: 503 }));

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'tessellate-api-healthcheck-'));
    failuresPath = join(directory, 'failures');
    recoveryBudgetPath = join(directory, 'recovery-budget.json');
    startedAtPath = join(directory, 'started-at');
    now = 1_800_000_000_000;
    signalParent = vi.fn();
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  function run(fetchImpl: typeof fetch = failingFetch, overrides: Parameters<typeof runHealthcheck>[0] = {}) {
    return runHealthcheck({
      url: 'http://127.0.0.1:8787/health',
      startedAtPath,
      failuresPath,
      recoveryBudgetPath,
      startupGraceMs: 0,
      failureThreshold: 3,
      restartLimit: 3,
      restartWindowMs: 3_600_000,
      timeoutMs: 2500,
      now: () => now,
      fetchImpl,
      signalParent,
      ...overrides,
    });
  }

  it('requests a restart only after consecutive health failures', async () => {
    expect((await run()).status).toBe('unhealthy');
    expect((await run()).status).toBe('unhealthy');
    expect(signalParent).not.toHaveBeenCalled();

    const result = await run();

    expect(result).toEqual({ status: 'restart-requested', consecutiveFailures: 3, restartCountInWindow: 1 });
    expect(signalParent).toHaveBeenCalledOnce();
    expect(signalParent).toHaveBeenCalledWith('SIGTERM');
    expect(JSON.parse(await readFile(recoveryBudgetPath, 'utf8'))).toEqual([now]);
  });

  it('clears a failure streak after the API recovers', async () => {
    await run();
    await run();

    const result = await run(async () => new Response(null, { status: 200 }));

    expect(result).toEqual({ status: 'healthy', consecutiveFailures: 0 });
    expect(signalParent).not.toHaveBeenCalled();
    await expect(readFile(failuresPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('preserves a startup grace period when the API has not become ready', async () => {
    await writeFile(startedAtPath, String(now));

    const result = await run(failingFetch, { startupGraceMs: 40_000 });

    expect(result.status).toBe('starting');
    expect(signalParent).not.toHaveBeenCalled();
    await expect(readFile(failuresPath, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('stops requesting restarts after the persistent hourly recovery budget is spent', async () => {
    for (let restart = 0; restart < 3; restart += 1) {
      await run();
      await run();
      expect((await run()).status).toBe('restart-requested');
      await rm(failuresPath, { force: true });
    }

    await run();
    await run();
    const result = await run();

    expect(result.status).toBe('recovery-budget-exhausted');
    expect(signalParent).toHaveBeenCalledTimes(3);
    expect(JSON.parse(await readFile(recoveryBudgetPath, 'utf8'))).toEqual([now, now, now]);
  });

  it('fails closed when the persistent recovery budget is malformed', async () => {
    await writeFile(recoveryBudgetPath, '{broken');
    await run();
    await run();

    const result = await run();

    expect(result.status).toBe('recovery-budget-unavailable');
    expect(signalParent).not.toHaveBeenCalled();
  });
});
