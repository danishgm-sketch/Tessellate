import * as os from 'node:os';
import * as path from 'node:path';

/** Local-only API and daemon credentials for the e2e run (the API accepts this token only outside production). */
export const E2E_API = 'http://127.0.0.1:8787';
export const E2E_DAEMON_TOKEN = 'e2e-daemon-token-local-only';
export const DAEMON_PID_FILE = path.join(os.tmpdir(), 'tessellate-e2e-daemon.pid');
