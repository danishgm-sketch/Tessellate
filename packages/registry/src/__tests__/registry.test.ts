import { afterEach, describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { loadJsonManifest } from '@tessellate/catalog';
import { validResourceFixture } from '@tessellate/schemas';
import { generateRegistryItem, generateRegistryIndex } from '../index.js';

let temporaryDirectory: string | undefined;

afterEach(() => {
  if (temporaryDirectory) {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = undefined;
  }
});

describe('Registry Generation', () => {
  const rootResourcesDir = path.resolve(__dirname, '../../../../resources');
  const buttonDir = path.join(rootResourcesDir, 'primitives', 'button');
  const buttonManifestPath = path.join(buttonDir, 'manifest.json');

  it('generates a valid shadcn-compatible RegistryItem from Button manifest', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const item = generateRegistryItem(manifest, buttonDir);

    expect(item.$schema).toContain('registry-item.json');
    expect(item.name).toBe('button');
    expect(item.type).toBe('registry:ui');
    expect(item.title).toBe('Button');
    expect(item.files.length).toBeGreaterThanOrEqual(1);

    const indexFile = item.files.find((f) => f.path === 'index.tsx');
    expect(indexFile).toBeDefined();
    expect(indexFile?.content).toContain('export const Button');
    expect(indexFile?.target).toBe('components/ui/index.tsx');
  });

  it('generates a registry index containing all items', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const item = generateRegistryItem(manifest, buttonDir);
    const index = generateRegistryIndex([item]);

    expect(index.$schema).toContain('registry.json');
    expect(index.name).toBe('tessellate');
    expect(index.items).toHaveLength(1);
    expect(index.items[0]?.name).toBe('button');
    expect(index.items[0]?.type).toBe('registry:ui');
  });

  it('rejects a resource file path that escapes the resource directory', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-registry-path-'));
    const resourceDir = path.join(temporaryDirectory, 'resources', 'button');
    const externalFile = path.join(temporaryDirectory, 'secret.tsx');
    fs.mkdirSync(resourceDir, { recursive: true });
    fs.writeFileSync(externalFile, 'export const Secret = "must not be published";');

    const hostileManifest = {
      ...validResourceFixture,
      files: [{ path: '../../secret.tsx', kind: 'component' as const, required: true }],
    };

    expect(() => generateRegistryItem(hostileManifest, resourceDir)).toThrow(
      /escapes the resource directory/i
    );
  });

  it('rejects resource files that resolve through a symlink outside their directory', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-registry-link-'));
    const resourceDir = path.join(temporaryDirectory, 'resource');
    const externalDir = path.join(temporaryDirectory, 'external');
    fs.mkdirSync(resourceDir, { recursive: true });
    fs.mkdirSync(externalDir, { recursive: true });
    fs.writeFileSync(path.join(externalDir, 'secret.tsx'), 'export const Secret = "private";');
    fs.symlinkSync(
      externalDir,
      path.join(resourceDir, 'external'),
      process.platform === 'win32' ? 'junction' : 'dir'
    );

    const hostileManifest = {
      ...validResourceFixture,
      files: [{ path: 'external/secret.tsx', kind: 'component' as const, required: true }],
    };

    expect(() => generateRegistryItem(hostileManifest, resourceDir)).toThrow(
      /resolves outside the resource directory/i
    );
  });

  it('rejects a symlink passed as the resource directory root', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-registry-root-link-'));
    const actualDirectory = path.join(temporaryDirectory, 'actual-resource');
    const linkedDirectory = path.join(temporaryDirectory, 'resource-link');
    fs.mkdirSync(actualDirectory, { recursive: true });
    fs.writeFileSync(path.join(actualDirectory, 'index.tsx'), 'export const Secret = "private";');
    fs.symlinkSync(actualDirectory, linkedDirectory, process.platform === 'win32' ? 'junction' : 'dir');

    expect(() => generateRegistryItem(validResourceFixture, linkedDirectory)).toThrow(
      /resource directory cannot be a symlink/i
    );
  });

  it('rejects a symlink root when only the index fallback could provide source', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-registry-root-fallback-link-'));
    const actualDirectory = path.join(temporaryDirectory, 'actual-resource');
    const linkedDirectory = path.join(temporaryDirectory, 'resource-link');
    fs.mkdirSync(actualDirectory, { recursive: true });
    fs.writeFileSync(path.join(actualDirectory, 'index.tsx'), 'export const Secret = "private";');
    fs.symlinkSync(actualDirectory, linkedDirectory, process.platform === 'win32' ? 'junction' : 'dir');

    const assetOnlyManifest = {
      ...validResourceFixture,
      files: [{ path: 'preview.png', kind: 'asset' as const, required: false }],
    };

    expect(() => generateRegistryItem(assetOnlyManifest, linkedDirectory)).toThrow(
      /resource directory cannot be a symlink/i
    );
  });

  it('generates llms.txt and llms-full.txt conforming to standard specifications', async () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const mockCatalog = {
      schemaVersion: '1.0.0',
      catalogVersion: '0.1.0',
      generatedAt: new Date().toISOString(),
      count: 1,
      resources: [manifest],
    };

    const { generateLlmsTxt, generateLlmsFullTxt } = await import('../llms-generator.js');
    const llmsTxt = generateLlmsTxt(mockCatalog);
    const llmsFullTxt = generateLlmsFullTxt(mockCatalog);

    expect(llmsTxt).toContain('# Tessellate');
    expect(llmsTxt).toContain('10-Dimensional Design DNA');
    expect(llmsTxt).toContain('tess add');
    expect(llmsTxt).toContain('Button');

    expect(llmsFullTxt).toContain('Semantic Token Contract');
    expect(llmsFullTxt).toContain('--tess-canvas');
    expect(llmsFullTxt).toContain('--tess-ink');
    expect(llmsFullTxt).toContain(manifest.name);
  });

  it('generates complete OpenAPI 3.1 specification for Tessellate API', async () => {
    const { generateOpenApiSpec } = await import('../openapi-generator.js');
    const spec = generateOpenApiSpec();

    expect(spec.openapi).toBe('3.1.0');
    expect((spec.info as { title: string }).title).toBe('Tessellate Platform API');
    expect(spec.paths).toHaveProperty('/health');
    expect(spec.paths).toHaveProperty('/api/me');
    expect(spec.paths).toHaveProperty('/api/projects');
    expect(spec.paths).toHaveProperty('/api/published/{slug}');
    expect(spec.paths).toHaveProperty('/api/favorites');
    expect(spec.paths).toHaveProperty('/api/collections');
    expect(spec.paths).toHaveProperty('/api/reports');
  });
});
