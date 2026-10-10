import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import { loadJsonManifest } from '@tessellate/catalog';
import { generateRegistryItem, generateRegistryIndex } from '../index.js';

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
