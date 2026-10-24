import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { calculateRouteBundle } from '../scripts/audit-bundle-budgets';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

function createAstroFixture(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tessellate-bundle-budget-'));
  temporaryDirectories.push(directory);
  return path.join(directory, '_astro');
}

function writeAsset(astroDir: string, name: string, source: string): void {
  fs.mkdirSync(astroDir, { recursive: true });
  fs.writeFileSync(path.join(astroDir, name), source);
}

describe('route bundle budget calculation', () => {
  it('counts eager Astro islands and their static imports, but not deferred islands or dynamic imports', () => {
    const astroDir = createAstroFixture();
    writeAsset(astroDir, 'framework.js', 'export const render = true;');
    writeAsset(astroDir, 'root.js', 'import { value } from "./shared.js"; import("./lazy.js"); console.log(value);');
    writeAsset(astroDir, 'shared.js', 'export { value } from "./leaf.js";');
    writeAsset(astroDir, 'leaf.js', 'export const value = 42;');
    writeAsset(astroDir, 'lazy.js', 'throw new Error("loaded too early");');
    writeAsset(astroDir, 'visible.js', 'throw new Error("visible island included");');

    const html = [
      '<astro-island component-url="/_astro/root.js" renderer-url="/_astro/framework.js" client="load"></astro-island>',
      '<astro-island component-url="/_astro/visible.js" renderer-url="/_astro/framework.js" client="visible"></astro-island>',
    ].join('');
    const report = calculateRouteBundle(html, astroDir);

    expect(report.assets).toEqual(['framework.js', 'leaf.js', 'root.js', 'shared.js']);
    expect(report.missingAssets).toEqual([]);
    expect(report.gzipBytes).toBeGreaterThan(0);
  });

  it('reports a missing eager chunk instead of silently passing a route without a bundle', () => {
    const astroDir = createAstroFixture();
    const html = '<astro-island component-url="/_astro/missing.js" renderer-url="/_astro/framework.js" client="only"></astro-island>';

    const report = calculateRouteBundle(html, astroDir);

    expect(report.assets).toEqual([]);
    expect(report.missingAssets).toEqual(['framework.js', 'missing.js']);
  });

  it('includes standalone scripts even when a route has no hydrated islands', () => {
    const astroDir = createAstroFixture();
    writeAsset(astroDir, 'plain.js', 'document.documentElement.dataset.ready = "true";');

    const report = calculateRouteBundle('<script type="module" src="/_astro/plain.js"></script>', astroDir);

    expect(report.assets).toEqual(['plain.js']);
    expect(report.missingAssets).toEqual([]);
  });
});
