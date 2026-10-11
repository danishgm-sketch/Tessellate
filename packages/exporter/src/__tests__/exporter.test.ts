import { describe, it, expect } from 'vitest';
import { unzipSync, strFromU8 } from 'fflate';
import {
  exportProjectManifestToJson,
  importProjectManifestFromJson,
  collectProjectDependencies,
  generateSourceTree,
  createZipArchive,
  generateAgentHandoffPackage,
  validatePreExport,
} from '../index.js';
import { validProjectFixture, type ProjectManifest } from '@tessellate/schemas';

function createTestManifest(): ProjectManifest {
  const manifest = JSON.parse(JSON.stringify(validProjectFixture)) as ProjectManifest;
  manifest.name = 'Exporter Test App';
  manifest.designDNA.motion = 45; // Test motion dependency inclusion
  return manifest;
}

describe('Phase 11: Exporter Package', () => {
  it('exports and imports .tess.json with roundtrip fidelity', () => {
    const original = createTestManifest();
    const jsonStr = exportProjectManifestToJson(original);
    expect(jsonStr).toContain('"name": "Exporter Test App"');

    const importRes = importProjectManifestFromJson(jsonStr);
    expect(importRes.success).toBe(true);
    expect(importRes.manifest).toBeDefined();
    expect(importRes.manifest?.id).toBe(original.id);
    expect(importRes.manifest?.screens.length).toBe(1);
    expect(importRes.manifest?.designDNA.primaryArchetype).toBe('analytics');
  });

  it('handles invalid or corrupted JSON gracefully in manifest import', () => {
    const invalidJson = '{ bad-json, not-valid }';
    const result = importProjectManifestFromJson(invalidJson);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Malformed JSON');

    const schemaInvalid = JSON.stringify({ name: 'Incomplete' });
    const schemaResult = importProjectManifestFromJson(schemaInvalid);
    expect(schemaResult.success).toBe(false);
    expect(schemaResult.error).toContain('Validation failed');
  });

  it('collects runtime and devDependencies accurately', () => {
    const manifest = createTestManifest();
    const { dependencies, devDependencies } = collectProjectDependencies(manifest);

    expect(dependencies['react']).toBe('^19.0.0');
    expect(dependencies['react-dom']).toBe('^19.0.0');
    expect(dependencies['lucide-react']).toBeDefined();
    expect(dependencies['motion']).toBeDefined(); // motion=45 > 40
    expect(devDependencies['tailwindcss']).toBe('^4.0.0');
    expect(devDependencies['vite']).toBeDefined();
  });

  it('generates a complete standalone source tree', () => {
    const manifest = createTestManifest();
    const tree = generateSourceTree(manifest);

    expect(tree['package.json']).toBeDefined();
    expect(tree['vite.config.ts']).toBeDefined();
    expect(tree['tsconfig.json']).toBeDefined();
    expect(tree['index.html']).toBeDefined();
    expect(tree['src/index.css']).toBeDefined();
    expect(tree['src/main.tsx']).toBeDefined();
    expect(tree['src/App.tsx']).toBeDefined();
    expect(tree['src/screens/Overview.tsx']).toBeDefined();
    expect(tree['src/components/MetricCard.tsx']).toBeDefined();
    expect(tree['src/components/AppHeader.tsx']).toBeDefined();
    expect(tree['src/components/Button.tsx']).toBeDefined();
    expect(tree['README.md']).toBeDefined();

    // Verify package.json structure
    const pkg = JSON.parse(tree['package.json']!);
    expect(pkg.name).toBe('exporter-test-app');
    expect(pkg.scripts.dev).toBe('vite');

    // Verify index.css contains Tailwind 4 import and CSS vars
    expect(tree['src/index.css']).toContain('@import "tailwindcss";');
    expect(tree['src/index.css']).toContain('--tess-');
  });

  it('creates compressed ZIP archive and preserves all files upon extraction', () => {
    const manifest = createTestManifest();
    const tree = generateSourceTree(manifest);

    const zipBuffer = createZipArchive(tree);
    expect(zipBuffer).toBeInstanceOf(Uint8Array);
    expect(zipBuffer.length).toBeGreaterThan(0);

    // Decompress and verify
    const unzipped = unzipSync(zipBuffer);
    const unzippedPaths = Object.keys(unzipped);

    expect(unzippedPaths).toContain('package.json');
    expect(unzippedPaths).toContain('src/App.tsx');
    expect(unzippedPaths).toContain('src/screens/Overview.tsx');

    const pkgText = strFromU8(unzipped['package.json']!);
    const parsedPkg = JSON.parse(pkgText);
    expect(parsedPkg.name).toBe('exporter-test-app');
  });

  it('generates structured agent handoff package with intent, locks, and DNA', () => {
    const manifest = createTestManifest();
    const handoff = generateAgentHandoffPackage(manifest);

    expect(handoff.files['PROJECT_DNA.json']).toBeDefined();
    expect(handoff.files['manifest.tess.json']).toBeDefined();
    expect(handoff.files['AGENT_BRIEF.md']).toBeDefined();

    const brief = handoff.files['AGENT_BRIEF.md']!;
    expect(brief).toContain('AGENT BRIEF — Exporter Test App');
    expect(brief).toContain('Accessibility Floor:** Target WCAG AA');
    expect(brief).toContain('### Overview (`overview`)');
  });

  it('validates pre-export requirements and surfaces actionable issues', () => {
    const manifest = createTestManifest();
    const validCheck = validatePreExport(manifest);
    expect(validCheck.canExport).toBe(true);
    expect(validCheck.errors).toHaveLength(0);

    // Project with duplicate route slugs and missing screens
    const invalidManifest = {
      ...manifest,
      screens: [
        { ...manifest.screens[0]!, slug: 'same-route' },
        { ...manifest.screens[0]!, id: 'screen-2', name: 'Dup', slug: 'same-route' },
      ],
    };

    const duplicateCheck = validatePreExport(invalidManifest);
    expect(duplicateCheck.canExport).toBe(false);
    expect(duplicateCheck.errors.some((e) => e.includes('Duplicate screen route slug'))).toBe(true);

    // Empty screens
    const noScreens = { ...manifest, screens: [] };
    const emptyCheck = validatePreExport(noScreens);
    expect(emptyCheck.canExport).toBe(false);
    expect(emptyCheck.errors.some((e) => e.includes('at least one screen'))).toBe(true);
  });
});
