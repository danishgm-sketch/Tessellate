import { afterEach, describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  discoverResources,
  loadManifest,
  loadJsonManifest,
  validateResource,
  buildCatalogueFromDirectory,
  buildCatalogueArtifact,
  isApprovedLicense,
  validateLicense,
  isGoldResource,
} from '../index.js';

describe('Catalogue Foundation & Validator', () => {
  const rootResourcesDir = path.resolve(__dirname, '../../../../resources');
  const buttonDir = path.join(rootResourcesDir, 'primitives', 'button');
  const buttonManifestPath = path.join(buttonDir, 'manifest.json');
  let temporaryDirectory: string | undefined;

  afterEach(() => {
    if (temporaryDirectory) {
      fs.rmSync(temporaryDirectory, { recursive: true, force: true });
      temporaryDirectory = undefined;
    }
  });

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

  it('rejects resource files that resolve through a symlink outside their directory', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-catalog-path-'));
    const resourceDir = path.join(temporaryDirectory, 'resource');
    const externalDir = path.join(temporaryDirectory, 'external');
    fs.mkdirSync(resourceDir, { recursive: true });
    fs.mkdirSync(externalDir, { recursive: true });
    fs.writeFileSync(path.join(externalDir, 'secret.tsx'), "import 'unlisted-private-package';");
    fs.symlinkSync(
      externalDir,
      path.join(resourceDir, 'external'),
      process.platform === 'win32' ? 'junction' : 'dir'
    );

    const manifest = loadJsonManifest(buttonManifestPath);
    const modified = {
      ...manifest,
      files: [{ path: 'external/secret.tsx', kind: 'component' as const, required: true }],
    };

    const result = validateResource(resourceDir, modified);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('resolves outside the resource directory'))).toBe(true);
  });

  it('rejects a symlink passed as the catalogue root instead of traversing its target', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-catalog-root-link-'));
    const actualRoot = path.join(temporaryDirectory, 'actual-resources');
    const resourceDirectory = path.join(actualRoot, 'category', 'button');
    const linkedRoot = path.join(temporaryDirectory, 'resources-link');
    fs.mkdirSync(resourceDirectory, { recursive: true });
    fs.writeFileSync(path.join(resourceDirectory, 'manifest.json'), '{}');
    fs.symlinkSync(actualRoot, linkedRoot, process.platform === 'win32' ? 'junction' : 'dir');

    expect(() => discoverResources(linkedRoot)).toThrow(/root.*symlink/i);
  });

  it('rejects a symlink passed as an individual resource directory', () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-catalog-resource-root-link-'));
    const actualDirectory = path.join(temporaryDirectory, 'actual-resource');
    const linkedDirectory = path.join(temporaryDirectory, 'resource-link');
    fs.cpSync(buttonDir, actualDirectory, { recursive: true });
    fs.symlinkSync(actualDirectory, linkedDirectory, process.platform === 'win32' ? 'junction' : 'dir');

    const result = validateResource(linkedDirectory, loadJsonManifest(path.join(actualDirectory, 'manifest.json')));
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes('Resource directory cannot be a symlink'))).toBe(true);
  });

  it('does not execute a contributed JavaScript manifest during catalogue loading', async () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-catalog-executable-manifest-'));
    const manifestPath = path.join(temporaryDirectory, 'manifest.js');
    const markerPath = path.join(temporaryDirectory, 'executed.txt');
    const manifest = loadJsonManifest(buttonManifestPath);
    fs.writeFileSync(
      manifestPath,
      `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(markerPath)}, 'executed');\nexport default ${JSON.stringify(manifest)};`,
      'utf-8'
    );

    let loadFailure: unknown;
    try {
      await loadManifest(manifestPath);
    } catch (error) {
      loadFailure = error;
    }
    expect(fs.existsSync(markerPath)).toBe(false);
    expect(String(loadFailure)).toMatch(/static manifest data/i);
  });

  it('loads a static TypeScript manifest without executing a module', async () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-catalog-static-manifest-'));
    const manifestPath = path.join(temporaryDirectory, 'manifest.ts');
    const manifest = loadJsonManifest(buttonManifestPath);
    fs.writeFileSync(
      manifestPath,
      `export const manifest = ${JSON.stringify(manifest)} as const;`,
      'utf-8'
    );

    await expect(loadManifest(manifestPath)).resolves.toEqual(manifest);
  });

  it('retains the discovered resource directory instead of trusting manifest category metadata', async () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-catalog-source-root-'));
    const resourcesRoot = path.join(temporaryDirectory, 'resources');
    const resourceDir = path.join(resourcesRoot, 'button-category', 'button');
    fs.mkdirSync(resourcesRoot, { recursive: true });
    fs.cpSync(buttonDir, resourceDir, { recursive: true });

    const manifestPath = path.join(resourceDir, 'manifest.json');
    const manifest = loadJsonManifest(manifestPath);
    fs.writeFileSync(manifestPath, JSON.stringify({ ...manifest, categories: ['../outside'] }));

    const result = await buildCatalogueFromDirectory(resourcesRoot);
    const builtManifest = result.artifact.resources[0]!;
    const directories = (result as typeof result & {
      resourceDirectories?: Map<typeof builtManifest, string>;
    }).resourceDirectories;

    expect(directories?.get(builtManifest)).toBe(resourceDir);
  });

  it('rejects verified resource with substandard overall quality (<80)', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const modified = {
      ...manifest,
      status: 'verified' as const,
      quality: {
        ...manifest.quality,
        overall: 75,
        assessment: { status: 'reviewed' as const, evidence: ['quality/evidence/review.json'] },
      },
    };

    const result = validateResource(buttonDir, modified);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('overall quality >= 80'))).toBe(true);
  });

  it('does not reject unassessed template scores as if they were a reviewed rating', () => {
    const manifest = loadJsonManifest(buttonManifestPath);
    const modified = {
      ...manifest,
      status: 'verified' as const,
      quality: {
        ...manifest.quality,
        overall: 0,
        assessment: { status: 'unassessed' as const, evidence: [] },
      },
    };

    const result = validateResource(buttonDir, modified);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('keeps accessibility verification claims limited to browser-certified Gold resources', () => {
    const discovered = discoverResources(rootResourcesDir);
    expect(discovered).toHaveLength(324);

    const unsupportedClaims: string[] = [];
    for (const resource of discovered) {
      const manifest = loadJsonManifest(resource.manifestPath);
      expect(manifest.quality.assessment.status, `${manifest.slug} quality score status`).toBe('unassessed');
      expect(manifest.accessibility.levelTarget, `${manifest.slug} WCAG target`).toBe('AA');
      if (isGoldResource(manifest.slug)) {
        expect(manifest.accessibility.keyboardVerified, `${manifest.slug} keyboard check`).toBe(true);
        expect(manifest.accessibility.reducedMotionVerified, `${manifest.slug} reduced-motion check`).toBe(true);
        continue;
      }
      const verifiedClaims = Object.entries(manifest.accessibility)
        .filter(([key, value]) => key !== 'levelTarget' && key !== 'knownLimitations' && value === true)
        .map(([key]) => key);
      if (verifiedClaims.length > 0) {
        unsupportedClaims.push(`${manifest.slug}: ${verifiedClaims.join(', ')}`);
      }
    }

    expect(unsupportedClaims).toEqual([]);
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
