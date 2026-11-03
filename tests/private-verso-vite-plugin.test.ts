import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

type PrivatePlugin = {
  config: (userConfig: Record<string, unknown>, environment: { command: 'serve' | 'build' }) => {
    server?: { host?: string; fs?: { allow?: string[] } };
  } | undefined;
  configResolved?: (config: { command: string; server: { host?: string | boolean } }) => void;
  configureServer?: (server: { middlewares: { use: (middleware: (...args: unknown[]) => unknown) => void } }) => void;
};

type PrivatePluginOptions = {
  serveCatalogOverlay?: boolean;
  exposeSourceModules?: boolean;
};

const { privateVersoVitePlugin } = createRequire(import.meta.url)(
  '../apps/site/src/integrations/private-verso-vite-plugin.mjs',
) as {
  privateVersoVitePlugin: (
    root: string,
    options: PrivatePluginOptions,
  ) => PrivatePlugin;
};

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const previousPrivateFlag = process.env.TESSELLATE_PRIVATE_VERSO;
const previousProjectionPath = process.env.TESSELLATE_PRIVATE_VERSO_PROJECTION;
const temporaryRoots = [];

function makePrivateProjection(options: PrivatePluginOptions = { serveCatalogOverlay: true }) {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tessellate-private-source-'));
  temporaryRoots.push(sourceRoot);
  const componentPath = 'src/card.tsx';
  const absoluteComponentPath = path.join(sourceRoot, componentPath);
  fs.mkdirSync(path.dirname(absoluteComponentPath), { recursive: true });
  fs.writeFileSync(absoluteComponentPath, 'export function Card() { return null; }\n');

  const sourceHash = createHash('sha256').update(fs.readFileSync(absoluteComponentPath)).digest('hex');
  const closureHash = createHash('sha256').update(`${componentPath}\0${sourceHash}`).digest('hex');
  const projectionPath = path.join(sourceRoot, 'projection.json');
  fs.writeFileSync(projectionPath, JSON.stringify({
    license: 'UNLICENSED',
    sourceRoot,
    publicCatalogue: { projectedOverlayCount: 1 },
    records: [{
      manifest: { slug: 'verso-test-card', license: { redistributionVerified: false } },
      integration: {
        status: 'local-private-adaptation-candidate',
        certification: 'unverified',
        redistribution: 'blocked-unlicensed',
      },
      source: {
        id: 'test-card',
        path: componentPath,
        sourceExport: 'Card',
        sha256: closureHash,
        sourceFiles: [{ path: componentPath, sha256: sourceHash }],
        props: [],
      },
    }],
  }));

  process.env.TESSELLATE_PRIVATE_VERSO = '1';
  process.env.TESSELLATE_PRIVATE_VERSO_PROJECTION = projectionPath;
  return { sourceRoot, plugin: privateVersoVitePlugin(repositoryRoot, options) };
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
  if (previousPrivateFlag === undefined) delete process.env.TESSELLATE_PRIVATE_VERSO;
  else process.env.TESSELLATE_PRIVATE_VERSO = previousPrivateFlag;
  if (previousProjectionPath === undefined) delete process.env.TESSELLATE_PRIVATE_VERSO_PROJECTION;
  else process.env.TESSELLATE_PRIVATE_VERSO_PROJECTION = previousProjectionPath;
});

describe('private Verso Vite isolation', () => {
  it('keeps external source files off the Tessellate application origin', () => {
    const { sourceRoot, plugin } = makePrivateProjection();
    const config = plugin.config({}, { command: 'serve' });

    expect(config.server.host).toBe('127.0.0.1');
    expect(config.server.fs.allow).not.toContain(sourceRoot);
  });

  it('exposes the external source closure only to the dedicated isolated preview app', () => {
    const { sourceRoot, plugin } = makePrivateProjection({ exposeSourceModules: true });
    const config = plugin.config({}, { command: 'serve' });

    expect(config.server.host).toBe('127.0.0.1');
    expect(config.server.fs.allow).toContain(sourceRoot);
  });

  it('blocks direct source-file requests from the Tessellate application origin', () => {
    const { sourceRoot, plugin } = makePrivateProjection();
    const middleware: Array<(...args: unknown[]) => unknown> = [];
    plugin.configureServer!({ middlewares: { use: (handler) => middleware.push(handler) } });
    let statusCode = 200;
    let responseBody = '';
    let continued = false;
    const response = {
      setHeader: () => undefined,
      end: (body: string) => { responseBody = body; },
      get statusCode() { return statusCode; },
      set statusCode(value: number) { statusCode = value; },
    };
    const requestUrl = `/@fs/${sourceRoot.replace(/\\/g, '/')}/src/card.tsx`;

    middleware[0]!({ method: 'GET', url: requestUrl }, response, () => { continued = true; });

    expect(statusCode).toBe(404);
    expect(responseBody).toBe('Not found.');
    expect(continued).toBe(false);
  });

  it('rejects a LAN or wildcard bind after Vite resolves command-line overrides', () => {
    const { plugin } = makePrivateProjection();

    expect(() => plugin.configResolved({ command: 'serve', server: { host: '0.0.0.0' } })).toThrow(/loopback/i);
  });

  it('rejects a production build with the private-source flag enabled', () => {
    const { plugin } = makePrivateProjection();

    expect(() => plugin.config({}, { command: 'build' })).toThrow(/only to the local Astro dev server/i);
  });
});
