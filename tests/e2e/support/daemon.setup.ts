import { test as setup, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DAEMON_PID_FILE, E2E_API, E2E_DAEMON_TOKEN } from './daemon-env';

/**
 * Starts the real host daemon (D-033) against the local API so composition journeys run end to end
 * through the queue and the promoted brief model. Runs after the offline spec, which needs no host.
 */
setup('start the intelligence host daemon', async ({ request }) => {
  setup.setTimeout(60000);
  const root = process.cwd();
  const log = fs.openSync(path.join(path.dirname(DAEMON_PID_FILE), 'tessellate-e2e-daemon.log'), 'w');
  const child = spawn(process.env.PYTHON ?? 'python', ['-u', path.join(root, 'apps/host-daemon/daemon.py')], {
    cwd: root,
    detached: true,
    stdio: ['ignore', log, log],
    env: {
      ...process.env,
      TESSELLATE_API_URL: E2E_API,
      TESSELLATE_DAEMON_TOKEN: E2E_DAEMON_TOKEN,
      // Never read the owner's real daemon.env during tests.
      TESSELLATE_DAEMON_ENV: path.join(root, 'apps/host-daemon/daemon.env.e2e-none'),
    },
  });
  child.unref();
  fs.writeFileSync(DAEMON_PID_FILE, String(child.pid));

  await expect
    .poll(
      async () => {
        const res = await request.get(`${E2E_API}/api/inference/health`);
        return res.ok() ? Boolean((await res.json()).hostOnline) : false;
      },
      { timeout: 45000, message: 'host daemon did not come online (see tessellate-e2e-daemon.log in the temp directory)' },
    )
    .toBe(true);
});
