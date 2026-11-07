import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const evidencePath = join(dirname(fileURLToPath(import.meta.url)), 'aud448-docker-recovery.json');
const containerName = `tessellate-aud448-${randomUUID().slice(0, 8)}`;
const apiImage = 'tessellate-laptop-api';
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'tessellate-aud448-'));
const temporaryRoot = resolve(tmpdir()) + sep;

if (!resolve(temporaryDirectory).startsWith(temporaryRoot)) {
  throw new Error('Temporary test directory resolved outside the system temp directory.');
}

const serverPath = join(temporaryDirectory, 'recovery-server.mjs');
const healthcheckPath = join(repoRoot, 'apps/laptop-backend/healthcheck.mjs');
const serverSource = `
import { createServer } from 'node:http';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const bootPath = '/data/aud448-healthcheck-boots';
const bootCount = (existsSync(bootPath) ? Number(readFileSync(bootPath, 'utf8')) : 0) + 1;
writeFileSync(bootPath, String(bootCount), { mode: 0o600 });
writeFileSync('/tmp/tessellate-api-started-at', String(Date.now() - 60_000), { mode: 0o600 });
const healthStatus = bootCount === 1 ? 503 : 200;

createServer((request, response) => {
  response.writeHead(request.url === '/health' ? healthStatus : 404);
  response.end();
}).listen(8787, '0.0.0.0');
`;

function docker(args, { allowFailure = false } = {}) {
  const result = spawnSync('docker', args, { encoding: 'utf8', timeout: 15_000 });
  if (result.error) throw result.error;
  if (!allowFailure && result.status !== 0) {
    throw new Error(`docker ${args[0]} failed: ${result.stderr.trim() || result.stdout.trim()}`);
  }
  return result.stdout.trim();
}

let containerStarted = false;

try {
  docker(['image', 'inspect', apiImage, '--format', '{{.Id}}']);
  await writeFile(serverPath, serverSource, { encoding: 'utf8', mode: 0o600 });

  const serverMount = `type=bind,source=${serverPath},target=/app/apps/laptop-backend/aud448-test-server.mjs,readonly`;
  const healthcheckMount = `type=bind,source=${healthcheckPath},target=/app/apps/laptop-backend/healthcheck.mjs,readonly`;
  containerStarted = true;
  docker([
    'run', '--detach', '--name', containerName,
    '--restart', 'unless-stopped', '--init',
    '--mount', serverMount,
    '--mount', healthcheckMount,
    '--tmpfs', '/tmp:uid=1000,gid=1000,mode=1777',
    '--health-cmd', 'node /app/apps/laptop-backend/healthcheck.mjs',
    '--health-interval=1s', '--health-timeout=3s', '--health-retries=6', '--health-start-period=0s',
    apiImage, 'node', '/app/apps/laptop-backend/aud448-test-server.mjs',
  ]);

  const deadline = Date.now() + 45_000;
  let state;
  let restartCount = 0;
  do {
    const [stateJson, restartRaw] = docker(['inspect', containerName, '--format', '{{json .State}}|{{.RestartCount}}']).split('|');
    state = JSON.parse(stateJson);
    restartCount = Number(restartRaw);
    if (state.Status === 'running' && state.Health?.Status === 'healthy' && restartCount >= 1) break;
    if (state.Status !== 'running' && state.Status !== 'restarting') {
      throw new Error(`Recovery test container entered unexpected state: ${state.Status}`);
    }
    await setTimeout(500);
  } while (Date.now() < deadline);

  const boots = Number(docker(['exec', containerName, 'cat', '/data/aud448-healthcheck-boots']));
  const result = {
    id: 'AUD-448',
    test: 'bounded-healthcheck-container-recovery',
    beforeFix: {
      containerStatus: 'running',
      healthStatus: 'unhealthy',
      restartCount: 0,
      reproduction: 'A healthy long-running process with a failing Docker healthcheck remained running/unhealthy under restart: unless-stopped.',
    },
    afterFix: {
      containerStatus: state.Status,
      healthStatus: state.Health?.Status ?? null,
      restartCount,
      serverBootCount: boots,
      healthcheckLog: (state.Health?.Log ?? []).map((entry) => ({
        exitCode: entry.ExitCode,
        output: entry.Output,
      })),
    },
    isolation: { boundPorts: [], secretsMounted: false, persistentExternalServices: false },
    testedAt: new Date().toISOString(),
  };

  await writeFile(evidencePath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result));
  if (result.afterFix.containerStatus !== 'running' || result.afterFix.healthStatus !== 'healthy' || restartCount !== 1 || boots !== 2) {
    throw new Error('Health recovery did not settle after exactly one restart.');
  }
} finally {
  if (containerStarted) docker(['rm', '--force', containerName], { allowFailure: true });
  await rm(temporaryDirectory, { recursive: true, force: true });
}
