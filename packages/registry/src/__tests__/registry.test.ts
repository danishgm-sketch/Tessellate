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
});
