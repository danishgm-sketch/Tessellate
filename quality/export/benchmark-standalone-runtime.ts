import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as net from 'node:net';
import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import { once } from 'node:events';
import { chromium, type Browser } from '@playwright/test';
import { composeProjectPipeline } from '../../packages/compatibility/src/compose-pipeline.js';
import { ProjectManifestSchema, type ProjectNode, type ResourceManifest } from '../../packages/schemas/src/index.js';
import { createZipArchive, generateSourceTree } from '../../packages/exporter/src/index.js';
import '../../packages/exporter/src/node-disk-resolver.js';

const requireFromExporter = createRequire(path.resolve('packages/exporter/package.json'));
const { unzipSync } = requireFromExporter('fflate') as { unzipSync: (data: Uint8Array) => Record<string, Uint8Array> };

interface Brief {
  id: string;
  brief: string;
}

interface Benchmark {
  briefs: Brief[];
}

interface ExportResult {
  briefId: string;
  direction: 'A' | 'B' | 'C';
  projectId: string;
  screenCount: number;
  resourceCount: number;
  fileCount: number;
  zipBytes: number;
  install: 'passed' | 'failed';
  build: 'passed' | 'failed' | 'not-run';
  browserDesktop: 'passed' | 'failed' | 'not-run';
  browserMobile: 'passed' | 'failed' | 'not-run';
  consoleErrors: string[];
  consoleWarnings: string[];
  failedRequests: string[];
  httpErrors: string[];
  error?: string;
};

const benchmarkPath = path.resolve('quality/COMPOSITION_QUALITY_BENCHMARK.json');
const cataloguePath = path.resolve('apps/site/public/data/catalog.json');
const evidencePath = path.resolve('quality/evidence/step-23/benchmark-standalone-runtime.json');
const benchmark = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8')) as Benchmark;
const catalog = JSON.parse(fs.readFileSync(cataloguePath, 'utf8')) as { resources: ResourceManifest[] };
const options = new Map(process.argv.slice(2).map((argument, index, args) => [
  argument,
  args[index + 1],
]));
const requestedLimit = Number(options.get('--limit') ?? benchmark.briefs.length);
const workerCount = Math.max(1, Math.min(8, Number(options.get('--jobs') ?? 4)));
if (!Number.isInteger(requestedLimit) || requestedLimit <= 0) throw new Error('Use a positive --limit.');
const briefs = benchmark.briefs.slice(0, requestedLimit);
const directions = ['A', 'B', 'C'] as const;
const results: ExportResult[] = [];
const startedAt = new Date().toISOString();

function walk(node: ProjectNode): ProjectNode[] {
  return [node, ...(node.children ?? []).flatMap(walk)];
}

function writeTree(directory: string, files: Record<string, string>) {
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.resolve(directory, relativePath);
    const relative = path.relative(directory, absolutePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`Generated export path escapes its root: ${relativePath}`);
    }
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf8');
  }
}

function run(command: string, cwd: string): string {
  try {
    return execSync(command, { cwd, encoding: 'utf8', stdio: 'pipe', timeout: 180_000 });
  } catch (error) {
    const result = error as { stdout?: Buffer | string; stderr?: Buffer | string; message?: string };
    throw new Error(`${command} failed\n${String(result.stdout ?? '')}\n${String(result.stderr ?? '')}\n${result.message ?? ''}`);
  }
}

async function availablePort(): Promise<number> {
  const server = net.createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });
  const port = (server.address() as net.AddressInfo).port;
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function startPreview(directory: string): Promise<{ child: ChildProcess; url: string }> {
  const port = await availablePort();
  const viteCli = path.join(directory, 'node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: directory,
    stdio: 'ignore',
    windowsHide: true,
  });
  const url = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Vite preview exited with ${child.exitCode}.`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(800) });
      if (response.ok) return { child, url };
    } catch {
      // The preview server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  child.kill();
  throw new Error('Vite preview did not start within 20 seconds.');
}

async function smokeViewport(browser: Browser, baseUrl: string, project: ExportResult, directionManifest: ReturnType<typeof composeProjectPipeline>['directionA']['manifest'], viewport: { width: number; height: number }, label: 'browserDesktop' | 'browserMobile') {
  const page = await browser.newPage({ viewport });
  const errors: string[] = [];
  const warnings: string[] = [];
  const failed: string[] = [];
  const http: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning') warnings.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(`uncaught: ${error.message}`));
  page.on('requestfailed', (request) => failed.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText ?? 'failed'}`));
  page.on('response', (response) => {
    if (response.status() >= 400) http.push(`${response.status()} ${response.url()}`);
  });
  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 20_000 });
    const screenNavigation = page.getByRole('group', { name: 'Project screens' });
    if (await screenNavigation.getByRole('button').count() !== directionManifest.screens.length) {
      throw new Error(`Screen selector count did not match manifest (${directionManifest.screens.length}).`);
    }
    for (const screen of directionManifest.screens) {
      await screenNavigation.getByRole('button', { name: screen.name, exact: true }).click();
      const activeScreen = page.locator('.tess-screen');
      await activeScreen.waitFor({ state: 'visible' });
      if (await activeScreen.getAttribute('data-screen-id') !== screen.id) {
        throw new Error(`Navigation did not select manifest screen ${screen.id}.`);
      }
      const resourceNodes = walk(screen.rootNode).filter((node) => node.resourceRef?.slug);
      for (const node of resourceNodes) {
        if (await page.locator(`[data-node-id="${node.id}"]`).count() !== 1) {
          throw new Error(`Exported screen ${screen.id} did not render resource node ${node.id} (${node.resourceRef?.slug}).`);
        }
      }
      const body = await page.locator('body').innerText();
      if (body.includes('Unresolved resource:') || await page.locator('[data-testid="missing-resource-recovery"]').count()) {
        throw new Error(`Exported screen ${screen.id} contains an unresolved resource placeholder.`);
      }
    }
    const scrollMetrics = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    if (label === 'browserMobile' && scrollMetrics.scrollWidth > scrollMetrics.width) {
      throw new Error(`Mobile document overflow: ${scrollMetrics.scrollWidth}px > ${scrollMetrics.width}px.`);
    }
    project[label] = 'passed';
  } finally {
    project.consoleErrors.push(...errors);
    project.consoleWarnings.push(...warnings);
    project.failedRequests.push(...failed);
    project.httpErrors.push(...http);
    await page.close();
  }
}

