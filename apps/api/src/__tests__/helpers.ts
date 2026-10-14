import app from '../index.js';
import type { Env } from '../types.js';

/** Explicit test environment: the only mode in which `Bearer test-user-*` sessions are honoured. */
export const TEST_ENV: Env = {
  ENVIRONMENT: 'test',
  DAEMON_DEV_TOKEN: 'test-daemon-token',
};

/** Production-like environment with no secrets/bindings configured: everything must fail closed. */
export const UNCONFIGURED_PRODUCTION_ENV: Env = {};

export function request(path: string, init?: RequestInit, env: Env = TEST_ENV) {
  return app.request(path, init, env);
}
