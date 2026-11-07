import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { findResourceBySlug, getResourceComponentCode, loadMcpCatalogue } from '../catalog-provider.js';

const repoRoot = path.resolve(import.meta.dirname, '../../../..');
const temporaryRoots: string[] = [];

async function writeCatalogue(root: string, catalogVersion: string, resources: unknown[]) {
  const file = path.join(root, 'apps/site/public/data/catalog.json');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify({
    schemaVersion: '1.0.0',
    catalogVersion,
    generatedAt: '2026-10-19T00:00:00.000Z',
    count: resources.length,
    resources,
  }));
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('MCP catalogue loading', () => {
  it('resolves the bundled checkout catalogue and source when an agent launches from another project directory', async () => {
    const externalCwd = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-agent-cwd-'));
    temporaryRoots.push(externalCwd);
    const catalogue = await loadMcpCatalogue(externalCwd);
    expect(catalogue.resources).toHaveLength(324);
    const button = await findResourceBySlug('button', externalCwd);
    expect(button).toBeDefined();
    expect(getResourceComponentCode(button!, externalCwd)).toContain('Button');
  });

  it('keeps local catalogue caches scoped to each working directory', async () => {
    const canonical = await loadMcpCatalogue(repoRoot);
    const button = canonical.resources.find((resource) => resource.slug === 'button');
    expect(button).toBeDefined();

    const rootA = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-catalog-a-'));
    const rootB = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-catalog-b-'));
    temporaryRoots.push(rootA, rootB);
    await Promise.all([
      writeCatalogue(rootA, 'project-a', [button]),
      writeCatalogue(rootB, 'project-b', [button]),
    ]);

    const [catalogueA, catalogueB] = await Promise.all([loadMcpCatalogue(rootA), loadMcpCatalogue(rootB)]);
    expect(catalogueA.catalogVersion).toBe('project-a');
    expect(catalogueB.catalogVersion).toBe('project-b');
    expect(catalogueA.resources.map((resource) => resource.slug)).toEqual(['button']);
    expect(catalogueB.resources.map((resource) => resource.slug)).toEqual(['button']);
  });

  it('rejects malformed local catalogue data instead of returning a synthetic empty catalogue', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-catalog-invalid-'));
    temporaryRoots.push(root);
    const file = path.join(root, 'apps/site/public/data/catalog.json');
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify({
      schemaVersion: '1.0.0',
      catalogVersion: 'invalid',
      generatedAt: '2026-10-19T00:00:00.000Z',
      count: 1,
      resources: [{}],
    }));

    await expect(loadMcpCatalogue(root)).rejects.toThrow(/resource 0 is invalid/);
    expect(JSON.parse(await readFile(file, 'utf8')).resources).toEqual([{}]);
  });

  it('does not follow resource-source symlinks outside the configured checkout', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-source-root-'));
    const outside = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-source-outside-'));
    temporaryRoots.push(root, outside);
    const sourceDir = path.join(outside, 'button');
    const resourceDir = path.join(root, 'resources', 'primitives');
    await mkdir(sourceDir, { recursive: true });
    await mkdir(resourceDir, { recursive: true });
    await writeFile(path.join(sourceDir, 'index.tsx'), 'export const secret = "outside";');
    await symlink(sourceDir, path.join(resourceDir, 'button'), 'junction');

    const button = (await loadMcpCatalogue(repoRoot)).resources.find((resource) => resource.slug === 'button');
    expect(button).toBeDefined();
    const source = getResourceComponentCode({ ...button!, categories: ['primitives'] }, root);
    expect(source).not.toContain('outside');
    expect(source).toContain('Button');
  });

  it('rejects a local catalogue directory symlink that resolves outside the project', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-catalog-link-root-'));
    const outside = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-catalog-link-target-'));
    temporaryRoots.push(root, outside);
    await writeCatalogue(outside, 'outside-project', []);
    const localPublic = path.join(root, 'apps/site/public');
    const outsideData = path.join(outside, 'apps/site/public/data');
    await mkdir(localPublic, { recursive: true });
    await symlink(outsideData, path.join(localPublic, 'data'), 'junction');

    await expect(loadMcpCatalogue(root)).rejects.toThrow(/resolves outside the project/);
  });

  it('rejects resource source files larger than the MCP response limit', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'tess-mcp-source-large-'));
    temporaryRoots.push(root);
    const source = path.join(root, 'resources/primitives/button/index.tsx');
    await mkdir(path.dirname(source), { recursive: true });
    await writeFile(source, Buffer.alloc(256 * 1024 + 1, 'x'));
    const button = (await loadMcpCatalogue(repoRoot)).resources.find((resource) => resource.slug === 'button');
    expect(button).toBeDefined();

    expect(getResourceComponentCode({ ...button!, categories: ['primitives'] }, root)).toBeNull();
  });
});
