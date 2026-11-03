import { describe, expect, it } from 'vitest';
import { ResourceManifestSchema } from '@tessellate/schemas';
import { buildPrivateVersoProjection, projectVersoResource } from '../scripts/adapt-verso-manifests.js';
import type { VersoInventory, VersoInventoryResource } from '../scripts/verso-inventory.js';

const sampleResource: VersoInventoryResource = {
  id: 'team-roster',
  name: 'Team Roster',
  component: 'TeamRoster',
  sourceExport: 'TeamRoster',
  summary: 'A searchable list of people grouped by team.',
  functionalPurpose: 'A searchable list of people grouped by team.',
  lineage: ['rbp:app-ui--team-list--team-list-1'],
  tags: ['people', 'roster'],
  mix: [],
  collection: 'desk',
  sourcePath: 'src/desk/people/team-roster.tsx',
  sourceHash: 'a'.repeat(64),
  sourceFiles: [{ path: 'src/desk/people/team-roster.tsx', sha256: 'a'.repeat(64) }],
  exportedComponent: true,
  props: [
    { name: 'people', type: 'Person[]', required: true },
    { name: 'onSelect', type: '(id: string) => void', required: false },
  ],
  slotHints: ['people'],
  imports: { local: ['../../core/utils'], external: ['react'] },
  dependencies: [{ package: 'react', declaredRange: '>=18.2', usage: 'imported' }],
  signals: {
    jsxElements: ['button', 'input'],
    eventProps: ['onClick', 'onChange'],
    ariaAttributes: ['aria-label'],
    roles: [],
    reactHooks: ['useState'],
    browserApis: [],
    visualApis: [],
    responsiveHints: [],
    reducedMotionHints: [],
    visualCharacter: ['serif-display-type'],
    controls: ['button', 'input'],
    statefulPatterns: ['useState', 'jsx-event-handlers'],
    riskSignals: [],
  },
  suggestedSemanticRoles: ['data-list'],
  semanticRoleAssessment: 'heuristic-candidates-only',
  suggestedProductArchetypes: ['business-operations'],
  productArchetypeAssessment: 'heuristic-candidates-only',
  themeRequirements: {
    usesVersoContext: true,
    usesVersoCssTokens: true,
    remoteFontReference: false,
    observedStyleHints: ['Verso CSS custom properties'],
    assessment: 'not-adapted-to-tessellate-dna',
  },
  interactionAssessment: 'source-signals-only-not-tested',
  performanceAssessment: 'source-signals-only-not-profiled',
  accessibilityAssessment: 'source-signals-only-not-audited',
  responsivenessAssessment: 'source-signals-only-not-tested',
  previewSupport: 'not-integrated',
  exportSupport: 'not-integrated',
  provenance: {
    sourcePath: 'src/desk/people/team-roster.tsx',
    sourceHash: 'a'.repeat(64),
    declaredLineage: ['rbp:app-ui--team-list--team-list-1'],
    sourcePackageLicense: 'UNLICENSED',
    redistribution: 'blocked-unlicensed',
  },
  similarTessellateResources: [{ slug: 'team-management', score: 0.2 }],
  integrationStatus: 'local-source-inventoried',
  certification: 'unverified',
  redistributionStatus: 'blocked-unlicensed',
  blockers: ['Source distribution is blocked until the Verso license and upstream lineage rights are resolved.'],
};

describe('private Verso ResourceManifest adapter', () => {
  it('maps one component through Tessellate schema while preserving unknown legal and runtime states', () => {
    const manifest = projectVersoResource(sampleResource, 'UNLICENSED', '2026-11-02T12:00:00.000Z');
    expect(ResourceManifestSchema.parse(manifest)).toEqual(manifest);
    expect(manifest).toMatchObject({
      slug: 'verso-desk-team-roster',
      resourceType: 'block',
      status: 'experimental',
      license: { spdx: 'UNLICENSED', redistributionVerified: false, attributionRequired: 'unknown' },
      provenance: { origin: 'unknown', derivative: 'unknown' },
      accessibility: { levelTarget: 'none', keyboardVerified: false },
      responsive: { verifiedWidths: [] },
      quality: { overall: 0, assessment: { status: 'unassessed' } },
    });
    expect(manifest.slots.map(({ id, type }) => ({ id, type }))).toEqual([
      { id: 'people', type: 'items' },
      { id: 'onSelect', type: 'action' },
    ]);
  });

  it('projects all inventory entries but keeps the overlay private and uncertified', () => {
    const inventory = {
      schemaVersion: 1,
      generatedAt: '2026-11-02T12:00:00.000Z',
      source: {
        root: 'C:/private/verso', packageName: 'verso', packageVersion: '1.0.0', license: 'UNLICENSED', archive: null, archiveSha256: null,
      },
      tessellateCatalogue: { path: null, count: 324 },
      totals: { declaredResources: 1, byCollection: { desk: 1 }, staticMetadataFailures: 0, duplicateIds: [] },
      resources: [sampleResource],
      warnings: [],
    } satisfies VersoInventory;

    const result = buildPrivateVersoProjection(inventory);
    expect(result.publicCatalogue).toEqual({ baseCount: 324, projectedOverlayCount: 1 });
    expect(result.records[0]?.integration).toMatchObject({
      status: 'local-private-adaptation-candidate',
      certification: 'unverified',
      redistribution: 'blocked-unlicensed',
    });
    expect(result.records[0]?.source.props).toEqual(sampleResource.props);
  });

  it('rejects an unexpected source license state instead of inferring permission', () => {
    const inventory = {
      schemaVersion: 1,
      generatedAt: '2026-11-02T12:00:00.000Z',
      source: {
        root: 'C:/private/verso', packageName: 'verso', packageVersion: '1.0.0', license: 'MIT', archive: null, archiveSha256: null,
      },
      tessellateCatalogue: { path: null, count: 324 },
      totals: { declaredResources: 1, byCollection: { desk: 1 }, staticMetadataFailures: 0, duplicateIds: [] },
      resources: [sampleResource],
      warnings: [],
    } satisfies VersoInventory;
    expect(() => buildPrivateVersoProjection(inventory)).toThrow(/Unexpected source license/);
  });
});