function saveReport() {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  const payload = {
    schemaVersion: '1.0.0',
    benchmark: 'quality/COMPOSITION_QUALITY_BENCHMARK.json',
    source: 'Generated all three manifests per brief with the shared deterministic composition pipeline; each ZIP was extracted to a fresh OS temporary directory, installed without repository node_modules, built, previewed, and exercised in Chromium on desktop and mobile.',
    startedAt,
    updatedAt: new Date().toISOString(),
    expectedBriefs: briefs.length,
    expectedProjects: briefs.length * directions.length,
    completedProjects: results.length,
    failedProjects: results.filter((result) => result.error).length,
    results,
  };
  const temporary = `${evidencePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(payload, null, 2)}\n`);
  fs.renameSync(temporary, evidencePath);
}

async function verifyOne(browser: Browser, brief: Brief, direction: 'A' | 'B' | 'C') {
  const result: ExportResult = {
    briefId: brief.id,
    direction,
    projectId: '',
    screenCount: 0,
    resourceCount: 0,
    fileCount: 0,
    zipBytes: 0,
    install: 'failed',
    build: 'not-run',
    browserDesktop: 'not-run',
    browserMobile: 'not-run',
    consoleErrors: [],
    consoleWarnings: [],
    failedRequests: [],
    httpErrors: [],
  };
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), `tess-${brief.id}-${direction}-`));
  let preview: ChildProcess | undefined;
  try {
    const composition = composeProjectPipeline({ description: brief.brief }, { catalogResources: catalog.resources, seed: `step23-${brief.id}` });
    const output = composition[`direction${direction}` as 'directionA' | 'directionB' | 'directionC'];
    const manifest = ProjectManifestSchema.parse(output.manifest);
    const files = generateSourceTree(manifest);
    const exportedManifest = ProjectManifestSchema.parse(JSON.parse(files['project.tess.json']!));
    if (exportedManifest.id !== manifest.id) throw new Error('Exported project identity did not round-trip.');
    const packageJson = JSON.parse(files['package.json']!) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    if (Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).some((dependency) => dependency.startsWith('@tessellate/'))) {
      throw new Error('Standalone package references a private @tessellate runtime package.');
    }
    const nodes = manifest.screens.flatMap((screen) => walk(screen.rootNode));
    result.projectId = manifest.id;
    result.screenCount = manifest.screens.length;
    result.resourceCount = nodes.filter((node) => node.resourceRef?.slug).length;
    result.fileCount = Object.keys(files).length;
    const zip = createZipArchive(files);
    const extracted = unzipSync(zip);
    if (Object.keys(extracted).length !== Object.keys(files).length) throw new Error('ZIP extraction changed the generated file count.');
    for (const [fileName, contents] of Object.entries(files)) {
      const bytes = extracted[fileName];
      if (!bytes || Buffer.from(bytes).toString('utf8') !== contents) throw new Error(`ZIP round trip changed ${fileName}.`);
    }
    result.zipBytes = zip.byteLength;
    writeTree(tempDirectory, files);

    run('pnpm install --prefer-offline --ignore-scripts --no-frozen-lockfile', tempDirectory);
    result.install = 'passed';
    run('pnpm build', tempDirectory);
    result.build = 'passed';
    const server = await startPreview(tempDirectory);
    preview = server.child;
    await smokeViewport(browser, server.url, result, manifest, { width: 1440, height: 900 }, 'browserDesktop');
    await smokeViewport(browser, server.url, result, manifest, { width: 390, height: 844 }, 'browserMobile');
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  } finally {
    if (preview && preview.exitCode === null) {
      preview.kill();
      await Promise.race([once(preview, 'exit'), new Promise((resolve) => setTimeout(resolve, 5_000))]);
    }
    fs.rmSync(tempDirectory, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
    results.push(result);
    saveReport();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    const queue = briefs.flatMap((brief) => directions.map((direction) => ({ brief, direction })));
    let nextIndex = 0;
    const workers = Array.from({ length: workerCount }, async () => {
      while (nextIndex < queue.length) {
        const item = queue[nextIndex++]!;
        await verifyOne(browser, item.brief, item.direction);
        const last = results.at(-1)!;
        console.log(`${results.length}/${queue.length} ${last.briefId}/${last.direction} ${last.error ? 'FAIL' : 'PASS'}`);
      }
    });
    await Promise.all(workers);
  } finally {
    await browser.close();
  }
  const failed = results.filter((result) => result.error);
  saveReport();
  if (failed.length) {
    console.error(`${failed.length}/${results.length} standalone benchmark exports failed. See ${evidencePath}.`);
    process.exitCode = 1;
  } else {
    console.log(`Verified ${results.length} standalone benchmark exports. Evidence: ${evidencePath}`);
  }
}

void main();
