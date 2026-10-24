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
const evidenceDirectory = path.join(repositoryRoot, 'quality/evidence/step-29/upstream-vite');
const templateRoot = process.argv[2];
const sourceRepository = process.argv[3];
if (!templateRoot || !sourceRepository)
  throw new Error(
    'Usage: pnpm exec tsx quality/scripts/step-29-upstream-vite-roundtrip.ts <template-dir> <git-repository-dir>'
  );

const upstreamCommit = execFileSync('git', ['-C', sourceRepository, 'rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tessellate-upstream-vite-roundtrip-'));
const appSourcePath = path.join(fixtureRoot, 'src/App.tsx');
const cssPath = path.join(fixtureRoot, 'src/App.css');

function runNode(executable: string, args: string[], cwd: string): string {
  return execFileSync(process.execPath, [executable, ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function waitForPreview(url: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Wait for Vite's preview server to bind its port.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Vite preview did not become ready at ${url}.`);
}

async function main(): Promise<void> {
  fs.cpSync(templateRoot, fixtureRoot, {
    recursive: true,
    filter: (source) =>
      !source.includes(`${path.sep}node_modules${path.sep}`) &&
      !source.includes(`${path.sep}dist${path.sep}`),
  });
  const originalSource = fs.readFileSync(appSourcePath, 'utf8');
  const workspaceRequire = createRequire(path.join(repositoryRoot, 'packages/cli/src/index.ts'));
  const ingestPath = workspaceRequire.resolve('@tessellate/ingest');
  const { applyVisualMutationToSource, generateAstDiff } = await import(
    pathToFileURL(ingestPath).href
  );

  const manifestPath = path.join(fixtureRoot, 'tessellate.project.json');
  const cliOutput = runNode(
    path.join(repositoryRoot, 'packages/cli/dist/index.cjs'),
    ['ingest', fixtureRoot, '--output', manifestPath, '--name', 'Official Vite starter'],
    fixtureRoot
  );
  assert.match(cliOutput, /Saved partial ProjectManifest/);
  assert.equal(fs.readFileSync(appSourcePath, 'utf8'), originalSource);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    screens: Array<{ slug: string }>;
    productModel: { productArchetypes: Array<{ tag: string }> };
    designDNA: { primaryArchetype: string; navigationModel: string };
    description: string;
  };
  assert.deepEqual(
    manifest.screens.map(({ slug }) => slug),
    ['/']
  );
  assert.equal(manifest.productModel.productArchetypes[0]?.tag, 'unknown');
  assert.equal(manifest.designDNA.primaryArchetype, 'unknown');
  assert.equal(manifest.designDNA.navigationModel, 'unspecified-imported');
  assert.match(manifest.description, /schema defaults, not inferred/);

  const buttonPatch = applyVisualMutationToSource(originalSource, {
    fileName: 'src/App.tsx',
    componentName: 'App',
    elementPath: 'section[0]/button[0]',
    attributeName: 'className',
    expectedValue: 'counter',
    replacementValue: 'counter tessellate-roundtrip',
  });
  assert.equal(buttonPatch.safety, 'SAFE');
  assert.equal(buttonPatch.applied, true);
  const imagePatch = applyVisualMutationToSource(buttonPatch.modifiedCode, {
    fileName: 'src/App.tsx',
    componentName: 'App',
    elementPath: 'section[0]/div[0]/img[0]',
    attributeName: 'className',
    expectedValue: 'base',
    replacementValue: 'base tessellate-roundtrip',
  });
  assert.equal(imagePatch.safety, 'SAFE');
  assert.equal(imagePatch.applied, true);
  assert.equal(
    imagePatch.modifiedCode
      .replace('counter tessellate-roundtrip', 'counter')
      .replace('base tessellate-roundtrip', 'base'),
    originalSource,
    'the exact targeted static className spans must be the only changes to App.tsx'
  );

  fs.writeFileSync(
    cssPath,
    `${fs.readFileSync(cssPath, 'utf8')}\n.counter.tessellate-roundtrip { box-shadow: 0 0 0 4px rgb(14 165 233); }\n.base.tessellate-roundtrip { filter: drop-shadow(0 0 8px rgb(14 165 233)); }\n`
  );
  fs.writeFileSync(appSourcePath, originalSource);
  const patch = generateAstDiff('src/App.tsx', originalSource, imagePatch.modifiedCode);
  fs.writeFileSync(path.join(fixtureRoot, 'change.patch'), `${patch.unifiedDiff}\n`);
  execFileSync('git', ['init', '-q'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: fixtureRoot });
  execFileSync('git', ['apply', '--check', 'change.patch'], { cwd: fixtureRoot });
  execFileSync('git', ['apply', 'change.patch'], { cwd: fixtureRoot });
  assert.equal(fs.readFileSync(appSourcePath, 'utf8'), imagePatch.modifiedCode);

  const pnpmScript =
    process.env.npm_execpath ??
    path.join(process.env.APPDATA ?? '', 'npm/node_modules/pnpm/bin/pnpm.cjs');
  runNode(pnpmScript, ['install', '--offline', '--no-frozen-lockfile'], fixtureRoot);
  const viteCli = path.join(fixtureRoot, 'node_modules/vite/bin/vite.js');
  runNode(viteCli, ['build'], fixtureRoot);

  const preview = spawn(
    process.execPath,
    [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4187', '--strictPort'],
    { cwd: fixtureRoot, stdio: 'ignore', windowsHide: true }
  );
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    await waitForPreview('http://127.0.0.1:4187/');
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

    const response = await page.goto('http://127.0.0.1:4187/', { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200);
    const counter = page.getByRole('button', { name: 'Count is 0' });
    const heroImage = page.locator('img.base');
    assert.equal(await counter.count(), 1);
    assert.equal(await heroImage.count(), 1);
    assert.match((await heroImage.getAttribute('class')) ?? '', /tessellate-roundtrip/);
    const boxShadowBeforePatch = await counter.evaluate((node) => {
      node.classList.remove('tessellate-roundtrip');
      return getComputedStyle(node).boxShadow;
    });
    const imageFilterBeforePatch = await heroImage.evaluate((node) => {
      node.classList.remove('tessellate-roundtrip');
      return getComputedStyle(node).filter;
    });
    await page.screenshot({
      path: path.join(evidenceDirectory, 'desktop-before.png'),
      fullPage: true,
    });
    await counter.evaluate((node) => node.classList.add('tessellate-roundtrip'));
    await heroImage.evaluate((node) => node.classList.add('tessellate-roundtrip'));
    assert.equal(
      boxShadowBeforePatch,
      'none',
      'the original upstream class has no round-trip emphasis'
    );
    assert.equal(imageFilterBeforePatch, 'none', 'the original image has no round-trip emphasis');
    assert.notEqual(
      await page
        .locator('button.counter.tessellate-roundtrip')
        .evaluate((node) => getComputedStyle(node).boxShadow),
      'none',
      'the patched class must produce a real visual change in the built app'
    );
    assert.notEqual(
      await heroImage.evaluate((node) => getComputedStyle(node).filter),
      'none',
      'the second patched class must also produce a real visual change in the built app'
    );
    await page.keyboard.press('Tab');
    assert.equal(await counter.evaluate((node) => node === document.activeElement), true);
    await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('button', { name: 'Count is 1' }).count(), 1);
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
          source: 'vitejs/vite create-vite template-react-ts',
          upstreamCommit,
          isolatedDependencyInstall: 'PASS (pnpm offline, outside repository node_modules)',
          ingest: 'one root route; unknown product intent; DNA defaults disclosed',
          patch: 'two exact App.tsx className spans; Git apply check passed',
          productionBuild: 'PASS',
          browser: {
            httpStatus: response?.status(),
            visualMutation: 'PASS',
            keyboardCountInteraction: 'PASS',
            mobile390: 'PASS',
            exceptions,
            failedRequests,
            failedResponses,
          },
          screenshots: [
            path.join(evidenceDirectory, 'desktop-before.png'),
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
