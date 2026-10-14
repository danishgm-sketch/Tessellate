import { test as teardown } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import { DAEMON_PID_FILE } from './daemon-env';

teardown('stop the intelligence host daemon', () => {
  if (!fs.existsSync(DAEMON_PID_FILE)) return;
  const pid = Number(fs.readFileSync(DAEMON_PID_FILE, 'utf-8'));
  fs.rmSync(DAEMON_PID_FILE, { force: true });
  try {
    if (process.platform === 'win32') execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    else process.kill(-pid, 'SIGTERM');
  } catch {
    // Already exited.
  }
});
