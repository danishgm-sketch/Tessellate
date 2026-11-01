/* global AbortSignal, console */
import process from 'node:process';
import { readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DEFAULTS = {
  url: 'http://127.0.0.1:8787/health',
  startedAtPath: '/tmp/tessellate-api-started-at',
  failuresPath: '/tmp/tessellate-api-health-failures',
  recoveryBudgetPath: '/data/.tessellate-health-recoveries.json',
  timeoutMs: 2500,
  startupGraceMs: 40_000,
  failureThreshold: 6,
  restartLimit: 3,
  restartWindowMs: 60 * 60 * 1000,
  now: Date.now,
  fetchImpl: globalThis.fetch,
  signalParent: () => {
    throw new Error('No container restart target configured.');
  },
};

async function readText(path) {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeAtomically(path, contents) {
  const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, contents, { mode: 0o600 });
    await rename(temporaryPath, path);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

async function readFailureCount(path) {
  const raw = await readText(path);
  if (raw === null) return 0;
  const parsed = Number.parseInt(raw.trim(), 10);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;
}

async function readRecoveryTimes(path) {
  const raw = await readText(path);
  if (raw === null) return [];

  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value) || value.some((timestamp) => !Number.isSafeInteger(timestamp) || timestamp < 0)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

/**
 * Probe the local API and request a bounded container restart after sustained
 * failures. Dependencies are injectable so the same policy can be tested
 * without signalling the test process.
 *
 * @param {import('./healthcheck.d.mts').HealthcheckOptions} options
 * @returns {Promise<import('./healthcheck.d.mts').HealthcheckResult>}
 */
export async function runHealthcheck(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const now = config.now();

  try {
    const response = await config.fetchImpl(config.url, {
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    if (response.ok) {
      await unlink(config.failuresPath).catch(() => undefined);
      return { status: 'healthy', consecutiveFailures: 0 };
    }
  } catch {
    // A connection failure or timeout is recorded in the same way as a non-2xx
    // health response. The healthcheck itself never logs request details.
  }

  if (config.startupGraceMs > 0) {
    const startedAtRaw = await readText(config.startedAtPath).catch(() => null);
    const startedAt = startedAtRaw === null ? Number.NaN : Number.parseInt(startedAtRaw.trim(), 10);
    if (!Number.isSafeInteger(startedAt) || now - startedAt < config.startupGraceMs) {
      return { status: 'starting', consecutiveFailures: 0 };
    }
  }

  let consecutiveFailures;
  try {
    consecutiveFailures = (await readFailureCount(config.failuresPath)) + 1;
    await writeAtomically(config.failuresPath, String(consecutiveFailures));
  } catch {
    return { status: 'unhealthy', consecutiveFailures: 0 };
  }

  if (consecutiveFailures < config.failureThreshold) {
    return { status: 'unhealthy', consecutiveFailures };
  }

  let recordedRecoveries;
  try {
    recordedRecoveries = await readRecoveryTimes(config.recoveryBudgetPath);
  } catch {
    recordedRecoveries = null;
  }
  if (!recordedRecoveries) {
    return { status: 'recovery-budget-unavailable', consecutiveFailures };
  }

  const recentRecoveries = recordedRecoveries.filter(
    (timestamp) => timestamp >= now - config.restartWindowMs,
  );
  if (recentRecoveries.length >= config.restartLimit) {
    return { status: 'recovery-budget-exhausted', consecutiveFailures };
  }

  const nextRecoveries = [...recentRecoveries, now];
  try {
    await writeAtomically(config.recoveryBudgetPath, JSON.stringify(nextRecoveries));
  } catch {
    return { status: 'recovery-budget-unavailable', consecutiveFailures };
  }

  try {
    config.signalParent('SIGTERM');
    return {
      status: 'restart-requested',
      consecutiveFailures,
      restartCountInWindow: nextRecoveries.length,
    };
  } catch {
    // Keep the attempt in the persistent budget if signalling failed. This
    // prevents a broken signal path from causing an unbounded probe loop.
    return { status: 'restart-signal-failed', consecutiveFailures };
  }
}

async function main() {
  const result = await runHealthcheck({ signalParent: (signal) => process.kill(1, signal) });

  if (result.status === 'restart-requested') {
    console.error(`[laptop-api-healthcheck] API remained unhealthy for ${result.consecutiveFailures} probes; requesting bounded container restart ${result.restartCountInWindow}/3.`);
  } else if (result.status === 'recovery-budget-exhausted') {
    console.error('[laptop-api-healthcheck] Restart budget exhausted; leaving the API unhealthy until it is restored.');
  } else if (result.status === 'recovery-budget-unavailable') {
    console.error('[laptop-api-healthcheck] Restart budget could not be verified; leaving the API unhealthy.');
  } else if (result.status === 'restart-signal-failed') {
    console.error('[laptop-api-healthcheck] Could not request a container restart; leaving the API unhealthy.');
  }

  process.exitCode = result.status === 'healthy' ? 0 : 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
