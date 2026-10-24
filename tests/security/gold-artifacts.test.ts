import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { buildCatalogueFromDirectory } from '@tessellate/catalog';
import { ResourceManifestSchema, validResourceFixture } from '@tessellate/schemas';
import {
  discoverAllComponents,
  generateGoldRendererRegistry,
  generatePreviewsRegistry,
  type DiscoveredGoldComponent,
} from '../../scripts/generate-gold-artifacts.js';

const resourcesRoot = path.resolve(process.cwd(), 'resources');
let linkedCategory: string | undefined;
let externalDirectory: string | undefined;

afterEach(() => {
  if (linkedCategory) {
    fs.rmSync(linkedCategory, { recursive: true, force: true });
    linkedCategory = undefined;
  }
  if (externalDirectory) {
    fs.rmSync(externalDirectory, { recursive: true, force: true });
    externalDirectory = undefined;
  }
});

describe('generated Gold resource artifacts', () => {
  it('uses only resources admitted by canonical catalogue validation', async () => {
    externalDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'tess-gold-external-resource-'));
    linkedCategory = path.join(resourcesRoot, `security-link-fixture-${process.pid}`);
    const resourceDir = path.join(externalDirectory, 'outside-resource');
    const probe = `GOLD_ARTIFACT_SYMLINK_PROBE_${process.pid}`;
    fs.mkdirSync(resourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(resourceDir, 'index.tsx'),
      `export const OutsideResource = () => '${probe}';`,
      'utf-8'
    );
    fs.symlinkSync(
      externalDirectory,
      linkedCategory,
      process.platform === 'win32' ? 'junction' : 'dir'
    );

    const { artifact, resourceDirectories } = await buildCatalogueFromDirectory(resourcesRoot);
    expect(artifact.resources).toHaveLength(324);
    expect(resourceDirectories.size).toBe(324);

    const components = await discoverAllComponents();
    expect(components.some((component) => component.sourceCode.includes(probe))).toBe(false);
  }, 15_000);

  it('serializes validated manifest IDs as data in generated TypeScript registries', () => {
    const maliciousId = `resource': (() => { throw new Error('GOLD_ID_PROBE') })(), 'safe`;
    const manifest = { ...validResourceFixture, id: maliciousId };
    expect(ResourceManifestSchema.safeParse(manifest).success).toBe(true);

    const component: DiscoveredGoldComponent = {
      slug: 'safe-resource',
      id: maliciousId,
      category: 'primitives',
      componentName: 'SafeResource',
      importPath: '../../../resources/primitives/safe-resource/index.js',
      previewName: 'SafeResourcePreview',
      previewImportPathPreviewApp: '../../../resources/primitives/safe-resource/preview.js',
      previewImportPathSite: '../../../../resources/primitives/safe-resource/preview.js',
      sourceCode: 'export const SafeResource = () => null;',
      manifest,
    };
    const expectedKey = `${JSON.stringify(maliciousId)}: `;

    expect(generateGoldRendererRegistry([component])).toContain(`  ${expectedKey}`);
    expect(generatePreviewsRegistry([component], 'site')).toContain(`  ${expectedKey}`);
  });
});
