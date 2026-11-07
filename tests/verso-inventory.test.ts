import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { assertPrivatePaths, buildVersoInventory, parseVersoMetadata } from '../scripts/verso-inventory.js';

const temporaryDirectories: string[] = [];

function makeTemporaryDirectory(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('Verso static source inventory', () => {
  it('reads static metadata and exports without importing or executing the component module', () => {
    const source = `
      export const meta = {
        id: 'sample-card', name: 'Sample Card', component: 'SampleCard',
        summary: 'A reusable card for a product workspace.', lineage: ['new'], tags: ['card']
      } as const;
      export function SampleCard() { return null; }
    `;

    expect(parseVersoMetadata(source)).toEqual({
      ok: true,
      metadata: {
        id: 'sample-card', name: 'Sample Card', component: 'SampleCard',
        summary: 'A reusable card for a product workspace.', lineage: ['new'], tags: ['card'], mix: [],
      },
      exportedNames: ['meta', 'SampleCard'],
    });
  });

  it('rejects executable metadata expressions without invoking them', () => {
    const before = (globalThis as typeof globalThis & { __versoInventoryExecuted?: boolean }).__versoInventoryExecuted;
    const result = parseVersoMetadata(`
      (globalThis as any).__versoInventoryExecuted = true;
      export const meta = makeMetadata();
      export function SampleCard() { return null; }
    `);
    expect(result).toEqual({ ok: false, reason: 'Exported meta is not a static object literal; source was not executed.' });
    expect((globalThis as typeof globalThis & { __versoInventoryExecuted?: boolean }).__versoInventoryExecuted).toBe(before);
  });

  it('resolves Verso hybrid lineage from statically imported metadata without executing modules', () => {
    const result = parseVersoMetadata(`
      import { meta as baseMeta } from '../objects/base';
      export const meta = {
        id: 'hybrid-card', name: 'Hybrid Card', component: 'HybridCard',
        summary: 'A coordinated card.', lineage: lineageOf(baseMeta), mix: ['BaseCard']
      } as const;
      export function HybridCard() { return null; }
    `, 'hybrid.tsx', (name) => name === 'baseMeta' ? ['wen:base-card'] : undefined);
    expect(result).toMatchObject({ ok: true, metadata: { lineage: ['wen:base-card'], mix: ['BaseCard'] } });
  });

  it('rejects missing and malformed metadata fields', () => {
    expect(parseVersoMetadata(`export const meta = { id: 'x' };`)).toEqual({
      ok: false,
      reason: 'Metadata is missing a required string field.',
    });
    expect(parseVersoMetadata(`export const meta = { id: 'x', name: 'X', component: 'X', summary: 'X', lineage: ['source', 2] };`)).toEqual({
      ok: false,
      reason: 'Metadata lineage must be a static string array.',
    });
  });

  it('inventories a fixture and reports its actual source contract and catalogue overlap', () => {
    const repositoryRoot = makeTemporaryDirectory('tessellate-verso-repo-');
    const sourceRoot = makeTemporaryDirectory('verso-source-');
    const outputDirectory = makeTemporaryDirectory('verso-private-output-');
    const collection = path.join(sourceRoot, 'src', 'fields');
    fs.mkdirSync(collection, { recursive: true });
    fs.writeFileSync(path.join(sourceRoot, 'package.json'), JSON.stringify({ name: 'verso-local', version: '1.0.0', license: 'UNLICENSED' }));
    fs.writeFileSync(path.join(collection, 'sample-card.tsx'), `
      export const meta = { id: 'sample-card', name: 'Sample Card', component: 'SampleCard', summary: 'A workspace card with an action button.', lineage: ['new'], tags: ['card'] } as const;
      export function SampleCard({ title, onOpen }: { title: string; onOpen?: () => void }) {
        return <button aria-label={title} onClick={onOpen}>{title}</button>;
      }
    `);
    const cataloguePath = path.join(outputDirectory, 'catalog.json');
    fs.writeFileSync(cataloguePath, JSON.stringify({ resources: [{ slug: 'workspace-card', name: 'Workspace Card', description: 'Reusable card for a workspace', categories: ['component'], roles: ['content-panel'], tags: ['card'] }] }));

    const inventory = buildVersoInventory({
      repositoryRoot,
      sourceRoot,
      outputPath: path.join(outputDirectory, 'inventory.json'),
      cataloguePath,
    });

    expect(inventory.totals.declaredResources).toBe(1);
    expect(inventory.totals.byCollection.fields).toBe(1);
    expect(inventory.resources[0]).toMatchObject({
      id: 'sample-card',
      sourcePath: 'src/fields/sample-card.tsx',
      exportedComponent: true,
      integrationStatus: 'local-source-inventoried',
      certification: 'unverified',
      redistributionStatus: 'blocked-unlicensed',
    });
    expect(inventory.resources[0].props).toEqual([
      { name: 'onOpen', type: '() => void', required: false },
      { name: 'title', type: 'string', required: true },
    ]);
    expect(inventory.resources[0].signals.eventProps).toEqual(['onClick']);
    expect(inventory.resources[0].similarTessellateResources[0]?.slug).toBe('workspace-card');
  });

  it('refuses repository or source paths for private source and report output', () => {
    const repositoryRoot = makeTemporaryDirectory('tessellate-verso-repo-');
    const sourceRoot = makeTemporaryDirectory('verso-source-');
    const privateOutput = makeTemporaryDirectory('verso-private-output-');

    expect(() => assertPrivatePaths(repositoryRoot, sourceRoot, path.join(repositoryRoot, 'leak.json'))).toThrow(/must stay outside/);
    expect(() => assertPrivatePaths(repositoryRoot, sourceRoot, path.join(sourceRoot, 'leak.json'))).toThrow(/must stay outside/);
    expect(() => assertPrivatePaths(repositoryRoot, repositoryRoot, path.join(privateOutput, 'inventory.json'))).toThrow(/must stay outside/);
  });
});
