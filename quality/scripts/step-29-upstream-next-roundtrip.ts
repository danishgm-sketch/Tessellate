import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceDirectory = path.join(repositoryRoot, 'quality/evidence/step-29/upstream-next');
const templateRoot = process.argv[2];
const sourceRepository = process.argv[3];
if (!templateRoot || !sourceRepository)
  throw new Error(
    'Usage: pnpm exec tsx quality/scripts/step-29-upstream-next-roundtrip.ts <example-dir> <git-repository-dir>'
  );

const upstreamCommit = execFileSync('git', ['-C', sourceRepository, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tessellate-upstream-next-roundtrip-'));

function runNode(executable: string, args: string[], cwd: string): string {
  return execFileSync(process.execPath, [executable, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function waitForPreview(url: string, timeoutMs = 45_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Wait for Next to bind its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Next production server did not become ready at ${url}.`);
}

async function main(): Promise<void> {
  fs.cpSync(templateRoot, fixtureRoot, {
    recursive: true,
    filter: (source) =>
      !source.includes(`${path.sep}node_modules${path.sep}`) &&
      !source.includes(`${path.sep}.next${path.sep}`) &&
      !source.endsWith(`${path.sep}tessellate.project.json`),
  });
  const pageSource = fs.readFileSync(path.join(fixtureRoot, 'app/page.tsx'), 'utf8');
  const layoutSource = fs.readFileSync(path.join(fixtureRoot, 'app/layout.tsx'), 'utf8');
  const workspaceRequire = createRequire(path.join(repositoryRoot, 'packages/cli/src/index.ts'));
  const ingestPath = workspaceRequire.resolve('@tessellate/ingest');
  const { mapSourceFilesToProject } = await import(pathToFileURL(ingestPath).href);
  const manifestPath = path.join(fixtureRoot, 'tessellate.project.json');
  const cliOutput = runNode(
    path.join(repositoryRoot, 'packages/cli/dist/index.cjs'),
    ['ingest', fixtureRoot, '--output', manifestPath, '--name', 'Official Next starter'],
    fixtureRoot
  );
  assert.match(cliOutput, /Saved partial ProjectManifest/);
  assert.match(cliOutput, /layout wrappers are associated with route files/i);
  assert.equal(fs.readFileSync(path.join(fixtureRoot, 'app/page.tsx'), 'utf8'), pageSource);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    screens: Array<{ slug: string; name: string }>;
    productModel: { productArchetypes: Array<{ tag: string }> };
    designDNA: { primaryArchetype: string; navigationModel: string };
    description: string;
  };
  assert.deepEqual(
    manifest.screens.map(({ slug }) => slug),
    ['/']
  );
  assert.equal(manifest.screens[0]?.name, 'Home');
  assert.equal(manifest.productModel.productArchetypes[0]?.tag, 'unknown');
  assert.equal(manifest.designDNA.primaryArchetype, 'unknown');
  assert.equal(manifest.designDNA.navigationModel, 'unspecified-imported');
  assert.match(manifest.description, /schema defaults, not inferred/);
  const mappedSource = mapSourceFilesToProject([
    { filePath: 'app/page.tsx', code: pageSource },
    { filePath: 'app/layout.tsx', code: layoutSource },
  ]);
  assert.deepEqual(
    mappedSource.screens.map(({ route }) => route),
    ['/']
  );
  assert.deepEqual(mappedSource.screens[0]?.layoutFilePaths, ['app/layout.tsx']);

  const pnpmScript =
    process.env.npm_execpath ??
    path.join(process.env.APPDATA ?? '', 'npm/node_modules/pnpm/bin/pnpm.cjs');
  runNode(pnpmScript, ['install', '--no-frozen-lockfile'], fixtureRoot);
  const nextCli = path.join(fixtureRoot, 'node_modules/next/dist/bin/next');
  runNode(nextCli, ['build'], fixtureRoot);

  const preview = spawn(
    process.execPath,
    [nextCli, 'start', '--hostname', '127.0.0.1', '--port', '4188'],
    { cwd: fixtureRoot, stdio: 'ignore', windowsHide: true }
  );
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    await waitForPreview('http://127.0.0.1:4188/');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const exceptions: string[] = [];
    const failedRequests: string[] = [];
    const failedResponses: string[] = [];
    page.on('pageerror', (error) => exceptions.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') exceptions.push(message.text());
    });
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    page.on('response', (response) => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });

    const response = await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200);
    assert.equal(await page.getByRole('heading', { level: 1, name: 'Hello, Next.js!' }).count(), 1);
    await page.screenshot({ path: path.join(evidenceDirectory, 'desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(evidenceDirectory, 'mobile.png'), fullPage: true });
    assert.deepEqual(exceptions, []);
    assert.deepEqual(failedRequests, []);
    assert.deepEqual(failedResponses, []);

    console.log(
      JSON.stringify(
        {
          status: 'PASS',
          source: 'vercel/next.js examples/hello-world (App Router)',
          upstreamCommit,
          isolatedDependencyInstall: 'PASS (temporary fixture, outside repository node_modules)',
          ingest: 'one App Router root route; unknown product intent; DNA defaults disclosed',
          productionBuild: 'PASS',
          browser: {
            httpStatus: response?.status(),
            rootHeading: 'PASS',
            mobile390: 'PASS',
            exceptions,
            failedRequests,
            failedResponses,
          },
          screenshots: [
            path.join(evidenceDirectory, 'desktop.png'),
            path.join(evidenceDirectory, 'mobile.png'),
          ],
          fixture: fixtureRoot,
        },
        null,
        2
      )
    );
  } finally {
    await browser?.close();
    preview.kill();
    await once(preview, 'exit').catch(() => undefined);
  }
}

fs.mkdirSync(evidenceDirectory, { recursive: true });
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
