import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import {
  discoverResources,
  loadJsonManifest,
  validateResource,
  buildCatalogueArtifact,
  isApprovedLicense,
  validateLicense,
} from '../index.js';

describe('Catalogue Foundation & Validator', () => {
  const rootResourcesDir = path.resolve(__dirname, '../../../../resources');
  const buttonDir = path.join(rootResourcesDir, 'primitives', 'button');
  const buttonManifestPath = path.join(buttonDir, 'manifest.json');

  it('correctly discovers canonical button resource folder', () => {
    const discovered = discoverResources(rootResourcesDir);
    expect(discovered.length).toBeGreaterThanOrEqual(1);

    const buttonResource = discovered.find((r) => r.slug === 'button');
    expect(buttonResource).toBeDefined();
    expect(buttonResource?.format).toBe('json');
  });

  it('loads and parses button manifest against schema', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    expect(manifest.id).toBe('res_primitive_button_01');
    expect(manifest.slug).toBe('button');
    expect(manifest.name).toBe('Button');
    expect(manifest.variants).toHaveLength(3);
    expect(manifest.variants.map((v) => v.id)).toEqual(['quiet', 'expressive', 'nocturne']);
  });

  it('validates canonical button resource with zero errors', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const result = validateResource(buttonDir, manifest);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.manifest).toBeDefined();
  });

  it('rejects resource with unapproved license SPDX', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const modified = {
      ...manifest,
      license: {
        ...manifest.license,
        spdx: 'GPL-3.0-only',
      },
    };

    const result = validateResource(buttonDir, modified);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('approved allowlist'))).toBe(true);
  });

  it('rejects resource with missing required files', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const modified = {
      ...manifest,
      files: [
        ...manifest.files,
        { path: 'non-existent-file.tsx', kind: 'component' as const, required: true },
      ],
    };

    const result = validateResource(buttonDir, modified);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Required file missing'))).toBe(true);
  });

  it('rejects verified resource with substandard overall quality (<80)', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const modified = {
      ...manifest,
      status: 'verified' as const,
      quality: {
        ...manifest.quality,
        overall: 75,
      },
    };

    const result = validateResource(buttonDir, modified);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('overall quality >= 80'))).toBe(true);
  });

  it('builds a deterministic flattened catalogue artifact', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const artifact = buildCatalogueArtifact([manifest]);

    expect(artifact.schemaVersion).toBe('1.0.0');
    expect(artifact.count).toBe(1);
    expect(artifact.resources[0]?.slug).toBe('button');
  });

  it('validates license helper accurately', () => {
    expect(isApprovedLicense('MIT')).toBe(true);
    expect(isApprovedLicense('Apache-2.0')).toBe(true);
    expect(isApprovedLicense('CC-BY-NC-4.0')).toBe(false);

    expect(
      validateLicense({
        spdx: 'MIT',
        name: 'MIT',
        redistributionVerified: true,
        attributionRequired: false,
      }).valid
    ).toBe(true);

    expect(
      validateLicense({
        spdx: 'MIT',
        name: 'MIT',
        redistributionVerified: false,
        attributionRequired: false,
      }).valid
    ).toBe(false);
  });
});
