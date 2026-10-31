import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidenceDirectory = path.join(repositoryRoot, 'quality/evidence/step-29/vite-roundtrip');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tessellate-ingest-vite-roundtrip-'));
const sourcePath = path.join(fixtureRoot, 'src/App.tsx');
const originalSource = `import React, { createContext, useContext, useState } from 'react';

export const TeamContext = createContext('People Experience');

export default function Dashboard() {
  const team = useContext(TeamContext);
  const [active, setActive] = useState('People');

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-stone-50 px-8 py-16 text-stone-900">
      <h1 className="text-xl font-bold">Employee workspace</h1>
      <p>Team: {team}</p>
      <button className="rounded bg-stone-900 px-4 py-2 text-white" onClick={() => setActive('Settings')}>
        Open settings
      </button>
      <p>Active area: <span>{active}</span></p>
    </main>
  );
}
`;

function writeFixture(relativePath: string, content: string): void {
  const destination = path.join(fixtureRoot, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, content, 'utf8');
}

async function waitForPreview(url: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Vite preview did not become ready at ${url}.`);
}

async function main(): Promise<void> {
  const workspaceRequire = createRequire(path.join(repositoryRoot, 'packages/cli/src/index.ts'));
  const ingestSource = workspaceRequire.resolve('@tessellate/ingest');
  const { applyVisualMutationToSource, generateAstDiff } = await import(
    pathToFileURL(ingestSource).href
  );

  writeFixture(
    'package.json',
    JSON.stringify(
      {
        name: 'tessellate-ingest-roundtrip-fixture',
        private: true,
        type: 'module',
        scripts: { build: 'vite build', preview: 'vite preview' },
        dependencies: { react: '19.3.0', 'react-dom': '19.3.0' },
        devDependencies: {
          '@tailwindcss/vite': '4.3.3',
          tailwindcss: '4.3.3',
          vite: '6.4.4',
        },
      },
      null,
      2
    )
  );
  writeFixture('pnpm-workspace.yaml', 'allowBuilds:\n  esbuild: true\n');
  writeFixture(
    'index.html',
    '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Employee workspace</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>'
  );
  writeFixture(
    'vite.config.ts',
    `import { defineConfig } from 'vite';\nimport tailwindcss from '@tailwindcss/vite';\nexport default defineConfig({ plugins: [tailwindcss()] });\n`
  );
  writeFixture('src/App.tsx', originalSource);
  writeFixture(
    'src/main.tsx',
    `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport Dashboard, { TeamContext } from './App';\nimport './style.css';\ncreateRoot(document.getElementById('root')!).render(<TeamContext.Provider value="People Operations"><Dashboard /></TeamContext.Provider>);\n`
  );
  writeFixture('src/style.css', '@import "tailwindcss";\n');

  const manifestPath = path.join(fixtureRoot, 'tessellate.project.json');
  const cliOutput = execFileSync(
    process.execPath,
    [
      path.join(repositoryRoot, 'packages/cli/dist/index.cjs'),
      'ingest',
      fixtureRoot,
      '--output',
      manifestPath,
      '--name',
      'Employee experience',
    ],
    { cwd: fixtureRoot, encoding: 'utf8' }
  );
  assert.match(cliOutput, /Saved partial ProjectManifest/);
  assert.equal(
    fs.readFileSync(sourcePath, 'utf8'),
    originalSource,
    'CLI ingestion must leave the original route source untouched'
  );
  const projectManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    screens: Array<{ slug: string }>;
    productModel: { productArchetypes: Array<{ tag: string }> };
  };
  assert.equal(
    projectManifest.screens.length,
    1,
    'Vite app entry should be identified as one screen'
  );
  assert.equal(projectManifest.screens[0]?.slug, '/', 'Vite entry should map to the home route');
  assert.equal(projectManifest.productModel.productArchetypes[0]?.tag, 'unknown');

  const patchResult = applyVisualMutationToSource(originalSource, {
    fileName: 'src/App.tsx',
    componentName: 'Dashboard',
    elementPath: 'main[0]/h1[0]',
    attributeName: 'className',
    expectedValue: 'text-xl font-bold',
    replacementValue: 'text-4xl font-extrabold tracking-tight',
  });
  assert.equal(patchResult.safety, 'SAFE');
  assert.equal(patchResult.applied, true);
  assert.match(patchResult.modifiedCode, /useContext\(TeamContext\)/);
  assert.match(patchResult.modifiedCode, /setActive\('Settings'\)/);
  assert.equal(
    patchResult.modifiedCode.replace('text-4xl font-extrabold tracking-tight', 'text-xl font-bold'),
    originalSource,
    'the declared className is the only changed source span'
  );

  writeFixture('src/App.tsx', originalSource);
  const patch = generateAstDiff('src/App.tsx', originalSource, patchResult.modifiedCode);
  fs.writeFileSync(path.join(fixtureRoot, 'change.patch'), `${patch.unifiedDiff}\n`);
  execFileSync('git', ['init', '-q'], { cwd: fixtureRoot });
  execFileSync('git', ['config', 'core.autocrlf', 'false'], { cwd: fixtureRoot });
  execFileSync('git', ['apply', '--check', 'change.patch'], { cwd: fixtureRoot });
  execFileSync('git', ['apply', 'change.patch'], { cwd: fixtureRoot });
  assert.equal(fs.readFileSync(sourcePath, 'utf8'), patchResult.modifiedCode);

  // This fixture has a separate package tree and installs only from the local
  // pnpm content-addressed store. It never resolves dependencies from the repo.
  const packageManagerArgs = ['install', '--offline', '--no-frozen-lockfile'];
  const packageManagerCommand =
    process.platform === 'win32'
      ? (process.env.npm_execpath ??
        path.join(process.env.APPDATA ?? '', 'npm/node_modules/pnpm/bin/pnpm.cjs'))
      : 'pnpm';
  const packageManagerCommandArgs =
    process.platform === 'win32'
      ? [packageManagerCommand, ...packageManagerArgs]
      : packageManagerArgs;
  execFileSync(
    process.platform === 'win32' ? process.execPath : packageManagerCommand,
    packageManagerCommandArgs,
    {
      cwd: fixtureRoot,
      stdio: 'inherit',
    }
  );
  const viteCli = path.join(fixtureRoot, 'node_modules/vite/bin/vite.js');
  execFileSync(process.execPath, [viteCli, 'build'], { cwd: fixtureRoot, stdio: 'inherit' });

  const preview = spawn(
    process.execPath,
    [viteCli, 'preview', '--host', '127.0.0.1', '--port', '4178', '--strictPort'],
    {
      cwd: fixtureRoot,
      stdio: 'ignore',
      windowsHide: true,
    }
  );
  const browser = await chromium.launch({ headless: true });
  try {
    const url = 'http://127.0.0.1:4178/';
    await waitForPreview(url);
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const browserErrors: string[] = [];
    const failedRequests: string[] = [];
    const failedResponses: string[] = [];
    page.on('pageerror', (error) => browserErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text());
    });
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    page.on('response', (assetResponse) => {
      if (assetResponse.status() >= 400)
        failedResponses.push(`${assetResponse.status()} ${assetResponse.url()}`);
    });
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(response?.status(), 200);
    const bodyText = await page.locator('body').innerText();
    if (!bodyText.includes('Employee workspace')) {
      await page.screenshot({
        path: path.join(evidenceDirectory, 'failed-desktop.png'),
        fullPage: true,
      });
      throw new Error(
        `Expected the built application to render its heading. Body: ${JSON.stringify(bodyText)}. Browser errors: ${JSON.stringify(browserErrors)}`
      );
    }
    assert.equal(await page.getByRole('heading', { name: 'Employee workspace' }).count(), 1);
    assert.equal(
      await page
        .getByRole('heading', { name: 'Employee workspace' })
        .evaluate((node) => getComputedStyle(node).fontSize),
      '36px',
      'the applied class change should alter the real rendered typography'
    );
    assert.equal(await page.getByText('Team: People Operations').count(), 1);
    await page.keyboard.press('Tab');
    assert.equal(
      await page
        .getByRole('button', { name: 'Open settings' })
        .evaluate((node) => node === document.activeElement),
      true,
      'the visible primary button should be reachable in keyboard order'
    );
    await page.keyboard.press('Enter');
    assert.equal(await page.getByText('Active area: Settings').count(), 1);
    await page.screenshot({ path: path.join(evidenceDirectory, 'desktop.png'), fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(evidenceDirectory, 'mobile.png'), fullPage: true });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      'mobile fixture should not overflow horizontally'
    );
    assert.deepEqual(
      browserErrors,
      [],
      'the clean installed fixture must have no browser exceptions'
    );
    assert.deepEqual(
      failedRequests,
      [],
      'the clean installed fixture must have no failed requests'
    );
    assert.deepEqual(
      failedResponses,
      [],
      'the clean installed fixture must have no failed HTTP responses'
    );
    console.log(
      JSON.stringify(
        {
          status: 'PASS',
          fixture: fixtureRoot,
          sourceFiles: 2,
          routes: projectManifest.screens.map(({ slug }) => slug),
          patchSafety: patchResult.safety,
          patchChangedOnlyDeclaredClass: true,
          isolatedInstall: true,
          productionBuild: 'PASS',
          browser: {
            httpStatus: response?.status(),
            exceptions: browserErrors,
            failedRequests,
            failedResponses,
            keyboardInteraction: 'PASS',
            mobile390: 'PASS',
          },
          screenshots: [
            path.join(evidenceDirectory, 'desktop.png'),
            path.join(evidenceDirectory, 'mobile.png'),
          ],
        },
        null,
        2
      )
    );
  } finally {
    await browser.close();
    preview.kill();
    await once(preview, 'exit').catch(() => undefined);
  }
}

fs.mkdirSync(evidenceDirectory, { recursive: true });
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
